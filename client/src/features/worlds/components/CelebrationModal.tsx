/**
 * CelebrationModal — Full-screen confetti + reward display when badges/achievements are earned.
 * Shows animated award cards for each non-XP reward from experiment completion.
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, MapPin, Zap, Star, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

// ── Types ────────────────────────────────────────────────────────

export interface Reward {
  type: string; // "badge" | "achievement" | "world_unlock" | "xp"
  name: string;
  description?: string;
  icon?: string;
  amount?: number;
}

interface CelebrationModalProps {
  rewards: Reward[];
  worldUnlocked?: string;
  onClose: () => void;
  onNavigate?: (slug: string) => void;
}

// ── Reward icon mapping ──────────────────────────────────────────

function rewardIcon(type: string, emoji?: string): string {
  if (emoji) return emoji;
  switch (type) {
    case "badge": return "🎖️";
    case "achievement": return "🏅";
    case "world_unlock": return "🗺️";
    default: return "⭐";
  }
}

function rewardColor(type: string): string {
  switch (type) {
    case "badge": return "from-amber-400 via-orange-400 to-rose-400";
    case "achievement": return "from-violet-400 via-purple-400 to-indigo-400";
    case "world_unlock": return "from-cyan-400 via-teal-400 to-emerald-400";
    default: return "from-slate-300 to-slate-400";
  }
}

function rewardBg(type: string): string {
  switch (type) {
    case "badge": return "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200";
    case "achievement": return "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200";
    case "world_unlock": return "bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200";
    default: return "bg-slate-50 border-slate-200";
  }
}

function rewardLabel(type: string): string {
  switch (type) {
    case "badge": return "Badge Unlocked!";
    case "achievement": return "Achievement Earned!";
    case "world_unlock": return "New World Unlocked!";
    default: return "Reward";
  }
}

// ── Confetti burst ───────────────────────────────────────────────

function fireConfetti() {
  // Main burst
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#f59e0b", "#8b5cf6", "#06b6d4", "#10b981", "#f43f5e"],
  });

  // Side bursts
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.5 },
      colors: ["#f59e0b", "#8b5cf6", "#10b981"],
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.5 },
      colors: ["#06b6d4", "#f43f5e", "#8b5cf6"],
    });
  }, 150);

  // Star burst at the top
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 120,
      origin: { y: 0.2 },
      shapes: ["star"],
      colors: ["#fbbf24", "#fcd34d", "#fde68a"],
    });
  }, 300);
}

// ── Component ────────────────────────────────────────────────────

export default function CelebrationModal({ rewards, worldUnlocked, onClose, onNavigate }: CelebrationModalProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!hasFired.current && rewards.length > 0) {
      hasFired.current = true;
      // Fire confetti in sequence
      fireConfetti();
      // Continuous rain for a few seconds
      const interval = setInterval(() => {
        confetti({
          particleCount: 10,
          spread: 100,
          origin: { y: 0 },
          colors: ["#f59e0b", "#8b5cf6", "#06b6d4", "#10b981"],
        });
      }, 200);
      const timeout = setTimeout(() => clearInterval(interval), 2500);
      // Cleanup: stop confetti rain if modal closes early
      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [rewards]);

  // Filter to non-XP rewards (badge, achievement, world_unlock)
  const specialRewards = rewards.filter((r) => r.type !== "xp");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-amber-400 via-violet-500 to-cyan-500" />

          {/* Header */}
          <div className="text-center pt-8 pb-2 px-8">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200 mb-4"
            >
              <Sparkles className="w-8 h-8 text-amber-500" />
            </motion.div>
            <h2 className="text-2xl font-black text-slate-900">Congratulations!</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              You earned some rewards!
            </p>
          </div>

          {/* Reward cards */}
          <div className="px-8 py-4 space-y-3">
            {specialRewards.map((reward, idx) => (
              <motion.div
                key={`${reward.type}-${idx}`}
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.15, type: "spring", stiffness: 150 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${rewardBg(reward.type)} shadow-sm`}
              >
                {/* Emoji icon */}
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.15, type: "spring", stiffness: 200 }}
                  className="flex-shrink-0 w-14 h-14 rounded-xl bg-white shadow-sm border border-white/50 flex items-center justify-center text-3xl"
                >
                  {rewardIcon(reward.type, reward.icon)}
                </motion.div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-[9px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${rewardColor(reward.type)}`}>
                    {rewardLabel(reward.type)}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    {reward.name}
                  </h3>
                  {reward.description && (
                    <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-2">
                      {reward.description}
                    </p>
                  )}
                  {reward.amount && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
                      <Zap className="w-2.5 h-2.5" /> +{reward.amount} Bonus XP
                    </span>
                  )}
                </div>
              </motion.div>
            ))}

            {/* World unlock banner — clickable */}
            {worldUnlocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + specialRewards.length * 0.15, type: "spring", stiffness: 150 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate?.(worldUnlocked)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 shadow-lg cursor-pointer group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-white">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-80">New World Unlocked!</p>
                  <p className="text-lg font-black mt-0.5">Explore Now</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            )}
          </div>

          {/* XP summary */}
          {rewards.length > 0 && (
            <div className="px-8 py-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + specialRewards.length * 0.15 }}
                className="text-center text-sm text-slate-400 font-medium"
              >
                <Star className="w-3.5 h-3.5 inline-block mr-1 text-amber-400" />
                Total XP earned: <span className="font-bold text-slate-700">
                  +{rewards.reduce((sum, r) => sum + (r.amount || 0), 0)}
                </span>
              </motion.div>
            </div>
          )}

          {/* Close button */}
          <div className="px-8 pb-8 pt-2">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + specialRewards.length * 0.15 }}
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Continue Learning
            </motion.button>
          </div>

          {/* Close X */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
