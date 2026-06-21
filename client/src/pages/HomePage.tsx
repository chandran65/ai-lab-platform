import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { worldsAPI, gamificationAPI, braincoreAPI } from "../services/api";
import CompanionCard from "../features/worlds/components/CompanionCard";
import {
  Brain, Sparkles, ArrowRight, Compass, Star,
  Trees, Building2, Atom, Rocket, Puzzle, Swords, Scroll,
  Zap, Coins, Flame
} from "lucide-react";

interface World {
  id: string;
  title: string;
  name: string;
  slug: string;
  mascotEmoji: string;
  gradient: string;
  minAge: number;
  experiments: Array<{ id: string; title: string }>;
}

const ENERGY_CONFIG = [
  { key: "pattern", label: "Pattern", color: "from-emerald-400 to-teal-400", icon: Brain },
  { key: "logic", label: "Logic", color: "from-amber-400 to-orange-400", icon: Brain },
  { key: "creative", label: "Creative", color: "from-violet-400 to-purple-400", icon: Brain },
  { key: "problem_solving", label: "Problem Solving", color: "from-rose-400 to-pink-400", icon: Brain },
  { key: "ai", label: "AI", color: "from-cyan-400 to-blue-400", icon: Brain },
  { key: "innovation", label: "Innovation", color: "from-fuchsia-400 to-pink-500", icon: Brain },
];

const WORLD_ICONS: Record<string, typeof Trees> = {
  "discovery-island": Trees,
  "coding-forest": Building2,
  "ai-explorer-lab": Atom,
  "innovation-city": Rocket,
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting] = useState(getGreeting);

  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["worlds"],
    queryFn: async () => {
      const res = await worldsAPI.list();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: progress = {} } = useQuery({
    queryKey: ["gamification", "progress"],
    queryFn: async () => {
      const res = await gamificationAPI.getProgress();
      return res.data ?? {};
    },
    staleTime: 60_000,
  });

  const { data: brainEnergy } = useQuery({
    queryKey: ["braincore", "energy"],
    queryFn: async () => {
      const res = await braincoreAPI.getEnergy();
      return res.data;
    },
    staleTime: 60_000,
  });

  const firstWorld = worlds[0];
  const xp = (progress as any)?.total_xp ?? 0;
  const level = (progress as any)?.level ?? 1;
  const coins = (progress as any)?.coins ?? 0;
  const streak = (progress as any)?.streak ?? 0;
  const completedExps: string[] = (progress as any)?.completed_experiments ?? [];
  const totalExps = worlds.reduce((sum: number, w: World) => sum + (w.experiments?.length ?? 0), 0);
  const xpForNextLevel = level * 100;
  const xpProgress = Math.min((xp / xpForNextLevel) * 100, 100);
  const energies: Record<string, number> = (brainEnergy as any)?.energies ?? {};

  return (
    <div className="space-y-8 pb-8 font-sans">
      {/* ═══════ BRAIN CORE HEADER ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white shadow-2xl border border-purple-500/20"
      >
        {/* Animated glow orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Greeting Row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-[0.2em]">
                {greeting}, Explorer
              </span>
              <h1 className="text-3xl md:text-4xl font-black mt-1 bg-gradient-to-r from-white via-purple-200 to-fuchsia-200 bg-clip-text text-transparent">
                {user?.full_name?.split(" ")[0] || "Mindora"}!
              </h1>
              <p className="text-purple-300/80 font-medium mt-1 text-sm max-w-md">
                The Brain Core awaits your discovery. Complete missions to restore its power.
              </p>
            </div>
            {/* Companion Card — Live Companion System */}
            <CompanionCard className="hidden md:flex w-56" />
          </div>

          {/* Brain Core — Central Energy Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            {/* Brain Energy Bars */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-300" />
                <span className="text-sm font-black text-white">Brain Core Energies</span>
              </div>
              <div className="space-y-2.5">
                {ENERGY_CONFIG.map((energy, i) => {
                  const pct = energies[energy.key] ?? 0;
                  return (
                    <motion.div
                      key={energy.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-[10px] font-bold text-purple-300 w-24 truncate uppercase tracking-wider">
                        {energy.label}
                      </span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                          className={`h-full rounded-full bg-gradient-to-r ${energy.color}`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-purple-300 w-6 text-right">{pct}%</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Zap, label: "Total XP", value: xp, color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                { icon: Brain, label: "Level", value: level, color: "text-indigo-300", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                { icon: Coins, label: "Coins", value: coins, color: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                { icon: Flame, label: "Streak", value: `${streak}d`, color: "text-red-300", bg: "bg-red-500/10", border: "border-red-500/20" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className={`${stat.bg} ${stat.border} border rounded-xl p-3 text-center backdrop-blur-sm`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* XP Progress to next level */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                Level {level} → {level + 1}
              </span>
              <span className="text-[10px] font-bold text-purple-300">{xp} / {xpForNextLevel} XP</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════ QUEST MAP — Current World ═══════ */}
      {firstWorld && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-500" />
              Current Mission
            </h2>
            <Link to="/worlds" className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors">
              Explore All Worlds <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Link
            to={`/worlds/${firstWorld.slug}`}
            className="block relative overflow-hidden rounded-3xl shadow-xl group cursor-pointer"
          >
            <div className={`h-48 bg-gradient-to-br ${firstWorld.gradient} relative`}>
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* World Evolution Status */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[9px] font-black text-white border border-white/20 uppercase tracking-wider">
                  World Evolution 30%
                </span>
              </div>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-5">
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="text-6xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                  >
                    {firstWorld.mascotEmoji}
                  </motion.span>
                  <div className="text-white flex-1">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Active World</span>
                    <h3 className="text-2xl font-black drop-shadow-md">{firstWorld.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "30%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-white/60 rounded-full"
                        />
                      </div>
                      <span className="text-xs font-bold text-white/80">{firstWorld.experiments?.length || 0} Missions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* ═══════ QUICK ACTIONS ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Puzzle, label: "Missions", desc: "Continue your quest", path: "/worlds", gradient: "from-emerald-400 to-teal-500" },
            { icon: Swords, label: "Challenges", desc: "Test your skills", path: "/games/weather", gradient: "from-amber-400 to-orange-500" },
            { icon: Scroll, label: "Certificates", desc: "View your awards", path: "/certificates", gradient: "from-violet-400 to-purple-600" },
            { icon: Star, label: "Leaderboard", desc: "See the rankings", path: "/profile", gradient: "from-rose-400 to-pink-500" },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="relative overflow-hidden bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 text-left group hover:shadow-lg transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md mb-3 group-hover:scale-105 transition-transform`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black text-slate-800 text-sm">{item.label}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ═══════ WORLD EVOLUTION MAP ═══════ */}
      {worlds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" />
              World Evolution
            </h2>
            <span className="text-[10px] font-bold text-slate-400">
              {completedExps.length} / {totalExps} Missions Complete
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {worlds.map((world, i) => {
              const WorldIcon = WORLD_ICONS[world.slug] || Trees;
              const worldExps = world.experiments?.length || 1;
              const completedInWorld = world.experiments?.filter(
                (e: { id: string }) => completedExps.includes(e.id)
              ).length || 0;
              const pct = Math.round((completedInWorld / worldExps) * 100);

              return (
                <motion.div
                  key={world.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <Link
                    to={`/worlds/${world.slug}`}
                    className="block relative overflow-hidden rounded-2xl group cursor-pointer"
                  >
                    <div className={`h-32 bg-gradient-to-br ${world.gradient} p-4 flex flex-col justify-between relative`}>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[8px] font-black text-white border border-white/20">
                        {pct}%
                      </div>
                      <span className="text-2xl self-end group-hover:scale-110 transition-transform duration-300">
                        {world.mascotEmoji}
                      </span>
                      <div>
                        <WorldIcon className="w-3.5 h-3.5 text-white/60 mb-0.5" />
                        <h3 className="text-xs font-black text-white group-hover:underline">
                          {world.title}
                        </h3>
                        <p className="text-[9px] font-bold text-white/60">
                          {completedInWorld}/{worldExps} missions
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══════ BRAIN CORE STATUS ═══════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-5 border border-purple-500/20 text-center"
      >
        <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-purple-200">
          The Brain Core is {xp > 0 ? "awakening" : "dormant"}
        </p>
        <p className="text-[11px] text-purple-400/70 font-medium mt-1">
          Complete missions across all worlds to restore its full power.
        </p>
      </motion.div>
    </div>
  );
}
