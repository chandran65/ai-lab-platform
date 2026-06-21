import { useState } from "react";
import { motion } from "framer-motion";
import { Grid3X3, Loader2, AlertCircle } from "lucide-react";
import { useSkillHeatmap } from "../hooks/useTeacherAnalytics";

function scoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-emerald-400";
  if (score >= 40) return "bg-amber-400";
  if (score >= 20) return "bg-orange-400";
  return "bg-red-400";
}

function scoreBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-800";
  if (score >= 60) return "bg-emerald-50 text-emerald-700";
  if (score >= 40) return "bg-amber-50 text-amber-700";
  if (score >= 20) return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
}

export default function SkillHeatmap({ classId }: { classId?: string }) {
  const { data, isLoading, isError, refetch } = useSkillHeatmap(classId);
  const [sortBy, setSortBy] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-xs font-bold text-red-500">Failed to load skill heatmap</p>
        <button onClick={() => refetch()} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.students || data.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <Grid3X3 className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No skill data yet</p>
        <p className="text-xs text-slate-300 text-center max-w-[220px]">
          Students need to complete experiments to generate skill data.
        </p>
      </div>
    );
  }

  const { skills = [], students = [], class_averages = {} } = data;

  // Sort students by a skill score if sortBy is set
  const sortedStudents = sortBy
    ? [...students].sort((a, b) => (b.scores[sortBy] ?? 0) - (a.scores[sortBy] ?? 0))
    : students;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Grid3X3 className="w-5 h-5 text-indigo-500" />
        <h3 className="text-base font-black text-slate-900">Skill Heatmap</h3>
        <span className="ml-auto text-[10px] text-slate-400 font-medium">
          {students.length} students × {skills.length} skills
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-4 text-[10px] font-bold text-slate-500">
        <span>Low</span>
        {[20, 40, 60, 80].map((t) => (
          <div key={t} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${scoreColor(t)}`} />
            <span>{t}+</span>
          </div>
        ))}
        <span>High</span>
      </div>

      {/* Scrollable heatmap table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="sticky left-0 bg-slate-50 z-10 text-left px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider min-w-[140px]">
                Student
              </th>
              {skills.map((skill) => (
                <th
                  key={skill}
                  className={`text-center px-2 py-2.5 font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                    sortBy === skill ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setSortBy(sortBy === skill ? "" : skill)}
                >
                  {skill}
                  {sortBy === skill && <span className="ml-1">↓</span>}
                </th>
              ))}
              <th className="text-center px-2 py-2.5 font-bold text-slate-500 uppercase tracking-wider">
                Avg
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedStudents.map((student, i) => (
              <motion.tr
                key={student.student_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="sticky left-0 bg-white z-10 px-3 py-2 font-bold text-slate-700 border-r border-slate-100">
                  {student.student_name}
                </td>
                {skills.map((skill) => {
                  const score = student.scores[skill] ?? 0;
                  return (
                    <td key={skill} className="px-2 py-2 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-[10px] ${scoreBgColor(score)}`}
                        title={`${student.student_name}: ${skill} = ${score}`}
                      >
                        {Math.round(score)}
                      </div>
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-center font-bold text-slate-500 text-[10px]">
                  {Math.round(
                    skills.reduce((sum, s) => sum + (student.scores[s] ?? 0), 0) / Math.max(skills.length, 1)
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
          {/* Class averages row */}
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td className="sticky left-0 bg-slate-50 z-10 px-3 py-2.5 font-bold text-slate-600 text-[11px] border-r border-slate-200">
                Class Avg
              </td>
              {skills.map((skill) => {
                const avg = class_averages[skill] ?? 0;
                return (
                  <td key={skill} className="px-2 py-2.5 text-center">
                    <span className="font-bold text-[11px] text-slate-600">{avg.toFixed(1)}</span>
                  </td>
                );
              })}
              <td className="px-2 py-2.5 text-center font-bold text-slate-600 text-[11px]">
                {(Object.values(class_averages).reduce((a, b) => a + b, 0) / Math.max(Object.keys(class_averages).length, 1)).toFixed(1)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
