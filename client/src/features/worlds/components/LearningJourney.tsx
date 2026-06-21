/**
 * LearningJourney — Duolingo-style visual progression path.
 * Shows experiments as nodes on a connected path, with completion status.
 */

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Experiment } from "../types";
import { CheckCircle, Lock, Play, Circle } from "lucide-react";

interface LearningJourneyProps {
  experiments: Experiment[];
  completedIds?: string[];
  currentId?: string;
}

const nodeColors = {
  completed: "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200",
  current: "bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 animate-pulse",
  locked: "bg-slate-100 border-slate-200 text-slate-300",
  available: "bg-white border-indigo-300 text-indigo-600",
};

export default function LearningJourney({
  experiments,
  completedIds = [],
  currentId,
}: LearningJourneyProps) {
  const navigate = useNavigate();

  if (experiments.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 font-medium">
        No experiments available yet. Check back soon!
      </div>
    );
  }

  return (
    <div className="relative py-6">
      {/* Background path line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 hidden md:block" />

      {/* Progress indicator */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(completedIds.length / Math.max(experiments.length, 1)) * 100}%`,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
          />
        </div>
        <span className="text-xs font-black text-slate-500 whitespace-nowrap">
          {completedIds.length} / {experiments.length} Complete
        </span>
      </div>

      {/* Experiment nodes */}
      <div className="space-y-4">
        {experiments.map((experiment, idx) => {
          const isCompleted = completedIds.includes(experiment.id);
          const isCurrent = currentId === experiment.id;
          const prevCompleted = idx === 0 || completedIds.includes(experiments[idx - 1]?.id || "");
          const isLocked = !isCompleted && !isCurrent && !prevCompleted;
          const statusIcon = () => {
            if (isCompleted) return <CheckCircle className="w-5 h-5" />;
            if (isCurrent) return <Play className="w-5 h-5 fill-indigo-600" />;
            if (isLocked) return <Lock className="w-5 h-5" />;
            return <Circle className="w-5 h-5" />;
          };

          const statusColor = () => {
            if (isCompleted) return nodeColors.completed;
            if (isCurrent) return nodeColors.current;
            if (isLocked) return nodeColors.locked;
            return nodeColors.available;
          };

          return (
            <motion.div
              key={experiment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, type: "spring", stiffness: 80 }}
              className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                isLocked
                  ? "border-slate-100 bg-slate-50 opacity-50"
                  : isCompleted
                  ? "border-emerald-100 bg-emerald-50/50 hover:border-emerald-200"
                  : isCurrent
                  ? "border-indigo-200 bg-indigo-50 shadow-md"
                  : "border-indigo-100 bg-white hover:border-indigo-200 hover:shadow-sm cursor-pointer"
              }`}
              onClick={() => {
                if (!isLocked && experiment.gameLink) {
                  navigate(experiment.gameLink);
                }
              }}
            >
              {/* Timeline connector (desktop) */}
              <div className="hidden md:flex flex-col items-center pt-1">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm transition-all ${statusColor()}`}
                >
                  {statusIcon()}
                </div>
                {idx < experiments.length - 1 && (
                  <div
                    className={`w-0.5 h-8 mt-1 ${
                      isCompleted ? "bg-emerald-300" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg">{experiment.emoji}</span>
                  <h3
                    className={`text-sm font-black ${
                      isLocked ? "text-slate-400" : "text-slate-900"
                    }`}
                  >
                    {experiment.title}
                  </h3>
                  {isCompleted && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                      Done
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded uppercase">
                      In Progress
                    </span>
                  )}
                  {experiment.isNew && !isCompleted && (
                    <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded uppercase">
                      New
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs font-medium mt-1 ${
                    isLocked ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {experiment.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    {experiment.levels} Levels
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {experiment.duration}
                  </span>
                </div>
              </div>

              {/* Action */}
              {!isLocked && experiment.gameLink && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(experiment.gameLink!);
                  }}
                  className={`flex-shrink-0 self-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                  }`}
                >
                  {isCompleted ? "Replay" : "Start"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
