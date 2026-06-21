/**
 * ExperimentCard — Card for an individual experiment with game link and completion tracking.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Experiment } from "../types";
import type { CompleteExperimentResult } from "../hooks/useProgress";
import {
  Play,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  Loader2,
  Trophy,
} from "lucide-react";
import { useCompleteExperiment } from "../hooks/useProgress";

interface ExperimentCardProps {
  experiment: Experiment;
  index: number;
  worldId: string;
  isCompleted?: boolean;
  isUnlocked?: boolean;
  onRewardEarned?: (result: CompleteExperimentResult) => void;
}

export default function ExperimentCard({
  experiment,
  index,
  worldId,
  isCompleted = false,
  isUnlocked = true,
  onRewardEarned,
}: ExperimentCardProps) {
  const navigate = useNavigate();
  const completeMutation = useCompleteExperiment();
  const [justCompleted, setJustCompleted] = useState(false);

  const handleClick = () => {
    if (!isUnlocked) return;
    if (experiment.gameLink) {
      navigate(experiment.gameLink);
    }
  };

  const handleMarkComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted || completeMutation.isPending) return;

    completeMutation.mutate(
      { worldId, experimentId: experiment.id },
      {
        onSuccess: (result) => {
          setJustCompleted(true);
          setTimeout(() => setJustCompleted(false), 2000);

<<<<<<< Updated upstream
          // Check for non-XP rewards and bubble up for celebration
=======
>>>>>>> Stashed changes
          const hasSpecialRewards = result.rewards?.some(
            (r) => r.type !== "xp",
          );
          if (hasSpecialRewards && onRewardEarned) {
            onRewardEarned(result);
          }
        },
      },
    );
  };

  const isCompleting = completeMutation.isPending;
  const showCompleted = isCompleted || justCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 80 }}
      whileHover={
        isUnlocked && !isCompleting
          ? { y: -4, x: 4, transition: { type: "spring", stiffness: 200 } }
          : {}
      }
      onClick={handleClick}
      className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        !isUnlocked
          ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
          : showCompleted
          ? "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300 cursor-pointer"
          : experiment.gameLink
          ? "border-indigo-100 bg-white hover:border-indigo-300 hover:shadow-lg cursor-pointer"
          : "border-amber-100 bg-amber-50/50 hover:border-amber-300 cursor-default"
      }`}
    >
      <div className="p-5 flex items-start gap-4">
<<<<<<< Updated upstream
        {/* Emoji icon */}
=======
>>>>>>> Stashed changes
        <div
          className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm border transition-all ${
            showCompleted
              ? "bg-emerald-50 border-emerald-200"
              : "bg-gradient-to-br from-slate-50 to-white border-slate-200"
          }`}
        >
          {showCompleted ? (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              ✅
            </motion.span>
          ) : (
            experiment.emoji
          )}
        </div>

<<<<<<< Updated upstream
        {/* Content */}
=======
>>>>>>> Stashed changes
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`text-base font-black truncate ${
                showCompleted ? "text-emerald-800" : "text-slate-900"
              }`}
            >
              {experiment.title}
            </h3>
            {experiment.isNew && !showCompleted && (
              <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-emerald-400 to-emerald-500 text-white uppercase tracking-wider shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> NEW
              </span>
            )}
            {showCompleted && (
              <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                <CheckCircle2 className="w-2.5 h-2.5" /> Completed
              </span>
            )}
            {justCompleted && !isCompleted && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white uppercase tracking-wider shadow-sm"
              >
                <Trophy className="w-2.5 h-2.5" /> +10 XP
              </motion.span>
            )}
          </div>

          <p
            className={`text-xs font-medium leading-relaxed mb-3 ${
              showCompleted ? "text-emerald-600/70" : "text-slate-500"
            }`}
          >
            {experiment.description}
          </p>

<<<<<<< Updated upstream
          {/* Meta row */}
=======
>>>>>>> Stashed changes
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Layers className="w-3 h-3" /> {experiment.levels} Levels
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Clock className="w-3 h-3" /> {experiment.duration}
            </span>

<<<<<<< Updated upstream
            {/* Skills */}
=======
>>>>>>> Stashed changes
            <div className="flex flex-wrap gap-1">
              {experiment.skills.map((skill) => (
                <span
                  key={skill}
                  className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                    showCompleted
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-indigo-50 text-indigo-600 border-indigo-100"
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>

<<<<<<< Updated upstream
            {/* Right-side action buttons */}
=======
>>>>>>> Stashed changes
            {showCompleted ? (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Done
              </span>
            ) : isCompleting ? (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            ) : (
              <button
                onClick={handleMarkComplete}
                className="ml-auto inline-flex items-center gap-1 text-[10px] font-black text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-3 h-3" /> Mark Complete
              </button>
            )}

<<<<<<< Updated upstream
            {/* Launch CTA — hidden when completed */}
=======
>>>>>>> Stashed changes
            {!showCompleted && experiment.gameLink && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(experiment.gameLink!);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-full transition-colors"
              >
                <Play className="w-3 h-3 fill-indigo-600" /> Launch
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
