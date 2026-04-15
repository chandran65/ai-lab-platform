import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FolderOpen, Sparkles, Trophy, Clock, Plus, ArrowRight } from "lucide-react";

interface Stats {
  projects_count: number;
  activities_completed: number;
  models_trained: number;
  hours_learned: number;
  average_accuracy: number;
  recent_activity: { name: string; count: number }[];
}

interface Project {
  id: string;
  name: string;
  project_type: string;
  status: string;
  updated_at: string;
}

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

const typeLabels: Record<string, string> = {
  image_classifier: "Image Classifier",
  text_classifier: "Text Classifier",
  object_detection: "Object Detection",
  audio_classifier: "Audio Classifier",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecentProjects(),
        ]);
        setStats(s.data);
        setProjects(p.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const chartData = stats?.recent_activity || [];
  const pieData = projects.reduce((acc, p) => {
    const type = typeLabels[p.project_type] || p.project_type;
    const existing = acc.find((d) => d.name === type);
    if (existing) existing.value++;
    else acc.push({ name: type, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your AI projects</p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Projects", value: stats?.projects_count || 0, icon: FolderOpen, color: "bg-indigo-50 text-indigo-600" },
          { label: "Activities Done", value: stats?.activities_completed || 0, icon: Sparkles, color: "bg-purple-50 text-purple-600" },
          { label: "Models Trained", value: stats?.models_trained || 0, icon: Trophy, color: "bg-amber-50 text-amber-600" },
          { label: "Hours Learning", value: stats?.hours_learned || 0, icon: Clock, color: "bg-emerald-50 text-emerald-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Activity Overview</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>Complete some activities to see your progress!</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Projects by Type</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>Create projects to see distribution!</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Projects</h2>
          <Link to="/projects" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{project.name}</p>
                  <p className="text-sm text-slate-500">{typeLabels[project.project_type] || project.project_type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    project.status === "active" ? "bg-green-100 text-green-700" :
                    project.status === "completed" ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {project.status}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-slate-400">
              No projects yet. Create your first AI project!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
