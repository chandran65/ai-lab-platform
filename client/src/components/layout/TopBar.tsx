import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { gamificationAPI } from "../../services/api";
import { Brain, Zap, Flame, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopBar() {
  const { user } = useAuth();
  const { data: progress } = useQuery({
    queryKey: ["gamification", "progress"],
    queryFn: async () => {
      const res = await gamificationAPI.getProgress();
      return res.data;
    },
    staleTime: 60_000,
  });

  const xp = progress?.total_xp ?? 0;
  const level = progress?.level ?? 1;
  const streak = progress?.streak ?? 0;
  const xpForNext = level * 100;
  const xpPct = Math.min((xp / xpForNext) * 100, 100);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brain Core */}
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-200 group-hover:shadow-purple-300 transition-all">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-slate-800 leading-tight">Mindora Universe</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Explore Worlds · Build Intelligence
            </p>
          </div>
        </Link>

        {/* Brain Energy & Stats */}
        <div className="flex items-center gap-3">
          {/* XP / Level */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm">
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="text-xs font-extrabold text-amber-700">{xp}</span>
            </div>
            <div className="w-12 h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>

          {/* Level Badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200/60 shadow-sm">
            <Brain className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-extrabold text-indigo-700">Level {level}</span>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-extrabold text-red-700">{streak}</span>
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Avatar / Companion */}
          <Link
            to="/profile"
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
              {user?.full_name?.charAt(0) || "?"}
            </div>
            <span className="hidden sm:block text-sm font-bold text-slate-700 truncate max-w-[80px]">
              {user?.full_name?.split(" ")[0] || "Explorer"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
