import { useState, useEffect } from "react";
import { dashboardAPI, classesAPI } from "../services/api";
import {
  GraduationCap, Users, FolderOpen, Brain, Plus,
  ChevronRight, BarChart3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TeacherStats {
  total_students: number;
  total_classes: number;
  total_projects: number;
  total_models: number;
  class_stats: { name: string; students: number; projects: number }[];
}

interface ClassItem {
  id: string;
  name: string;
  grade_level: number;
  description: string;
  student_count: number;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", grade_level: 6, description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [s, c] = await Promise.all([
        dashboardAPI.getTeacherDashboard(),
        classesAPI.list(),
      ]);
      setStats(s.data);
      setClasses(c.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await classesAPI.create(newClass);
      setShowCreate(false);
      setNewClass({ name: "", grade_level: 6, description: "" });
      await loadData();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-indigo-600" />
            Teacher Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Manage your classes and monitor student progress</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Students", value: stats?.total_students || 0, icon: Users, color: "bg-indigo-50 text-indigo-600" },
          { label: "Classes", value: stats?.total_classes || 0, icon: GraduationCap, color: "bg-purple-50 text-purple-600" },
          { label: "Projects", value: stats?.total_projects || 0, icon: FolderOpen, color: "bg-amber-50 text-amber-600" },
          { label: "Models Trained", value: stats?.total_models || 0, icon: Brain, color: "bg-emerald-50 text-emerald-600" },
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

      {stats?.class_stats && stats.class_stats.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Class Overview
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.class_stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="students" fill="#6366f1" name="Students" radius={[4, 4, 0, 0]} />
              <Bar dataKey="projects" fill="#8b5cf6" name="Projects" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {showCreate && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Class</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
              <input
                type="text"
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="e.g., Grade 8 - AI Explorers"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
              <select
                value={newClass.grade_level}
                onChange={(e) => setNewClass({ ...newClass, grade_level: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                rows={2}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
              >
                {creating ? "Creating..." : "Create Class"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Classes</h2>
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    Grade {cls.grade_level}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{cls.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{cls.description || "No description"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {cls.student_count || 0} students
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-200">
            <GraduationCap className="h-10 w-10 mx-auto mb-2" />
            <p>No classes yet. Create your first class!</p>
          </div>
        )}
      </div>
    </div>
  );
}
