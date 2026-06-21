import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  AlertCircle,
  User,
  Zap,
  Globe,
  Clock,
  BarChart3,
  ListChecks,
  Trophy,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useTeacherStudentDetail, type StudentDetail } from "../hooks/useTeacherAnalytics";

type Tab = "profile" | "skills" | "experiments";

export default function StudentDetailModal({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: () => void;
}) {
  const { data, isLoading, isError, refetch } = useTeacherStudentDetail(studentId);
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm">
                {data?.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isLoading ? "Loading..." : data?.name ?? "Student Detail"}
                </h2>
                {data?.email && (
                  <p className="text-[11px] font-medium text-slate-400">{data.email}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm font-bold text-red-500">Failed to load student data</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600"
              >
                Retry
              </button>
            </div>
          )}

          {/* Content */}
          {data && !isLoading && !isError && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-slate-100 shrink-0 px-6">
                {([
                  { key: "profile" as Tab, label: "Profile", icon: User },
                  { key: "skills" as Tab, label: "Skills", icon: BarChart3 },
                  { key: "experiments" as Tab, label: "Experiments", icon: ListChecks },
                ]).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                      tab === t.key
                        ? "border-amber-500 text-amber-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {tab === "profile" && <ProfileTab data={data} />}
                {tab === "skills" && <SkillsTab data={data} />}
                {tab === "experiments" && <ExperimentsTab data={data} />}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Profile Tab ────────────────────────────────────────────────── */

function ProfileTab({ data }: { data: StudentDetail }) {
  const stats = [
    { label: "Total XP", value: data.total_xp.toLocaleString(), icon: Zap, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Badges", value: data.badges_count.toString(), icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Worlds Done", value: data.completed_worlds.length.toString(), icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Completion", value: `${data.completion_pct}%`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* World Progress */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">World Progress</h4>
        <div className="space-y-2">
          {Object.entries(data.world_progress).length > 0 ? (
            Object.entries(data.world_progress).map(([worldId, wp]) => {
              const completedCount = (wp as { completed?: string[] }).completed?.length ?? 0;
              return (
                <div key={worldId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-700 flex-1 truncate">
                    {worldId
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">
                    {completedCount} / 5
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No worlds started yet.</p>
          )}
        </div>
      </div>

      {/* Last Active */}
      {data.last_active && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          Last active: {new Date(data.last_active).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

/* ── Skills Tab ─────────────────────────────────────────────────── */

function SkillsTab({ data }: { data: StudentDetail }) {
  const skills = data.skills;

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <BarChart3 className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No skills data yet</p>
        <p className="text-xs text-slate-300 text-center max-w-[220px]">
          Skills are earned by completing experiments in each world.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Level Summary */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
        <GraduationCap className="w-6 h-6 text-indigo-500" />
        <div>
          <p className="text-sm font-bold text-slate-800">
            {skills.reduce((best, s) => (s.score > best.score ? s : best), skills[0]).level}
          </p>
          <p className="text-[10px] font-medium text-slate-500">Highest skill level</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-lg font-black text-indigo-600">
            {Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length)}
          </p>
          <p className="text-[10px] font-medium text-slate-500">Avg Score</p>
        </div>
      </div>

      {/* Skill Bars */}
      {skills
        .sort((a, b) => b.score - a.score)
        .map((skill) => {
          const barWidth = Math.min(skill.score, 100);
          const color =
            barWidth >= 80 ? "bg-emerald-500" :
            barWidth >= 60 ? "bg-amber-500" :
            barWidth >= 40 ? "bg-orange-500" :
            "bg-red-400";

          return (
            <div key={skill.skill_id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${
                    barWidth >= 80 ? "text-emerald-600" :
                    barWidth >= 60 ? "text-amber-600" :
                    barWidth >= 40 ? "text-orange-600" :
                    "text-red-500"
                  }`}>
                    {Math.round(skill.score)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{skill.level}</span>
                </div>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${color}`}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}

/* ── Experiments Tab ────────────────────────────────────────────── */

function ExperimentsTab({ data }: { data: StudentDetail }) {
  const experiments = data.experiments;

  if (experiments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <ListChecks className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No experiments completed</p>
        <p className="text-xs text-slate-300 text-center max-w-[220px]">
          Completed experiments will appear here as a timeline.
        </p>
      </div>
    );
  }

  // Group experiments by date for a timeline view
  const grouped = useMemo(() => {
    const groups: Record<string, typeof experiments> = {};
    for (const exp of experiments) {
      const dateKey = exp.created_at
        ? new Date(exp.created_at).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Unknown";
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(exp);
    }
    return Object.entries(groups);
  }, [experiments]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <p className="text-sm font-bold text-slate-700">
          {experiments.length} experiment{experiments.length !== 1 ? "s" : ""} completed
        </p>
        <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          Last: {experiments[0]?.created_at ? new Date(experiments[0].created_at).toLocaleDateString() : "—"}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative ml-3">
        {/* Vertical line */}
        <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-amber-200 rounded-full" />

        {grouped.map(([date, exps]) => (
          <div key={date} className="mb-5 last:mb-0">
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-100 shrink-0 z-10" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{date}</span>
            </div>

            {/* Experiments */}
            <div className="space-y-2 ml-6">
              {exps.map((exp, i) => {
                let parsedResult: Record<string, unknown> = {};
                try { parsedResult = JSON.parse(exp.result); } catch {}
                const score = parsedResult?.score as number | undefined;

                // Determine world icon
                const worldEmoji = exp.world?.emoji ?? null;
                const worldName = exp.world?.name ?? null;
                const activityName = exp.activity_name ?? (() => {
                  try {
                    const m = JSON.parse(exp.metadata);
                    return (m as Record<string, string>)?.activity_name ?? null;
                  } catch { return null; }
                })();

                return (
                  <motion.div
                    key={`${exp.activity_id}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    {/* World icon */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm">
                      {worldEmoji ? (
                        <span className="text-base" title={worldName ?? ""}>
                          {worldEmoji}
                        </span>
                      ) : (
                        <Globe className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {activityName ?? exp.activity_id ?? "Unknown experiment"}
                      </p>
                      <div className="flex items-center gap-2">
                        {worldName && (
                          <span className="text-[10px] font-medium text-slate-400">{worldName}</span>
                        )}
                        {exp.duration_ms && (
                          <span className="text-[10px] text-slate-400">
                            · {Math.round(exp.duration_ms / 1000)}s
                          </span>
                        )}
                      </div>
                    </div>
                    {score !== undefined && (
                      <span className={`text-xs font-black px-2 py-1 rounded-md ${
                        (score as number) >= 80 ? "bg-emerald-100 text-emerald-700" :
                        (score as number) >= 60 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {Math.round(score as number)}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
