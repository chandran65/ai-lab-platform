import { useAuth } from "../../context/AuthContext";
import { Bell, Search } from "lucide-react";

export default function Header() {
  const { user, enforceAuth, toggleEnforcement } = useAuth();

  return (
    <header className="h-16 backdrop-blur-md bg-white/30 border-b border-[#FFD76A]/10 flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search lands, simulations..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#FFD76A]/30 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F4B942] focus:border-transparent transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Forced Authentication Toggle Switch */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-[#FFD76A]/30 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1">
            {enforceAuth ? "🔒" : "🔓"} Forced Login
          </span>
          <button
            onClick={() => toggleEnforcement(!enforceAuth)}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all duration-300 ${
              enforceAuth ? "bg-[#F4B942] justify-end" : "bg-slate-200 justify-start"
            }`}
            title="Toggle forced authentication on the platform"
          >
            <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300" />
          </button>
        </div>

        <button className="relative p-2 rounded-xl hover:bg-white/50 transition-colors">
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF9BAA] rounded-full" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FFD76A] flex items-center justify-center text-[#3f2203] text-sm font-black shadow-[0_3px_10px_rgba(244,185,66,0.25)]">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <span className="text-sm font-bold text-slate-600">{user?.full_name}</span>
        </div>
      </div>
    </header>
  );
}
