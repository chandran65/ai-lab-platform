import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Sparkles, FolderOpen, Code, FileCode,
  GraduationCap, Shield, LogOut, Brain, Cpu, Gamepad2, Award
} from "lucide-react";

const studentMenu = [
  { path: "/dashboard", label: "Game Hub", icon: LayoutDashboard },
  { path: "/profile", label: "My Profile & Badges", icon: Award },
  { path: "/games/weather", label: "Weather Adventure", icon: Sparkles },
  { path: "/games/train", label: "Choo Choo Train", icon: Gamepad2 },
  { path: "/games/turtle", label: "Turtle Path 3D", icon: Brain },
];

const developerMenu = [
  { path: "/sandbox", label: "Developer Sandbox", icon: Cpu },
  { path: "/activities", label: "AI Activities", icon: Sparkles },
  { path: "/projects", label: "My Projects", icon: FolderOpen },
  { path: "/block-editor", label: "Block Coding", icon: Code },
  { path: "/notebook", label: "Python Notebook", icon: FileCode },
];

const teacherMenu = [
  { path: "/teacher", label: "Class Dashboard", icon: GraduationCap },
];

const adminMenu = [
  { path: "/admin", label: "Admin Console", icon: Shield },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menu = [
    ...studentMenu,
  ];

  const devMenu = [
    ...developerMenu,
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-4 border-b border-slate-700">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="font-bold text-lg leading-tight">Game Hub</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Mindora Arcade</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">Arcade Games</h2>
          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">AI Developer Tools</h2>
          {devMenu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  active
                    ? "bg-indigo-900 text-white border border-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {(user?.role === "teacher" || user?.role === "admin") && (
          <div className="space-y-1">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">Teacher Space</h2>
            {teacherMenu.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                    active
                      ? "bg-amber-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        {user?.role === "admin" && (
          <div className="space-y-1">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">Admin Space</h2>
            {adminMenu.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                    active
                      ? "bg-red-900 text-white border border-red-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
