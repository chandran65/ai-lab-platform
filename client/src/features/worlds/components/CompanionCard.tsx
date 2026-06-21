import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { companionAPI } from "../../../services/api";
import { Sparkles, Star, Zap } from "lucide-react";

interface CompanionItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  reward_type: string;
}

interface EvolutionStage {
  stage: number;
  emoji: string;
  title: string;
  xp_required: number;
}

interface CompanionData {
  companion_id: string;
  name: string;
  emoji: string;
  description: string;
  personality: string;
  skill_affinity: string;
  evolution_emoji: string;
  level: number;
  total_xp: number;
  xp_progress: number;
  xp_for_next: number;
  evolution_stage: number;
  current_evolution: EvolutionStage;
  evolution_stages: EvolutionStage[];
  equipped_items: CompanionItem[];
  unlocked_skills: string[];
  active_skill_id: string | null;
  last_active_at: string;
}

function getCompanionTitle(level: number): string {
  if (level >= 10) return "Legendary Partner";
  if (level >= 7) return "Master Companion";
  if (level >= 5) return "Trusted Ally";
  if (level >= 3) return "Growing Friend";
  return "Loyal Companion";
}

export default function CompanionCard({ className = "" }: { className?: string }) {
  const { data: companion, isLoading, error } = useQuery<CompanionData>({
    queryKey: ["companion"],
    queryFn: async () => {
      const res = await companionAPI.getMyCompanion();
      return res.data;
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className={`bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !companion) {
    return (
      <div className={`bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 ${className}`}>
        <p className="text-xs text-purple-300/60 text-center">Companion not available</p>
      </div>
    );
  }

  const stageColors = ["from-emerald-400 to-teal-400", "from-amber-400 to-orange-400", "from-violet-400 to-purple-500"];
  const stageGlow = ["shadow-emerald-500/20", "shadow-amber-500/20", "shadow-violet-500/20"];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={companion.companion_id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 ${className}`}
      >
        {/* Animated background glow */}
        <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${stageColors[Math.min(companion.evolution_stage - 1, stageColors.length - 1)]} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

        {/* Stages available indicator */}
        {companion.evolution_stage < 3 && companion.xp_for_next > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[8px] font-bold text-amber-300 uppercase tracking-wider">
            +{companion.xp_for_next} XP to evolve
          </div>
        )}

        <div className="relative p-4">
          {/* Companion Avatar + Info Row */}
          <div className="flex items-start gap-4">
            {/* Animated Companion Emoji */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="relative"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stageColors[Math.min(companion.evolution_stage - 1, stageColors.length - 1)]} flex items-center justify-center shadow-lg ${stageGlow[Math.min(companion.evolution_stage - 1, stageGlow.length - 1)]}`}>
                  <span className="text-3xl filter drop-shadow-lg">{companion.emoji}</span>
                </div>
                {/* Evolution sparkle */}
                {companion.evolution_stage >= 2 && (
                  <motion.div
                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Companion Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white truncate">{companion.name}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-bold text-purple-200 uppercase tracking-wider">
                  Lv.{companion.level}
                </span>
              </div>
              <p className="text-[10px] text-purple-300/70 font-medium mt-0.5">
                {getCompanionTitle(companion.level)} · {companion.personality}
              </p>

              {/* XP Progress */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-bold text-purple-300/60 uppercase tracking-wider">
                    Bond XP
                  </span>
                  <span className="text-[8px] font-bold text-purple-300/60">
                    {companion.total_xp} XP
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(companion.xp_progress, 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${stageColors[Math.min(companion.evolution_stage - 1, stageColors.length - 1)]}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Evolution Stage + Equipped Items Row */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
            {/* Evolution Stages */}
            <div className="flex items-center gap-1.5">
              {companion.evolution_stages.map((stage, i) => {
                const unlocked = companion.total_xp >= stage.xp_required;
                return (
                  <motion.div
                    key={stage.stage}
                    whileHover={{ scale: 1.1 }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs border transition-all ${
                      unlocked
                        ? `bg-gradient-to-br ${stageColors[i]} border-transparent shadow-md`
                        : "bg-white/5 border-white/10 opacity-40"
                    }`}
                    title={`${stage.title} (${stage.xp_required} XP)`}
                  >
                    {unlocked ? (
                      <span className={i === companion.evolution_stage - 1 ? "scale-110" : ""}>
                        {stage.emoji}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/30">?</span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Equipped Items */}
            <div className="flex-1 flex items-center justify-end gap-1">
              {companion.equipped_items.length > 0 ? (
                companion.equipped_items.slice(0, 3).map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.2, y: -2 }}
                    className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-xs border border-white/10 cursor-help"
                    title={item.name}
                  >
                    {item.emoji}
                  </motion.div>
                ))
              ) : (
                <span className="text-[8px] text-white/30 font-medium">No items equipped</span>
              )}
              {companion.equipped_items.length > 3 && (
                <span className="text-[8px] text-purple-300/60 font-bold ml-1">
                  +{companion.equipped_items.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Affinity badge */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              <Zap className="w-2.5 h-2.5 text-amber-300" />
              <span className="text-[8px] font-bold text-amber-300 uppercase tracking-wider capitalize">
                {companion.skill_affinity} affinity
              </span>
            </div>
            {companion.evolution_stage >= 2 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                <Star className="w-2.5 h-2.5 text-violet-300" />
                <span className="text-[8px] font-bold text-violet-300 uppercase tracking-wider">
                  Evolved
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
