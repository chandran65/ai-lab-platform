import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Globe, Gamepad2, Trophy, User } from "lucide-react";

const navItems = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/worlds", label: "Worlds", icon: Globe },
  { path: "/games/weather", label: "Games", icon: Gamepad2 },
  { path: "/profile", label: "Profile", icon: User },
  { path: "/certificates", label: "Awards", icon: Trophy },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.1)]">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path === "/home" && location.pathname === "/dashboard");

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-0.5"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              />
              <span
                className={`text-[10px] font-bold transition-colors ${
                  isActive ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
