import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  School,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classesAPI } from "../../../services/api";

interface BulkAssignModalProps {
  studentIds: string[];
  studentNames: string[];
  onClose: () => void;
  onAssigned: () => void;
}

export default function BulkAssignModal({
  studentIds,
  studentNames,
  onClose,
  onAssigned,
}: BulkAssignModalProps) {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch teacher's classes
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await classesAPI.list();
      return res.data.classes as { id: string; name: string; grade_level: number; student_count: number }[];
    },
  });

  const classes = classesData ?? [];

  // Mutation: add students to class
  const assignMutation = useMutation({
    mutationFn: async () => {
      const res = await classesAPI.addStudents(selectedClassId, studentIds);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
      setShowSuccess(true);
      setTimeout(() => {
        onAssigned();
      }, 1500);
    },
  });

  const handleAssign = () => {
    if (!selectedClassId) return;
    assignMutation.mutate();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !assignMutation.isPending) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Assign to Class</h2>
                <p className="text-[11px] font-medium text-slate-400">
                  {studentIds.length} student{studentIds.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={assignMutation.isPending}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student list preview */}
          <div className="px-6 py-3 border-b border-slate-50">
            <div className="flex flex-wrap gap-1.5">
              {studentNames.slice(0, 10).map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600"
                >
                  <Users className="w-3 h-3" />
                  {name}
                </span>
              ))}
              {studentNames.length > 10 && (
                <span className="inline-flex items-center px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500">
                  +{studentNames.length - 10} more
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Success state */}
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-lg font-black text-slate-900">Assigned Successfully!</p>
                <p className="text-sm font-medium text-slate-400">
                  {studentIds.length} student{studentIds.length !== 1 ? "s" : ""} added to class
                </p>
              </motion.div>
            ) : (
              <>
                {/* Instructions */}
                <p className="text-sm font-medium text-slate-600 mb-4">
                  Choose a class to assign the selected students to:
                </p>

                {/* Class list */}
                {classesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  </div>
                ) : classes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <School className="w-10 h-10 text-slate-300" />
                    <p className="text-sm font-bold text-slate-400">No classes available</p>
                    <p className="text-xs text-slate-300 text-center max-w-[220px]">
                      Create a class first from the class management section.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => setSelectedClassId(cls.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          selectedClassId === cls.id
                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedClassId === cls.id
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          <School className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{cls.name}</p>
                          <p className="text-[10px] font-medium text-slate-400">
                            Grade {cls.grade_level} · {cls.student_count} student{cls.student_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {selectedClassId === cls.id && (
                          <ChevronRight className="w-5 h-5 text-indigo-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!showSuccess && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={onClose}
                disabled={assignMutation.isPending}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedClassId || assignMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
              >
                {assignMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Assign {studentIds.length} Student{studentIds.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
              {assignMutation.isError && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Failed to assign. Try again.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
