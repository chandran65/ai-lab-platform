import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Loader2, Bell, BellOff, Plus, X, Check, Mail } from "lucide-react";
import {
  useReportSubscriptions,
  useCreateSubscription,
  useDeleteSubscription,
  useTriggerReport,
} from "../hooks/useReportSchedule";

const FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ScheduleReport({ classId, classes }: { classId?: string; classes: { id: string; name: string; grade_level: number }[] }) {
  const { data: subscriptions, isLoading } = useReportSubscriptions();
  const createSub = useCreateSubscription();
  const deleteSub = useDeleteSubscription();
  const triggerReport = useTriggerReport();

  const [showForm, setShowForm] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [scheduleClassId, setScheduleClassId] = useState(classId ?? "");

  const handleCreate = async () => {
    await createSub.mutateAsync({
      frequency,
      class_id: scheduleClassId || undefined,
      day_of_week: frequency === "weekly" ? dayOfWeek : 1,
      day_of_month: frequency === "monthly" ? dayOfMonth : 1,
    });
    setShowForm(false);
    setFrequency("weekly");
  };

  const handleDelete = async (id: string) => {
    await deleteSub.mutateAsync(id);
  };

  const handleTriggerNow = async () => {
    await triggerReport.mutateAsync(classId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
      </div>
    );
  }

  const activeSubs = subscriptions?.filter((s) => s.is_active) ?? [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-black text-slate-900">Scheduled Reports</h3>
        <span className="ml-auto text-[10px] text-slate-400 font-medium">
          {activeSubs.length} active
        </span>
      </div>

      {/* Active subscriptions */}
      {activeSubs.length > 0 && (
        <div className="space-y-2 mb-4">
          {activeSubs.map((sub) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3 border border-amber-200"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-amber-800">
                    {sub.frequency === "weekly"
                      ? `Every ${DAYS[sub.day_of_week] || "Mon"}`
                      : `Monthly on day ${sub.day_of_month}`}
                  </p>
                  {sub.next_send_at && (
                    <p className="text-[10px] text-amber-600">
                      Next: {new Date(sub.next_send_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(sub.id)}
                className="p-1 rounded-lg hover:bg-amber-100 text-amber-400 hover:text-red-500 transition-colors"
                title="Cancel subscription"
              >
                <BellOff className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create form or add button */}
      {showForm ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">New Schedule</span>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Frequency selector */}
          <div className="flex gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  frequency === f.value
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-amber-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Day selector */}
          {frequency === "weekly" ? (
            <div className="flex gap-1">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setDayOfWeek(i)}
                  className={`w-9 h-9 rounded-lg text-[10px] font-bold transition-all ${
                    dayOfWeek === i
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-amber-300"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600">Day of month:</span>
              <input
                type="number"
                min={1}
                max={28}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          )}

          {/* Class filter */}
          <select
            value={scheduleClassId}
            onChange={(e) => setScheduleClassId(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Grade {c.grade_level})
              </option>
            ))}
          </select>

          <button
            onClick={handleCreate}
            disabled={createSub.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-bold rounded-xl transition-all"
          >
            {createSub.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {createSub.isPending ? "Scheduling..." : "Schedule Report"}
          </button>
        </motion.div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-amber-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule
          </button>
          <button
            onClick={handleTriggerNow}
            disabled={triggerReport.isPending}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            {triggerReport.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            Generate Now
          </button>
        </div>
      )}

      {/* Trigger result feedback */}
      {triggerReport.data && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200"
        >
          <p className="text-xs font-bold text-emerald-700">
            Report generated: {triggerReport.data.data?.students_count ?? 0} students,
            {" "}{triggerReport.data.data?.skills_count ?? 0} skills tracked
          </p>
          <p className="text-[10px] text-emerald-600 mt-1">
            {(triggerReport.data as any)?.email_configured
              ? "Report will be emailed to you."
              : "Email delivery requires RESEND_API_KEY configuration."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
