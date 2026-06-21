import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { worldsAPI, gamificationAPI } from "../services/api";
import { Zap, Coins, Flame, Sparkles, ArrowRight, Star, Trophy, BrainCircuit, Play } from "lucide-react";

interface World {
  id: string;
  title: string;
  name: string;
  slug: string;
  mascotEmoji: string;
  gradient: string;
  accentColor: string;
  experiments: Array<{ id: string; title: string }>;
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [greeting, setGreeting] = useState("Good Morning");
  const [progress, setProgress] = useState<Record<string, any>>({});

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const loadData = async () => {
      try {
        const [wRes, pRes] = await Promise.all([
          worldsAPI.list(),
          gamificationAPI.getProgress().catch(() => ({ data: {} })),
        ]);
        setWorlds(wRes.data || []);
        setProgress(pRes.data || {});
      } catch {
        // fallback
      }
    };
    loadData();
  }, []);

  const firstWorld = worlds[0];
  const xp = progress?.total_xp ?? 0;
  const level = progress?.level ?? 1;
  const coins = progress?.coins ?? 0;
  const streak = progress?.streak ?? 0;
  const xpForNextLevel = level * 100;
  const xpProgress = Math.min((xp / xpForNextLevel) * 100, 100);

  return (
    <div className="space-y-8 pb-8">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-indigo-200 uppercase tracking-wider">
                {greeting}
              </p>
              <h1 className="text-3xl md:text-4xl font-black mt-1">
                {user?.full_name?.split(" ")[0] || "Explorer"}!
              </h1>
              <p className="text-indigo-200 font-medium mt-1 max-w-md">
                Ready for today's adventure?
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
              <span className="text-4xl">{firstWorld?.mascotEmoji || "🐰"}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-indigo-200">{firstWorld?.title || "Discovery Island"}</p>
                <p className="text-lg font-black">Your World</p>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300/50" />
                <span className="text-sm font-bold">Level {level}</span>
              </div>
              <span className="text-xs font-bold text-indigo-200">
                {xp} / {xpForNextLevel} XP
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex gap-3 mt-4">
            {[
              { icon: Zap, label: "XP", value: xp, color: "text-yellow-300", bg: "bg-yellow-500/20" },
              { icon: Coins, label: "Coins", value: coins, color: "text-amber-300", bg: "bg-amber-500/20" },
              { icon: Flame, label: "Streak", value: `${streak} days`, color: "text-red-300", bg: "bg-red-500/20" },
              { icon: Star, label: "Level", value: level, color: "text-emerald-300", bg: "bg-emerald-500/20" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`flex-1 ${stat.bg} rounded-xl p-3 text-center backdrop-blur-sm border border-white/5`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                <p className="text-lg font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Current World Progress */}
      {firstWorld && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-800">Your Journey</h2>
            <Link to="/worlds" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              All Worlds <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <Link
            to={`/worlds/${firstWorld.slug}`}
            className="block relative overflow-hidden rounded-3xl shadow-lg group cursor-pointer"
          >
            <div className={`h-44 bg-gradient-to-br ${firstWorld.gradient} relative`}>
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-4">
                  <span className="text-6xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {firstWorld.mascotEmoji}
                  </span>
                  <div className="text-white">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Current World</span>
                    <h3 className="text-2xl font-black">{firstWorld.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/60 rounded-full" style={{ width: "30%" }} />
                      </div>
                      <span className="text-xs font-bold text-white/80">{firstWorld.experiments?.length || 0} Quests</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Recommended Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Recommended
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/worlds")}
            className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 text-left group hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Learning Path</p>
                <h3 className="font-black text-slate-800 text-lg">Explore Worlds</h3>
                <p className="text-sm text-slate-500">Start your AI learning adventure</p>
              </div>
              <Play className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/games/weather")}
            className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 text-left group hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Quick Play</p>
                <h3 className="font-black text-slate-800 text-lg">Play Games</h3>
                <p className="text-sm text-slate-500">Practice skills through fun challenges</p>
              </div>
              <Play className="w-6 h-6 text-slate-300 group-hover:text-amber-500 transition-colors" />
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* All Worlds Quick Access */}
      {worlds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-lg font-black text-slate-800 mb-4">All Worlds</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {worlds.map((world, i) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <Link
                  to={`/worlds/${world.slug}`}
                  className="block relative overflow-hidden rounded-2xl h-28 group cursor-pointer"
                >
                  <div className={`h-full bg-gradient-to-br ${world.gradient} p-4 flex flex-col justify-between`}>
                    <span className="text-3xl self-end group-hover:scale-110 transition-transform">
                      {world.mascotEmoji}
                    </span>
                    <div>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                        Ages {world.minAge}+
                      </p>
                      <h3 className="text-sm font-black text-white group-hover:underline">
                        {world.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
