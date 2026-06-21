/**
 * React Query hooks for gamification — progress tracking, badges, achievements, and experiment completion.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamificationAPI } from "../../../services/api";

export interface UserProgress {
  completed_experiments: string[];
  earned_badges: string[];
  earned_achievements: string[];
  total_xp: number;
  world_progress: Record<string, number>;
  unlocked_worlds: string[];
}

export interface WorldProgress {
  world_id: string;
  completed_experiments: string[];
  total_experiments: number;
  completion_pct: number;
  score: number;
}

export interface Badge {
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  skill: string;
  stage: number;
  unlocked_at?: string;
}

export interface Achievement {
  achievement_id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked_at?: string;
}

export interface CompleteExperimentResult {
  experiment_id: string;
  completed: boolean;
  xp_earned: number;
  total_xp: number;
  rewards: Array<{
    type: string;
    name: string;
    description?: string;
    icon?: string;
    amount?: number;
  }>;
  world_unlocked?: string;
  skills_updated: string[];
}

export interface SkillRating {
  skill_id: string;
  name: string;
  score: number;
  level: string;
  milestones: number[];
}

export interface SkillHistoryEntry {
  date: string;
  skill_name: string;
  score: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  total_xp: number;
  experiments_completed: number;
}

export const progressKeys = {
  all: ["gamification", "progress"] as const,
  world: (worldId: string) => ["gamification", "world", worldId] as const,
  badges: ["gamification", "badges"] as const,
  achievements: ["gamification", "achievements"] as const,
  skills: ["gamification", "skills"] as const,
  leaderboard: ["gamification", "leaderboard"] as const,
  skillHistory: ["gamification", "skillHistory"] as const,
};

export const braincoreKeys = {
  energy: ["braincore", "energy"] as const,
  status: ["braincore", "status"] as const,
};

export function useProgress() {
  return useQuery<UserProgress>({
    queryKey: progressKeys.all,
    queryFn: async () => {
      const res = await gamificationAPI.getProgress();
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function useWorldProgress(worldId: string | undefined) {
  return useQuery<WorldProgress>({
    queryKey: progressKeys.world(worldId ?? ""),
    queryFn: async () => {
      if (!worldId) throw new Error("worldId is required");
      const res = await gamificationAPI.getWorldProgress(worldId);
      return res.data;
    },
    enabled: !!worldId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function useBadges() {
  return useQuery<Badge[]>({
    queryKey: progressKeys.badges,
    queryFn: async () => {
      const res = await gamificationAPI.getBadges();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useAchievements() {
  return useQuery<Achievement[]>({
    queryKey: progressKeys.achievements,
    queryFn: async () => {
      const res = await gamificationAPI.getAchievements();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useSkills() {
  return useQuery<SkillRating[]>({
    queryKey: progressKeys.skills,
    queryFn: async () => {
      const res = await gamificationAPI.getSkills();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useSkillHistory() {
  return useQuery<SkillHistoryEntry[]>({
    queryKey: progressKeys.skillHistory,
    queryFn: async () => {
      const res = await gamificationAPI.getSkillHistory();
      return res.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[]>({
    queryKey: progressKeys.leaderboard,
    queryFn: async () => {
      const res = await gamificationAPI.getLeaderboard();
      return res.data ?? [];
    },
    staleTime: 60 * 1000,
    retry: 2,
  });
}

export function useCompleteExperiment() {
  const queryClient = useQueryClient();

  return useMutation<
    CompleteExperimentResult,
    Error,
    { worldId: string; experimentId: string; score?: number; timeSpentMs?: number }
  >({
    mutationFn: async ({ worldId, experimentId, score, timeSpentMs }) => {
      const res = await gamificationAPI.completeExperiment(worldId, experimentId, {
        xp_earned: 10,
        score,
        time_spent_ms: timeSpentMs,
      });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: progressKeys.all });
      queryClient.invalidateQueries({ queryKey: progressKeys.world(variables.worldId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.badges });
      queryClient.invalidateQueries({ queryKey: progressKeys.achievements });
      queryClient.invalidateQueries({ queryKey: progressKeys.skills });
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
      // Invalidate Brain Core energy so HomePage energy bars update immediately
      queryClient.invalidateQueries({ queryKey: braincoreKeys.energy });
      queryClient.invalidateQueries({ queryKey: braincoreKeys.status });
      // Invalidate companion so CompanionCard shows updated XP/level immediately
      queryClient.invalidateQueries({ queryKey: ["companion"] });
    },
  });
}
