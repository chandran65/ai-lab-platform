import { motion } from "framer-motion";
import { Cpu, Loader2, AlertCircle } from "lucide-react";
import { useAIReadiness } from "../hooks/useTeacherAnalytics";

function levelColor(level: string): string {
  switch (level) {
    case "Advanced": return "text-purple-600 bg-purple-50 border-purple-200";
    case "Intermediate": return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "Developing": return "text-amber-600 bg-amber-50 border-amber-200";
    case "Beginning": return "text-red-600 bg-red-50 border-red-200";
    default: return "text-slate-500 bg-slate-50 border-slate-200";
  }
}

function scoreBarColor(score: number): string {
  if (score >= 80) return "bg-gradient-to-r from-purple-500 to-purple-600";
  if (score >= 60) return "bg-gradient-to-r from-emerald-400 to-emerald-500";
  if (score >= 40) return "bg-gradient-to-r from-amber-400 to-amber-500";
  return "bg-gradient-to-r from-red-400 to-red-500";
}

export default function AIReadiness({ classId }: { classId?: string }) {
  const { data: readiness, isLoading, isError, refetch } = useAIReadiness(classId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-xs font-bold text-red-500">Failed to load AI readiness</p>
        <button onClick={() => refetch()} className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700">
          Retry
        </button>
      </div>
    );
  }

  if (!readiness || readiness.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <Cpu className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No readiness data yet</p>
        <p className="text-xs text-slate-300 text-center max-w-[220px]">
          Students need to develop skills before AI readiness can be assessed.
        </p>
      </div>
    );
  }

  const advanced = readiness.filter((r) => r.level === "Advanced").length;
  const intermediate = readiness.filter((r) => r.level === "Intermediate").length;
  const avgScore = readiness.reduce((s, r) => s + r.score, 0) / readiness.length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="w-5 h-5 text-purple-500" />
        <h3 className="text-base font-black text-slate-900">AI Readiness</h3>
        <span className="ml-auto text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
          Class Avg: {avgScore.toFixed(1)}
        </span>
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Advanced", count: advanced, color: "text-purple-600" },
          { label: "Intermediate", count: intermediate, color: "text-emerald-600" },
          { label: "Developing", count: readiness.filter((r) => r.level === "Developing").length, color: "text-amber-600" },
          { label: "Beginning", count: readiness.filter((r) => r.level === "Beginning").length, color: "text-red-600" },
        ].map((item) => (
          <div key={item.label} className="text-center bg-slate-50 rounded-lg px-2 py-2 border border-slate-100">
            <p className={`text-xl font-black ${item.color}`}>{item.count}</p>
            <p className="text-[9px] font-bold text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Student readiness bars */}
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {readiness.map((student, i) => (
          <motion.div
            key={student.student_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-700 min-w-[100px] truncate">
                {student.student_name}
              </span>
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${student.score}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.03 }}
                  className={`h-full rounded-full ${scoreBarColor(student.score)}`}
                />
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${levelColor(student.level)}`}>
                {student.level}
              </span>
              <span className="text-[10px] font-black text-slate-600 w-8 text-right tabular-nums">
                {Math.round(student.score)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
