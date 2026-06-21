/**
 * WorldExplorer — Main world selection screen.
 * Shows all learning worlds as interactive cards, fetched via React Query.
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Lock, Star, Sparkles, Loader2, AlertCircle, CheckCircle2, Unlock } from "lucide-react";
import { useWorlds, prefetchWorld } from "../hooks/useWorlds";
import { useProgress } from "../hooks/useProgress";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { y: 40, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 80, damping: 15 } },
};

export default function WorldExplorer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: worlds, isLoading, isError, error, refetch } = useWorlds();
  const { data: userProgress } = useProgress();

  const handleMouseEnter = useCallback(
    (slug: string) => {
      prefetchWorld(queryClient, slug);
    },
    [queryClient],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm font-bold text-red-500">Failed to load worlds</p>
        <p className="text-xs text-slate-400">{(error as Error)?.message || "Please check your connection and try again."}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

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
      </motion.div>
    </div>
  );
}
