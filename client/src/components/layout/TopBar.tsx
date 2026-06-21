import { useAuth } from "../../context/AuthContext";
import { Zap, Coins, Flame, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopBar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-slate-800 leading-tight">Mindora</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Adventure Academy</p>
          </div>
        </Link>

        {/* Stats Row */}
        <div className="flex items-center gap-3">
          {/* XP */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-xs font-extrabold text-amber-700">0</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/60 shadow-sm">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-extrabold text-yellow-700">0</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 shadow-sm">
            <Flame className="w-4 h-4 text-red-500" />
            <span className="text-xs font-extrabold text-red-700">0</span>
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Avatar */}
          <Link
            to="/profile"
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
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
