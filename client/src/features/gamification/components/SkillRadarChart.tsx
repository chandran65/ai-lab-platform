/**
 * SkillRadarChart — Radar chart showing skill ratings with milestone badges.
 * Shows earned milestone icons (🌱 Apprentice, 🌿 Practitioner, 🌳 Expert, 🏆 Master)
 * on each skill's progress bar when thresholds are reached.
 */

import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  BrainCircuit,
  Loader2,
  AlertCircle,
  Award,
  Sparkles,
} from "lucide-react";
import { useSkills } from "../../worlds/hooks/useProgress";

const SKILL_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#ec4899", // pink
];

// Milestone config: threshold -> { icon, label, color }
const MILESTONE_CONFIG: Record<number, { icon: string; label: string; color: string; bg: string }> = {
  25: { icon: "🌱", label: "Apprentice", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  50: { icon: "🌿", label: "Practitioner", color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
  75: { icon: "🌳", label: "Expert", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  100: { icon: "🏆", label: "Master", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
};

const MILESTONE_THRESHOLDS = [100, 75, 50, 25]; // Display order (highest first)

function SkillLevelLabel({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    "Curious Rookie": "text-slate-400",
    "Pattern Spotter": "text-indigo-500",
    "Competent Thinker": "text-emerald-500",
    "Advanced Analyst": "text-amber-500",
    "Master Innovator": "text-purple-500",
  };
  return (
    <span className={`text-[9px] font-bold ${colorMap[level] || "text-slate-400"} uppercase tracking-wider`}>
      {level}
    </span>
  );
}

function MilestoneIcons({ milestones }: { milestones: number[] }) {
  const earned = new Set(milestones);
  return (
    <div className="flex items-center gap-0.5 ml-1">
      {MILESTONE_THRESHOLDS.map((t) => {
        const cfg = MILESTONE_CONFIG[t];
        if (!cfg) return null;
        if (earned.has(t)) {
          return (
            <span
              key={t}
              className="text-[11px]"
              title={`${cfg.label} (score ${t})`}
            >
              {cfg.icon}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function SkillRadarChart() {
  const { data: skills, isLoading, isError, refetch } = useSkills();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-xs font-bold text-red-500">Failed to load skills</p>
        <button onClick={() => refetch()} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">
          Retry
        </button>
      </div>
    );
  }

  if (!skills || skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <BrainCircuit className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No skills tracked yet</p>
        <p className="text-xs text-slate-300 text-center max-w-[200px]">
          Complete experiments in the learning worlds to build your skills!
        </p>
      </div>
    );
  }

  const chartData = skills.map((s) => ({
    skill: s.name,
    score: s.score,
    fullMark: 100,
  }));

  const totalMilestones = skills.reduce(
    (sum, s) => sum + (s.milestones?.length ?? 0),
    0,
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <BrainCircuit className="w-5 h-5 text-indigo-500" />
        <h3 className="text-base font-black text-slate-900">Skill Progression</h3>
        {totalMilestones > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Sparkles className="w-3 h-3" />
            {totalMilestones} milestone{totalMilestones !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Legend for milestone icons */}
      {totalMilestones > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {MILESTONE_THRESHOLDS.map((t) => {
            const cfg = MILESTONE_CONFIG[t];
            if (!cfg) return null;
            return (
              <span
                key={t}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}
              >
                {cfg.icon} {cfg.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Radar chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                fontSize: "12px",
                fontWeight: 600,
              }}
              formatter={(value: number) => [`${Math.round(value)}/100`, "Score"]}
            />
            <Radar
              name="Skills"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill list with progress bars and milestone badges */}
      <div className="space-y-3 mt-4">
        {skills.map((skill, idx) => {
          const milestones = skill.milestones ?? [];
          return (
            <motion.div
              key={skill.skill_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Skill header with name, score, and milestone icons */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: SKILL_COLORS[idx % SKILL_COLORS.length] }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 truncate">
                    {skill.name}
                  </span>
                  {milestones.length > 0 && (
                    <MilestoneIcons milestones={milestones} />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-indigo-600 tabular-nums">
                    {Math.round(skill.score)}
                  </span>
                  <SkillLevelLabel level={skill.level} />
                </div>
              </div>
              {/* Progress bar */}
              <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.05 }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${SKILL_COLORS[idx % SKILL_COLORS.length]}, ${SKILL_COLORS[(idx + 1) % SKILL_COLORS.length]})`,
                  }}
                />
                {/* Milestone threshold markers on the progress bar */}
                {MILESTONE_THRESHOLDS.filter((t) => skill.score >= t).map((t) => {
                  const cfg = MILESTONE_CONFIG[t];
                  if (!cfg) return null;
                  return (
                    <div
                      key={t}
                      className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
                      style={{ left: `${t}%`, transform: `translate(-50%, -50%)` }}
                      title={`${cfg.label} (score ${t})`}
                    >
                      <span className="text-[9px] drop-shadow-sm">{cfg.icon}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Milestone badges earned alert */}
      {totalMilestones > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 flex items-center gap-3"
        >
          <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-800">
              You've earned {totalMilestones} skill milestone{totalMilestones !== 1 ? "s" : ""}!
            </p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              Milestones are awarded when a skill reaches score 25 (Apprentice), 50 (Practitioner), 75 (Expert), or 100 (Master).
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
