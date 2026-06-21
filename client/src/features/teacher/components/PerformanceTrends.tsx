
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Loader2, AlertCircle, Activity } from "lucide-react";
import { usePerformanceTrends } from "../hooks/useTeacherAnalytics";

export default function PerformanceTrends({ classId }: { classId?: string }) {
  const { data: trends, isLoading, isError, refetch } = usePerformanceTrends(classId);

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
        <p className="text-xs font-bold text-red-500">Failed to load trends</p>
        <button onClick={() => refetch()} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700">
          Retry
        </button>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <TrendingUp className="w-10 h-10 text-slate-300" />
        <p className="text-sm font-bold text-slate-400">No trend data yet</p>
        <p className="text-xs text-slate-300 text-center max-w-[220px]">
          Data will appear as students complete activities.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-indigo-500" />
        <h3 className="text-base font-black text-slate-900">Performance Trends</h3>
        <span className="ml-auto text-[10px] text-slate-400 font-medium">Past 6 months</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avg XP Line Chart */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Average XP</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trends} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month_name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="avg_xp" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active Students Bar Chart */}
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Active Students</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trends} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month_name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: 600 }}
              />
              <Bar dataKey="active_students" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary snapshot */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {trends.length >= 2 && (
          <>
            {[
              {
                label: "XP Growth",
                value: `${((trends[trends.length - 1].avg_xp - trends[0].avg_xp) / Math.max(trends[0].avg_xp, 1) * 100).toFixed(0)}%`,
                color: trends[trends.length - 1].avg_xp >= trends[0].avg_xp ? "text-emerald-600" : "text-red-500",
              },
              {
                label: "Active Rate",
                value: `${Math.round((trends[trends.length - 1].active_students / Math.max(trends[trends.length - 1].total_students, 1)) * 100)}%`,
                color: "text-indigo-600",
              },
              {
                label: "Completion",
                value: `${trends[trends.length - 1].avg_completion}%`,
                color: "text-amber-600",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{stat.label}</p>
                <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
