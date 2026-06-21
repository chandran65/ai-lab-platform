/**
 * LeaderboardPanel — Shows top users ranked by total XP earned across all worlds.
 */

import { motion } from "framer-motion";
import { Trophy, Zap, Loader2, AlertCircle, Crown } from "lucide-react";
import { useLeaderboard, useProgress } from "../../worlds/hooks/useProgress";

import { useAuth } from "../../../context/AuthContext";

const rankStyles: Record<number, { icon: string; bg: string; border: string; label: string }> = {
  1: { icon: "👑", bg: "from-amber-100 to-yellow-50", border: "border-amber-300", label: "#1" },
  2: { icon: "🥈", bg: "from-slate-100 to-gray-50", border: "border-slate-300", label: "#2" },
  3: { icon: "🥉", bg: "from-orange-100 to-amber-50", border: "border-orange-300", label: "#3" },
};

function RankBadge({ rank }: { rank: number }) {
  const s = rankStyles[rank];
  if (s) {
    return (
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${s.bg} border-2 ${s.border} flex items-center justify-center shadow-sm`}>
        <span className="text-lg">{s.icon}</span>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
      <span className="text-xs font-black text-slate-400">#{rank}</span>
    </div>
  );
}

export default function LeaderboardPanel() {
  const { data: entries, isLoading, isError, refetch } = useLeaderboard();
  const { data: userProgress } = useProgress();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-xs font-bold text-red-500">Failed to load leaderboard</p>
        <button onClick={() => refetch()} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">
          Retry
        </button>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <Trophy className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No leaderboard data yet</p>
        <p className="text-xs text-slate-300">Complete experiments to earn XP and appear here!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-black text-slate-900">Top Explorers</h3>
        {userProgress && (
          <span className="ml-auto text-[10px] font-bold text-slate-400">
            Your XP: {userProgress.total_xp}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              user && entry.user_id === user.id
                ? "bg-indigo-50 border-indigo-200"
                : "bg-white border-slate-100 hover:border-slate-200"
            }`}
          >
            <RankBadge rank={entry.rank} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">
                {entry.full_name}
              </p>
              <p className="text-[10px] font-bold text-slate-400">
                {entry.experiments_completed} experiments completed
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-0.5 text-sm font-black text-indigo-600">
                <Zap className="w-3.5 h-3.5" />
                {entry.total_xp}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
