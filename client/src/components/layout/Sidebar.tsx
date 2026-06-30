import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Award, Cpu, Trophy, Code, LogOut, BrainCircuit
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-[#69B8FF] hover:bg-[#69B8FF]/10" },
    { path: "/games/classifier", label: "AI Laboratory", icon: Cpu, color: "text-[#38D9FF] hover:bg-[#38D9FF]/10" },
    { path: "/games/kaggle", label: "Kaggle Arena", icon: Trophy, color: "text-[#F4B942] hover:bg-[#F4B942]/10" },
    { path: "/profile", label: "Achievements", icon: Award, color: "text-[#FF9BAA] hover:bg-[#FF9BAA]/10" },
    { path: "/sandbox", label: "Dev Sandbox", icon: Code, color: "text-[#B59CFF] hover:bg-[#B59CFF]/10" },
  ];

  return (
    <aside 
      className="fixed left-5 top-1/2 -translate-y-1/2 h-[75vh] w-20 hover:w-56 group transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] bg-white border border-[#FFD76A]/40 rounded-[28px] shadow-[0_12px_32px_rgba(244,185,66,0.06)] z-30 flex flex-col justify-between items-center group-hover:items-stretch py-6 px-3"
    >
      {/* Brand logo section */}
      <div className="flex items-center gap-3 justify-center group-hover:justify-start px-2 select-none">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFD76A] to-[#F4B942] flex items-center justify-center shadow-[0_4px_12px_rgba(244,185,66,0.25)] animate-pulse">
          <BrainCircuit className="h-6 w-6 text-[#3f2203]" />
        </div>
        <div className="hidden group-hover:block transition-all duration-300">
          <h1 className="font-black text-sm leading-tight text-slate-800 font-display">Mindora</h1>
          <p className="text-[9px] text-[#a16207] font-bold uppercase tracking-widest font-mono">Adventure Academy</p>
        </div>
      </div>

      {/* Main Nav Links */}
      <nav className="flex-1 w-full my-8 space-y-4 flex flex-col items-center group-hover:items-stretch">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          const isHovered = hoveredIndex === idx;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-250 ease-out w-12 group-hover:w-full justify-center group-hover:justify-start border adventure-hover ${
                active
                  ? "bg-[#FFF9F0] border-[#FFD76A]/50 text-slate-800 shadow-[0_4px_12px_rgba(244,185,66,0.08)]"
                  : `border-transparent text-slate-400 hover:text-slate-800 ${item.color}`
              }`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 ${active ? "scale-110" : ""}`} />
              <span className="hidden group-hover:inline text-xs font-extrabold font-display tracking-wide">{item.label}</span>

              {/* Tooltip on Hover (collapsed dock) */}
              {isHovered && (
                <div className="absolute left-24 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-display text-[10px] font-bold whitespace-nowrap opacity-100 group-hover:hidden z-40 shadow-md">
                  {item.label}
                </div>
              )}

              {/* Left indicator accent color tag */}
              {active && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#F4B942] rounded-r-full shadow-[0_0_8px_#F4B942]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section / Logout */}
      <div className="w-full flex flex-col items-center group-hover:items-stretch gap-4 border-t border-slate-100 pt-6">
        <div className="flex items-center gap-3 justify-center group-hover:justify-start px-2">
          <div className="w-10 h-10 rounded-full bg-[#FFF9F0] border border-[#FFD76A]/30 flex items-center justify-center text-[#F4B942] text-sm font-black select-none">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="hidden group-hover:block max-w-[130px] truncate">
            <p className="text-xs font-black text-slate-800 truncate">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 font-bold capitalize">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-4 px-3 py-3 rounded-2xl text-slate-400 hover:text-[#EF4444] hover:bg-red-500/5 hover:border-red-500/10 border border-transparent w-12 group-hover:w-full justify-center group-hover:justify-start transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden group-hover:inline text-xs font-extrabold font-display">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
