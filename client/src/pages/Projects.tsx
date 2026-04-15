import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectsAPI } from "../services/api";
import { FolderOpen, Plus, Search, Image, FileText, Eye, Music, ArrowRight, Trash2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  project_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const typeIcons: Record<string, typeof Image> = {
  image_classifier: Image,
  text_classifier: FileText,
  object_detection: Eye,
  audio_classifier: Music,
};

const typeLabels: Record<string, string> = {
  image_classifier: "Image Classifier",
  text_classifier: "Text Classifier",
  object_detection: "Object Detection",
  audio_classifier: "Audio Classifier",
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [newProject, setNewProject] = useState({ name: "", description: "", project_type: "image_classifier" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await projectsAPI.list();
      setProjects(res.data);
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
      await projectsAPI.create(newProject);
      setShowCreate(false);
      setNewProject({ name: "", description: "", project_type: "image_classifier" });
      await loadProjects();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await projectsAPI.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  };

  const filtered = projects.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  );

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
            <FolderOpen className="h-7 w-7 text-indigo-600" />
            My Projects
          </h1>
          <p className="text-slate-500 mt-1">Manage your AI projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Project</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="My AI Project"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Describe your project..."
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Type</label>
              <select
                value={newProject.project_type}
                onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="image_classifier">Image Classifier</option>
                <option value="text_classifier">Text Classifier</option>
                <option value="object_detection">Object Detection</option>
                <option value="audio_classifier">Audio Classifier</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
              >
                {creating ? "Creating..." : "Create Project"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => {
          const Icon = typeIcons[project.project_type] || FolderOpen;
          return (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{project.name}</h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{project.description || "No description"}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{typeLabels[project.project_type]}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      project.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <FolderOpen className="h-12 w-12 mx-auto mb-3" />
          <p>No projects found. Create your first AI project!</p>
        </div>
      )}
    </div>
  );
}
