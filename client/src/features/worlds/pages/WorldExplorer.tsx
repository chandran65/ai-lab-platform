/**
<<<<<<< Updated upstream
 * WorldExplorer — Main world selection screen.
 * Shows all learning worlds as interactive cards, fetched via React Query.
=======
 * WorldExplorer — Interactive world map with connected progression paths.
 * Shows all learning worlds as nodes on a skill-tree style map with
 * locked/unlocked/completed states, boss challenges, and certificate unlocks.
>>>>>>> Stashed changes
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
<<<<<<< Updated upstream
import { ArrowRight, Lock, Star, Sparkles, Loader2, AlertCircle, CheckCircle2, Unlock } from "lucide-react";
=======
import {
  ArrowRight,
  Lock,
  Star,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Unlock,
  Trophy,
  Zap,
  Sword,
  Scroll,
  Map,
} from "lucide-react";
>>>>>>> Stashed changes
import { useWorlds, prefetchWorld } from "../hooks/useWorlds";
import { useProgress } from "../hooks/useProgress";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
<<<<<<< Updated upstream
    transition: { staggerChildren: 0.15 },
=======
    transition: { staggerChildren: 0.2 },
>>>>>>> Stashed changes
  },
};

const item = {
<<<<<<< Updated upstream
  hidden: { y: 40, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 80, damping: 15 } },
=======
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  show: { y: 0, opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 80, damping: 15 } },
>>>>>>> Stashed changes
};

export default function WorldExplorer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: worlds, isLoading, isError, error, refetch } = useWorlds();
  const { data: userProgress } = useProgress();

  const handleMouseEnter = useCallback(
<<<<<<< Updated upstream
    (slug: string) => {
      prefetchWorld(queryClient, slug);
    },
=======
    (slug: string) => { prefetchWorld(queryClient, slug); },
>>>>>>> Stashed changes
    [queryClient],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
<<<<<<< Updated upstream
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
=======
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
          <div className="absolute inset-2 border-t-4 border-indigo-500 rounded-full animate-spin" />
        </div>
>>>>>>> Stashed changes
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm font-bold text-red-500">Failed to load worlds</p>
<<<<<<< Updated upstream
        <p className="text-xs text-slate-400">{(error as Error)?.message || "Please check your connection and try again."}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
=======
        <p className="text-xs text-slate-400">{(error as Error)?.message || "Check your connection"}</p>
        <button onClick={() => refetch()} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors">Retry</button>
>>>>>>> Stashed changes
      </div>
    );
  }

<<<<<<< Updated upstream
  return (
    <div className="max-w-6xl mx-auto w-full py-6 font-sans animate-in fade-in transition-all duration-500">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Choose Your World
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Mindora</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium mt-3 max-w-2xl mx-auto">
          Each world is designed for a specific age group. Pick the one that's right for you
          and begin your AI learning adventure!
        </p>
      </motion.div>

      {/* World Cards Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {(worlds ?? []).map((world, idx) => (
          <motion.div
            key={world.id}
            variants={item}
            whileHover={{ y: -6, transition: { type: "spring", stiffness: 200 } }}
            onClick={() => navigate(`/worlds/${world.slug}`)}
            onMouseEnter={() => handleMouseEnter(world.slug)}
            className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${world.gradient} opacity-90`} />

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

            {/* Content */}
            <div className="relative z-10 p-8 md:p-10 flex flex-col h-full min-h-[320px]">
              {/* Badge */}
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-white/30 text-white border border-white/30 uppercase tracking-wider">
                  {world.ageRange}
                </span>
                {(() => {
                  const isUnlocked = userProgress?.unlocked_worlds?.includes(world.slug);
                  const isCompleted = (userProgress?.world_progress?.[world.slug] ?? 0) >= 100;

                  if (isCompleted) {
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black bg-emerald-400/30 text-emerald-100 border border-emerald-400/30">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    );
                  }

                  if (isUnlocked) {
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-100 border border-emerald-400/30">
                        <Unlock className="w-3 h-3" /> Available
                      </span>
                    );
                  }

                  if (world.unlockRequirement) {
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black bg-white/20 text-white/80">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    );
                  }

                  return null;
                })()}
              </div>

              {/* Mascot + Title */}
              <div className="flex items-center gap-5 mb-4">
                <motion.span
                  className="text-6xl md:text-7xl filter drop-shadow-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  {world.mascotEmoji}
                </motion.span>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-md">
                    {world.title}
                  </h2>
                  <p className="text-white/80 font-semibold text-sm md:text-base mt-1">
                    with {world.mascotName}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed mb-5 flex-1">
                {world.subtitle}
              </p>

              {/* Skills tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {world.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/20"
                  >
                    {skill}
                  </span>
                ))}
                {world.skills.length > 4 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white/70">
                    +{world.skills.length - 4}
                  </span>
                )}
              </div>

              {/* Experiments count + CTA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/80 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-white/60" />
                  <span>{world.experiments.length} Experiments</span>
                </div>
                <div className="flex items-center gap-1 text-white font-bold text-sm group-hover:gap-3 transition-all">
                  {idx === 0 ? "Enter World" : "Explore"} <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
=======
  const getWorldStatus = (slug: string) => {
    const isUnlocked = userProgress?.unlocked_worlds?.includes(slug);
    const progress = userProgress?.world_progress?.[slug] ?? 0;
    if (progress >= 100) return "completed";
    if (isUnlocked) return "unlocked";
    return "locked";
  };

  return (
    <div className="max-w-6xl mx-auto w-full py-6 font-sans">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 uppercase tracking-widest mb-4">
          <Map className="w-3.5 h-3.5" /> World Map
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Adventure</span> Awaits
        </h1>
        <p className="text-base text-slate-500 font-medium mt-3 max-w-2xl mx-auto">
          Progress through worlds, complete challenges, earn badges, and unlock certificates.
        </p>
      </motion.div>

      {/* World Nodes */}
      <motion.div variants={container} initial="hidden" animate="show">
        {worlds.map((world, idx) => {
          const status = getWorldStatus(world.slug);
          const isCompleted = status === "completed";
          const isUnlocked = status === "unlocked";
          const isLocked = status === "locked";
          const worldProgress = userProgress?.world_progress?.[world.slug] ?? 0;

          return (
            <div key={world.id}>
              {/* World Node Row */}
              <motion.div variants={item} className="relative z-10 mb-6 last:mb-0">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* World Node Circle */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-emerald-100 ring-4 ring-emerald-300" :
                      isUnlocked ? "bg-indigo-100 ring-4 ring-indigo-300 animate-pulse" :
                      "bg-slate-100 ring-4 ring-slate-200"
                    }`}>
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${world.gradient} flex items-center justify-center shadow-lg`}>
                        <span className="text-4xl">{world.mascotEmoji}</span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className={`absolute -top-2 -right-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md border-2 border-white flex items-center gap-1 ${
                      isCompleted ? "bg-emerald-500 text-white" :
                      isUnlocked ? "bg-indigo-500 text-white" :
                      "bg-slate-300 text-white"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {isCompleted ? "Done" : isUnlocked ? "Open" : "Locked"}
                    </div>

                    {/* Progress ring */}
                    {isUnlocked && !isCompleted && (
                      <svg className="absolute -inset-2 w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="58" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <motion.circle
                          cx="64" cy="64" r="58"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 58}
                          initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - worldProgress / 100) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                    )}
                  </div>

                  {/* World Card */}
                  <div
                    onClick={() => !isLocked && navigate(`/worlds/${world.slug}`)}
                    onMouseEnter={() => handleMouseEnter(world.slug)}
                    className={`flex-1 w-full rounded-3xl overflow-hidden transition-all duration-500 ${
                      isLocked ? "opacity-50 cursor-not-allowed" : "group hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                    }`}
                  >
                    <div className={`relative bg-gradient-to-br ${world.gradient} p-6 md:p-8`}>
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-white/30 text-white border border-white/30 uppercase tracking-wider">
                            {world.ageRange}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/70">
                            <Star className="w-3 h-3 fill-white/60" /> {world.experiments.length} Quests
                          </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-md mb-2">
                          {world.title}
                        </h2>
                        <p className="text-white/80 text-sm font-medium leading-relaxed mb-4 max-w-xl">
                          {world.subtitle}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {world.skills.slice(0, 4).map((skill) => (
                            <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white border border-white/20">
                              {skill}
                            </span>
                          ))}
                          {world.skills.length > 4 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white/70">+{world.skills.length - 4}</span>
                          )}
                        </div>

                        {isUnlocked && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-white/80 flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-300" /> Progress</span>
                              <span className="font-bold text-white/80">{Math.round(worldProgress)}%</span>
                            </div>
                            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${worldProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-white to-white/70"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white/60">
                            <Trophy className="w-4 h-4" />
                            <span className="text-xs font-bold">{world.completionReward}</span>
                          </div>
                          {!isLocked && (
                            <div className="flex items-center gap-1 text-white font-bold text-sm group-hover:gap-3 transition-all">
                              {worldProgress > 0 ? "Continue" : (idx === 0 ? "Begin Adventure" : "Explore")}
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quest progress dots */}
                    {isUnlocked && (
                      <div className="bg-white border-x border-b border-slate-200 rounded-b-3xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              {world.experiments.map((exp) => {
                                const isExpCompleted = userProgress?.completed_experiments?.includes(exp.id) ?? false;
                                return (
                                  <div
                                    key={exp.id}
                                    className={`w-3 h-3 rounded-full border-2 transition-all ${
                                      isExpCompleted ? "bg-emerald-500 border-emerald-500" : "bg-slate-100 border-slate-200"
                                    }`}
                                  />
                                );
                              })}
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${worldProgress >= 100 ? "bg-amber-500 border-amber-500" : "bg-slate-100 border-slate-200"}`}>
                                <Sword className={`w-2.5 h-2.5 ${worldProgress >= 100 ? "text-white" : "text-slate-300"}`} />
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${worldProgress >= 100 ? "bg-purple-500 border-purple-500" : "bg-slate-100 border-slate-200"}`}>
                                <Scroll className={`w-2.5 h-2.5 ${worldProgress >= 100 ? "text-white" : "text-slate-300"}`} />
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                              {userProgress?.completed_experiments?.filter(e => world.experiments.some(exp => exp.id === e)).length || 0}/{world.experiments.length}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-emerald-600">
                            {worldProgress >= 100 ? "Certificate Ready!" : `${world.experiments.length - (userProgress?.completed_experiments?.filter(e => world.experiments.some(exp => exp.id === e)).length || 0)} left`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Connector line to next world */}
              {idx < worlds.length - 1 && (
                <div className={`hidden md:block mx-auto w-0.5 h-10 mb-6 ${
                  status === "completed" ? "bg-emerald-400" : "bg-slate-200"
                }`} />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
      >
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Legend</h3>
        <div className="flex flex-wrap items-center gap-6">
          {[
            { icon: CheckCircle2, label: "Completed", color: "text-emerald-500" },
            { icon: Unlock, label: "Available", color: "text-indigo-500" },
            { icon: Lock, label: "Locked", color: "text-slate-300" },
            { icon: Sword, label: "Boss Challenge", color: "text-amber-500" },
            { icon: Scroll, label: "Certificate", color: "text-purple-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-xs font-bold text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>
>>>>>>> Stashed changes
      </motion.div>
    </div>
  );
}
