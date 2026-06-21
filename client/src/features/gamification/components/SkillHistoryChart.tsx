/**
 * SkillHistoryChart — Line chart showing skill score progression over time.
 * Shows milestone badges (🌱 Apprentice, 🌿 Practitioner, 🌳 Expert, 🏆 Master)
 * as reference lines on the chart and in the summary cards.
 */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  Loader2,
  AlertCircle,
  Sparkles,
  Calendar,
} from "lucide-react";
import { useSkillHistory, useSkills } from "../../worlds/hooks/useProgress";

const SKILL_PALETTE = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#ec4899", // pink
];

const MILESTONE_THRESHOLDS = [100, 75, 50, 25];

const MILESTONE_CONFIG: Record<number, { icon: string; label: string; color: string }> = {
  25: { icon: "🌱", label: "Apprentice", color: "#10b981" },
  50: { icon: "🌿", label: "Practitioner", color: "#14b8a6" },
  75: { icon: "🌳", label: "Expert", color: "#f59e0b" },
  100: { icon: "🏆", label: "Master", color: "#a855f7" },
};

const DATE_RANGES = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "all", label: "All time", days: Infinity },
] as const;

type RangeKey = (typeof DATE_RANGES)[number]["key"];

type ChartSnapshot = Record<string, string | number> & { date: string };

export default function SkillHistoryChart() {
  const { data: entries, isLoading, isError, refetch } = useSkillHistory();
  const { data: skills } = useSkills();
  const [rangeKey, setRangeKey] = useState<RangeKey>("all");

  // Aggregate raw entries into chart snapshots (one row per date)
  const { allChartData, uniqueSkills, skillMilestones } = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        allChartData: [] as ChartSnapshot[],
        uniqueSkills: [] as string[],
        skillMilestones: {} as Record<string, number[]>,
      };
    }

    // Collect unique skill names in display order
    const skillsSet = new Map<string, number>();
    for (const e of entries) {
      if (!skillsSet.has(e.skill_name)) {
        skillsSet.set(e.skill_name, skillsSet.size);
      }
    }
    const uniqueSkills = Array.from(skillsSet.keys());

    // Build milestone map from current skills data
    const skillMilestones: Record<string, number[]> = {};
    if (skills) {
      for (const s of skills) {
        skillMilestones[s.name] = s.milestones ?? [];
      }
    }

    // Group entries by date (truncate ISO timestamp to date portion)
    const groups = new Map<string, Map<string, number>>();
    for (const e of entries) {
      const dateKey = e.date.slice(0, 10);
      if (!groups.has(dateKey)) {
        groups.set(dateKey, new Map());
      }
      const skillScores = groups.get(dateKey)!;
      skillScores.set(e.skill_name, e.score);
    }

    const sortedDates = Array.from(groups.keys()).sort();
    const data: ChartSnapshot[] = sortedDates.map((date) => {
      const row: ChartSnapshot = { date };
      const skillScores = groups.get(date)!;
      for (const skill of uniqueSkills) {
        row[skill] = skillScores.get(skill) ?? 0;
      }
      return row;
    });

    return { allChartData: data, uniqueSkills, skillMilestones };
  }, [entries, skills]);

  // Filter chart data by selected date range
  const chartData = useMemo(() => {
    if (rangeKey === "all") return allChartData;
    const range = DATE_RANGES.find((r) => r.key === rangeKey);
    if (!range) return allChartData;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range.days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return allChartData.filter((row) => row.date >= cutoffStr);
  }, [allChartData, rangeKey]);

  // Collect all unique milestones across all skills for the reference lines
  const allMilestoneThresholds = useMemo(() => {
    const thresholds = new Set<number>();
    for (const milestones of Object.values(skillMilestones)) {
      for (const m of milestones) {
        thresholds.add(m);
      }
    }
    return Array.from(thresholds).sort((a, b) => a - b);
  }, [skillMilestones]);

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
        <p className="text-xs font-bold text-red-500">Failed to load skill history</p>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <TrendingUp className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No skill history yet</p>
        <p className="text-xs text-slate-300 text-center max-w-[220px]">
          Complete experiments to start building your skill progression timeline!
        </p>
      </div>
    );
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalMilestones = Object.values(skillMilestones).reduce(
    (sum, m) => sum + m.length,
    0,
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        <h3 className="text-base font-black text-slate-900">
          Skill Progression Over Time
        </h3>
        {totalMilestones > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Sparkles className="w-3 h-3" />
            {totalMilestones} milestone{totalMilestones !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Date range filter */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {DATE_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRangeKey(r.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                rangeKey === r.key
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          {chartData.length} data point{chartData.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Line chart */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: -8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
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
              labelFormatter={(label: string) => formatDate(label)}
              formatter={(value: number, name: string) => [
                `${Math.round(value)}/100`,
                name,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", fontWeight: 600, paddingTop: "8px" }}
              iconType="circle"
              iconSize={8}
            />
            {/* Milestone reference lines */}
            {allMilestoneThresholds.map((threshold) => {
              const cfg = MILESTONE_CONFIG[threshold];
              if (!cfg) return null;
              return (
                <ReferenceLine
                  key={threshold}
                  y={threshold}
                  stroke={cfg.color}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  strokeOpacity={0.5}
                  label={{
                    value: `${cfg.icon} ${threshold}`,
                    position: "right",
                    fontSize: 10,
                    fill: cfg.color,
                    fontWeight: 600,
                  }}
                />
              );
            })}
            {uniqueSkills.map((skill, idx) => (
              <Line
                key={skill}
                type="monotone"
                dataKey={skill}
                stroke={SKILL_PALETTE[idx % SKILL_PALETTE.length]}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1.5 }}
                activeDot={{ r: 5, strokeWidth: 2 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats with milestone badges */}
      {chartData.length > 0 && uniqueSkills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-wrap gap-3"
        >
          {uniqueSkills.map((skill, idx) => {
            const latest = Number(chartData[chartData.length - 1]?.[skill] ?? 0);
            const first = Number(chartData[0]?.[skill] ?? 0);
            const change = latest - first;
            const milestones = skillMilestones[skill] ?? [];
            return (
              <div
                key={skill}
                className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: SKILL_PALETTE[idx % SKILL_PALETTE.length] }}
                />
                <span className="text-[11px] font-bold text-slate-700">{skill}</span>
                <span className="text-[11px] font-black text-slate-900 tabular-nums">
                  {Math.round(latest as number)}
                </span>
                {change !== 0 && (
                  <span
                    className={`text-[10px] font-bold ${
                      change > 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {change > 0 ? "↑" : "↓"}
                    {Math.abs(change).toFixed(0)}
                  </span>
                )}
                {/* Milestone icons for this skill */}
                {milestones.length > 0 && (
                  <span className="flex items-center gap-0.5 ml-0.5 pl-1.5 border-l border-slate-200">
                    {MILESTONE_THRESHOLDS.map((t) => {
                      if (!milestones.includes(t)) return null;
                      const cfg = MILESTONE_CONFIG[t];
                      if (!cfg) return null;
                      return (
                        <span key={t} className="text-[10px]" title={`${cfg.label} (score ${t})`}>
                          {cfg.icon}
                        </span>
                      );
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Empty hint for filtered range with no data */}
      {allChartData.length > 0 && chartData.length === 0 && (
        <p className="text-xs text-slate-400 text-center mt-3 italic">
          No data points in the selected range. Try a wider date range.
        </p>
      )}

      {/* Empty hint for single-data-point case */}
      {chartData.length === 1 && uniqueSkills.length > 0 && (
        <p className="text-xs text-slate-400 text-center mt-3 italic">
          Complete more experiments to see your skill progression over time.
        </p>
      )}
    </div>
  );
}
