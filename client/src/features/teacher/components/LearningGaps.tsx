import { motion } from "framer-motion";
import { AlertTriangle, Loader2, AlertCircle, BarChart3 } from "lucide-react";
import { useLearningGaps } from "../hooks/useTeacherAnalytics";

export default function LearningGaps({ classId }: { classId?: string }) {
  const { data: gaps, isLoading, isError, refetch } = useLearningGaps(classId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-xs font-bold text-red-500">Failed to load learning gaps</p>
        <button onClick={() => refetch()} className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600">
          Retry
        </button>
      </div>
    );
  }

  if (!gaps || gaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <BarChart3 className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No skill data yet</p>
        <p className="text-xs text-slate-300 text-center max-w-[220px]">
          Skill data will appear as students complete experiments.
        </p>
      </div>
    );
  }

  const criticalGaps = gaps.filter((g) => g.gap_percentage >= 50);
  const warningGaps = gaps.filter((g) => g.gap_percentage >= 25 && g.gap_percentage < 50);
  const healthy = gaps.filter((g) => g.gap_percentage < 25);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="text-base font-black text-slate-900">Learning Gaps</h3>
        {criticalGaps.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
            {criticalGaps.length} critical
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Critical", count: criticalGaps.length, color: "text-red-600 bg-red-50 border-red-200" },
          { label: "Needs Attention", count: warningGaps.length, color: "text-amber-600 bg-amber-50 border-amber-200" },
          { label: "On Track", count: healthy.length, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
        ].map((item) => (
          <div key={item.label} className={`rounded-lg px-3 py-2 border text-center ${item.color}`}>
            <p className="text-2xl font-black">{item.count}</p>
            <p className="text-[10px] font-bold">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Gap bars */}
      <div className="space-y-3">
        {gaps.map((gap, i) => (
          <motion.div
            key={gap.skill_name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-700">{gap.skill_name}</span>
              <span className="text-[10px] font-bold text-slate-500">
                {gap.students_below_threshold}/{gap.total_students} below {gap.threshold}
              </span>
            </div>
            <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gap.gap_percentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                className={`h-full rounded-full ${
                  gap.gap_percentage >= 50
                    ? "bg-red-400"
                    : gap.gap_percentage >= 25
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[9px] text-slate-400">Avg score: {gap.average_score}</span>
              <span className="text-[9px] font-bold text-slate-500">{gap.gap_percentage}% gap</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
