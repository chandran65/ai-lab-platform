import { motion } from "framer-motion";
import { Users, BookOpen, Trophy, GraduationCap, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useTeacherOverview } from "../hooks/useTeacherAnalytics";

export default function TeacherOverview() {
  const { data, isLoading, isError, refetch } = useTeacherOverview();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-xs font-bold text-red-500">Failed to load overview</p>
        <button onClick={() => refetch()} className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Students", value: data.total_students, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Active Classes", value: data.total_classes, icon: BookOpen, color: "bg-indigo-50 text-indigo-600" },
    { label: "Avg Completion", value: `${data.average_completion}%`, icon: Trophy, color: "bg-emerald-50 text-emerald-600" },
    { label: "AI Readiness", value: data.total_students > 0 ? "In Progress" : "N/A", icon: GraduationCap, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-black text-slate-900">Class Overview</h2>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Class list */}
      {data.classes.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-slate-800 mb-3">Your Classes</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Class</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Grade</th>
                  <th className="text-center px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Students</th>
                  <th className="text-center px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Avg Completion</th>
                  <th className="text-center px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.classes.map((cls, i) => (
                  <motion.tr
                    key={cls.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-800">{cls.name}</td>
                    <td className="px-4 py-3 text-slate-500">Grade {cls.grade_level}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{cls.student_count}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        cls.avg_completion >= 70 ? "bg-emerald-50 text-emerald-700" :
                        cls.avg_completion >= 40 ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-700"
                      }`}>
                        {cls.avg_completion}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-600">{cls.total_xp.toLocaleString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.classes.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-bold">No classes yet</p>
          <p className="text-xs mt-1">Create a class to start tracking student progress.</p>
        </div>
      )}
    </div>
  );
}
