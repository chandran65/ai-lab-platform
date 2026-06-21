/**
 * WorldPage — Individual learning world page.
 * Fetches world data via React Query and renders mascot, experiments, and learning journey.
 */

import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Star,
  BrainCircuit,
  Lock,
  Loader2,
  Trophy,
  Medal,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useWorld } from "../hooks/useWorlds";
import { useWorldProgress, useBadges } from "../hooks/useProgress";
import type { Badge, CompleteExperimentResult } from "../hooks/useProgress";
import Mascot from "../components/Mascot";
import ExperimentCard from "../components/ExperimentCard";
import LearningJourney from "../components/LearningJourney";
import BadgeDisplay from "../components/BadgeDisplay";
import CelebrationModal from "../components/CelebrationModal";

// Maps world slugs to their completion badge IDs
const WORLD_BADGE_MAP: Record<string, string> = {
  "discovery-island": "junior-explorer",
  "coding-forest": "algorithm-apprentice",
  "ai-explorer-lab": "ai-scientist",
  "innovation-lab": "innovation-laureate",
};

function getWorldBadge(badges: Badge[] | undefined, worldSlug: string): Badge | undefined {
  const expectedBadgeId = WORLD_BADGE_MAP[worldSlug];
  if (!expectedBadgeId) return undefined;
  return badges?.find((b) => b.badge_id === expectedBadgeId);
}

// Maps completed world slugs to the next world that unlocks
const WORLD_NEXT_MAP: Record<string, string> = {
  "discovery-island": "coding-forest",
  "coding-forest": "ai-explorer-lab",
  "ai-explorer-lab": "innovation-lab",
};

export default function WorldPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: world, isLoading, isError } = useWorld(slug);
  const { data: worldProgress } = useWorldProgress(world?.slug);
  const { data: badges } = useBadges();

  // ── Celebration modal state ───────────────────────────────────
  const [celebrationRewards, setCelebrationRewards] = useState<CompleteExperimentResult | null>(null);

  const handleRewardEarned = useCallback((result: CompleteExperimentResult) => {
    setCelebrationRewards(result);
  }, []);

  const handleCloseCelebration = useCallback(() => {
    setCelebrationRewards(null);
  }, []);

  const handleNavigateToWorld = useCallback(
    (nextSlug: string) => {
      setCelebrationRewards(null);
      navigate(`/worlds/${nextSlug}`);
    },
    [navigate],
  );

  // ── Check if this world is fully completed ────────────────────
  const isWorldComplete =
    worldProgress &&
    worldProgress.total_experiments > 0 &&
    worldProgress.completion_pct >= 100;

  // Slug of the next world to unlock
  const nextWorldSlug = world ? WORLD_NEXT_MAP[world.slug] : undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError || !world) {
    return (
      <div className="max-w-6xl mx-auto w-full py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <span className="text-8xl block mb-4">🔮</span>
          <h1 className="text-3xl font-black text-slate-900">World Not Found</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            This learning world doesn't exist yet. Maybe it's still being built in the Innovation Lab!
          </p>
          <button
            onClick={() => navigate("/worlds")}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Worlds
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full py-6 font-sans animate-in fade-in transition-all duration-500">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/worlds")}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All Worlds
      </motion.button>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${world.gradient} shadow-xl mb-10`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          {/* Mascot */}
          <div className="flex-shrink-0">
            <Mascot
              emoji={world.mascotEmoji}
              name={world.mascotName}
              personality={world.mascotPersonality}
              size="lg"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-white/30 text-white border border-white/30 uppercase tracking-wider">
                {world.ageRange}
              </span>
              {world.unlockRequirement && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-amber-400/30 text-amber-100 border border-amber-400/30">
                  <Lock className="w-3 h-3" /> {world.unlockRequirement}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-white/30 text-white border border-white/30">
                <Star className="w-3 h-3" /> {world.experiments.length} Experiments
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-md mb-2">
              {world.title}
            </h1>
            <p className="text-lg text-white/90 font-semibold italic mb-4">
              "{world.subtitle}"
            </p>
            <p className="text-white/80 font-medium leading-relaxed max-w-2xl">
              {world.description}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {world.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/20"
                >
                  <BrainCircuit className="w-3 h-3" /> {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
      >
        {/* Completion progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-black text-slate-900">
              {worldProgress?.completed_experiments.length ?? 0}
            </span>
            <span className="text-sm font-bold text-slate-400">
              / {worldProgress?.total_experiments ?? world.experiments.length} experiments
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${worldProgress?.completion_pct ?? 0}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            />
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1.5">
            {Math.round(worldProgress?.completion_pct ?? 0)}% complete
          </p>
        </div>

        {/* XP */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experience</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">
              {worldProgress?.score ?? 0}
            </span>
            <span className="text-sm font-bold text-slate-400">XP earned</span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Complete experiments to earn more XP!
          </p>
        </div>

        {/* World badge */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reward</span>
          </div>
          {(() => {
            const worldBadge = getWorldBadge(badges, world.slug);
            if (worldBadge) {
              return (
                <div className="flex items-center gap-2">
                  <Medal className="w-6 h-6 text-amber-500" />
                  <div>
                    <p className="text-sm font-black text-slate-900">{worldBadge.name}</p>
                    <p className="text-[10px] font-bold text-emerald-600">Earned! 🎉</p>
                  </div>
                </div>
              );
            }
            return (
              <div>
                <p className="text-sm font-black text-slate-900">{world.completionReward}</p>
                <p className="text-[10px] font-bold text-slate-400">
                  Complete all {world.experiments.length} experiments
                </p>
              </div>
            );
          })()}
        </div>
      </motion.div>

      {/* World Complete Banner */}
      {isWorldComplete && nextWorldSlug && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 120 }}
          className="mb-10"
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
              {/* Trophy icon */}
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                <span className="text-4xl">🏆</span>
              </div>

              {/* Text */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1">
                  World Complete!
                </p>
                <h3 className="text-2xl font-black text-white drop-shadow-md">
                  You mastered {world.title}!
                </h3>
                <p className="text-sm text-white/90 font-medium mt-1">
                  A new adventure awaits. Ready to explore the next world?
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate(`/worlds/${nextWorldSlug}`)}
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-emerald-700 font-black text-sm hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Explore Next World
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Badges Section */}
      {badges && badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-10"
        >
          <BadgeDisplay badges={badges} worldSlug={world.slug} />
        </motion.div>
      )}

      {/* Learning Journey Path */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h2 className="text-2xl font-black text-slate-900">Your Learning Journey</h2>
        </div>
        <LearningJourney
          experiments={world.experiments}
          completedIds={worldProgress?.completed_experiments ?? []}
        />
      </motion.div>

      {/* Experiments List */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{world.mascotEmoji}</span>
            <h2 className="text-2xl font-black text-slate-900">
              {world.experiments.length} Experiments
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
            {world.completionReward}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {world.experiments.map((experiment, idx) => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              index={idx}
              worldId={world.slug}
              isCompleted={worldProgress?.completed_experiments?.includes(experiment.id) ?? false}
              onRewardEarned={handleRewardEarned}
            />
          ))}
        </div>
      </motion.div>

      {/* Celebration Modal */}
      {celebrationRewards && (
        <CelebrationModal
          rewards={celebrationRewards.rewards}
          worldUnlocked={celebrationRewards.world_unlocked}
          onClose={handleCloseCelebration}
          onNavigate={handleNavigateToWorld}
        />
      )}
    </div>
  );
}
