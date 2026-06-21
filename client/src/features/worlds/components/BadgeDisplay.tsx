/**
 * BadgeDisplay — Shows a user's earned badges with unlock animation.
 */

import { motion } from "framer-motion";
import { Medal, Lock, Sparkles } from "lucide-react";
import type { Badge } from "../hooks/useProgress";

// Maps world slugs to their completion badge IDs
const WORLD_BADGE_MAP: Record<string, string> = {
  "discovery-island": "junior-explorer",
  "coding-forest": "algorithm-apprentice",
  "ai-explorer-lab": "ai-scientist",
  "innovation-lab": "innovation-laureate",
};

interface BadgeDisplayProps {
  badges: Badge[];
  worldSlug?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const badgeItem = {
  hidden: { scale: 0, rotate: -20 },
  show: { scale: 1, rotate: 0, transition: { type: "spring" as const, stiffness: 150, damping: 12 } },
};

export default function BadgeDisplay({ badges, worldSlug }: BadgeDisplayProps) {
  const filtered = worldSlug
    ? badges.filter((b) => b.badge_id === WORLD_BADGE_MAP[worldSlug])
    : badges;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-3">
          <Lock className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-400">No badges earned yet</p>
        <p className="text-xs text-slate-300 mt-1">Complete experiments to earn badges!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Medal className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Badges Earned
        </span>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-4"
      >
        {filtered.map((badge) => (
          <motion.div
            key={badge.badge_id}
            variants={badgeItem}
            className="relative group"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-default">
              <span className="text-3xl filter drop-shadow-sm">{badge.icon}</span>
              {/* Sparkle for earned badges */}
              {badge.unlocked_at && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </motion.div>
              )}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
              <p className="text-[10px] font-black text-amber-300 uppercase">{badge.name}</p>
              <p className="text-[9px] font-medium text-slate-300 mt-0.5">{badge.description}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
