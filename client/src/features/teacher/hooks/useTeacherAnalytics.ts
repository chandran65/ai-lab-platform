/**
 * Teacher analytics hooks — React Query hooks for all teacher dashboard data.
 */

import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "../../../services/api";

// ── Types ────────────────────────────────────────────────────────

export interface TeacherOverview {
  total_students: number;
  total_classes: number;
  average_completion: number;
  classes: TeacherClass[];
}

export interface TeacherClass {
  id: string;
  name: string;
  grade_level: number;
  student_count: number;
  avg_completion: number;
  total_xp: number;
}

export interface TeacherStudent {
  id: string;
  name: string;
  email: string;
  total_xp: number;
  skills: { name: string; score: number; level: string }[];
  badges_count: number;
  worlds_completed: string[];
  last_active: string | null;
}

export interface SkillHeatmap {
  skills: string[];
  students: { student_id: string; student_name: string; scores: Record<string, number> }[];
  class_averages: Record<string, number>;
}

export interface PerformanceTrend {
  month: string;
  month_name: string;
  avg_xp: number;
  avg_completion: number;
  active_students: number;
  total_students: number;
}

export interface LearningGap {
  skill_name: string;
  average_score: number;
  students_below_threshold: number;
  total_students: number;
  gap_percentage: number;
  threshold: number;
}

export interface AIReadiness {
  student_id: string;
  student_name: string;
  score: number;
  level: string;
  avg_skill_score: number;
  completion_pct: number;
}

export interface StudentDetail {
  id: string;
  name: string;
  email: string;
  total_xp: number;
  completion_pct: number;
  world_progress: Record<string, { completed: string[] }>;
  completed_worlds: string[];
  badges_count: number;
  skills: { skill_id: string; name: string; score: number; level: string }[];
  experiments: {
    activity_id: string | null;
    activity_name: string | null;
    created_at: string | null;
    duration_ms: number | null;
    result: string;
    metadata: string;
    world: {
      slug: string | null;
      name: string | null;
      emoji: string | null;
    } | null;
  }[];
  last_active: string | null;
}

export interface StudentRecommendation {
  student_id: string;
  student_name: string;
  recommended_world: string;
  recommended_name: string;
  reason: string;
  weakest_skill: string | null;
  weakest_score?: number;
}

// ── Query keys ───────────────────────────────────────────────────

export const teacherKeys = {
  all: ["teacher"] as const,
  overview: (classId?: string) => classId ? ["teacher", "overview", classId] as const : ["teacher", "overview"] as const,
  students: (classId?: string) => classId ? ["teacher", "students", classId] as const : ["teacher", "students"] as const,
  skills: (classId?: string) => classId ? ["teacher", "skills", classId] as const : ["teacher", "skills"] as const,
  performance: (classId?: string) => classId ? ["teacher", "performance", classId] as const : ["teacher", "performance"] as const,
  gaps: (classId?: string) => classId ? ["teacher", "gaps", classId] as const : ["teacher", "gaps"] as const,
  readiness: (classId?: string) => classId ? ["teacher", "readiness", classId] as const : ["teacher", "readiness"] as const,
  recommendations: (classId?: string) => classId ? ["teacher", "recommendations", classId] as const : ["teacher", "recommendations"] as const,
  studentDetail: (studentId: string) => ["teacher", "student-detail", studentId] as const,
};

// ── Hooks ────────────────────────────────────────────────────────

export function useTeacherOverview() {
  return useQuery<TeacherOverview>({
    queryKey: teacherKeys.overview(),
    queryFn: async () => {
      const res = await dashboardAPI.getTeacherOverview();
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function useTeacherStudents(classId?: string) {
  return useQuery<TeacherStudent[]>({
    queryKey: teacherKeys.students(classId),
    queryFn: async () => {
      const res = await dashboardAPI.getTeacherStudents(classId);
      return res.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function useSkillHeatmap(classId?: string) {
  return useQuery<SkillHeatmap>({
    queryKey: teacherKeys.skills(classId),
    queryFn: async () => {
      const res = await dashboardAPI.getTeacherSkillHeatmap(classId);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function usePerformanceTrends(classId?: string) {
  return useQuery<PerformanceTrend[]>({
    queryKey: teacherKeys.performance(classId),
    queryFn: async () => {
      const res = await dashboardAPI.getTeacherPerformance(classId);
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useLearningGaps(classId?: string) {
  return useQuery<LearningGap[]>({
    queryKey: teacherKeys.gaps(classId),
    queryFn: async () => {
      const res = await dashboardAPI.getTeacherGaps(classId);
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useAIReadiness(classId?: string) {
  return useQuery<AIReadiness[]>({
    queryKey: teacherKeys.readiness(classId),
    queryFn: async () => {
      const res = await dashboardAPI.getTeacherReadiness(classId);
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useTeacherStudentDetail(studentId: string | null) {
  return useQuery<StudentDetail>({
    queryKey: teacherKeys.studentDetail(studentId ?? ""),
    queryFn: async () => {
      const res = await dashboardAPI.getTeacherStudentDetail(studentId!);
      return res.data;
    },
    enabled: !!studentId,
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useStudentRecommendations(classId?: string) {
  return useQuery<StudentRecommendation[]>({
    queryKey: teacherKeys.recommendations(classId),
    queryFn: async () => {
      const res = await dashboardAPI.getTeacherRecommendations(classId);
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
