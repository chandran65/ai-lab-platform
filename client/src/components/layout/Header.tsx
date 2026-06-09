import { useAuth } from "../../context/AuthContext";
import { Bell, Search } from "lucide-react";

export default function Header() {
  const { user, enforceAuth, toggleEnforcement } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, activities..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Forced Authentication Toggle Switch */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1">
            {enforceAuth ? "🔒" : "🔓"} Forced Login
          </span>
          <button
            onClick={() => toggleEnforcement(!enforceAuth)}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all duration-300 ${
              enforceAuth ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
            }`}
            title="Toggle forced authentication on the platform"
          >
            <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300" />
          </button>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <span className="text-sm font-medium text-slate-700">{user?.full_name}</span>
        </div>
      </div>
    </header>
  );
}
