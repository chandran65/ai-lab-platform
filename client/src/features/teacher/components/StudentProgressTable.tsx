import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Loader2, AlertCircle, Search, ArrowUpDown, Trophy, Globe, UserPlus } from "lucide-react";
import { useTeacherStudents } from "../hooks/useTeacherAnalytics";
import StudentDetailModal from "./StudentDetailModal";
import BulkAssignModal from "./BulkAssignModal";

export default function StudentProgressTable({ classId }: { classId?: string }) {
  const { data: students, isLoading, isError, refetch } = useTeacherStudents(classId);
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [sortField, setSortField] = useState<string>("total_xp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    if (!students) return [];
    let list = [...students];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const aVal = (a as any)[sortField] ?? 0;
      const bVal = (b as any)[sortField] ?? 0;
      return sortDir === "desc" ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });
    return list;
  }, [students, search, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

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
        <p className="text-xs font-bold text-red-500">Failed to load students</p>
        <button onClick={() => refetch()} className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600">
          Retry
        </button>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <Users className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No students enrolled</p>
        <p className="text-xs text-slate-300 text-center max-w-[220px]">
          Add students to your classes to see their progress.
        </p>
      </div>
    );
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  };

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-black text-slate-900">Student Progress</h3>
        <span className="ml-auto text-[10px] text-slate-400 font-medium">{students.length} students</span>
      </div>

      {selectedStudentId && (
        <StudentDetailModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}

      {showBulkAssign && (
        <BulkAssignModal
          studentIds={Array.from(selectedIds)}
          studentNames={filtered
            .filter((s) => selectedIds.has(s.id))
            .map((s) => s.name)}
          onClose={() => {
            setShowBulkAssign(false);
            setSelectedIds(new Set());
          }}
          onAssigned={() => {
            setShowBulkAssign(false);
            setSelectedIds(new Set());
            refetch();
          }}
        />
      )}

      {/* Search + Bulk Actions */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
          />
        </div>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 shrink-0"
          >
            <span className="text-xs font-bold text-slate-500">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => setShowBulkAssign(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Assign to Class
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-2 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  onClick={stopProp}
                  className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
              </th>
              {[
                { key: "name", label: "Name" },
                { key: "total_xp", label: "XP" },
                { key: "badges_count", label: "Badges" },
                { key: "skills", label: "Top Skill" },
                { key: "worlds_completed", label: "Worlds" },
              ].map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  onClick={() => toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1 font-bold text-slate-600 text-xs uppercase tracking-wider">
                    {col.label}
                    <ArrowUpDown className={`w-3 h-3 ${sortField === col.key ? "text-amber-500" : "text-slate-300"}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((student, i) => {
              const topSkill = student.skills.length > 0
                ? student.skills.reduce((a, b) => (a.score > b.score ? a : b))
                : null;
              const isSelected = selectedIds.has(student.id);
              return (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                    isSelected ? "bg-amber-50/50" : ""
                  }`}
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  <td className="px-2 py-3" onClick={stopProp}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(student.id)}
                      className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xs">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{student.name}</p>
                        <p className="text-[10px] text-slate-400">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-black text-indigo-600">{student.total_xp.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-bold text-slate-700">{student.badges_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {topSkill ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700">{topSkill.name}</span>
                        <span className="text-[10px] font-black text-indigo-500">{Math.round(topSkill.score)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-bold text-slate-700">{student.worlds_completed.length}</span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && search && (
        <p className="text-center text-sm text-slate-400 mt-4">No students matching "{search}"</p>
      )}
    </div>
  );
}
