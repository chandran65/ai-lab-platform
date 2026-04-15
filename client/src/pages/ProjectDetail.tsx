import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { projectsAPI, datasetsAPI, mlAPI } from "../services/api";
import {
  ArrowLeft, Upload, Play, Brain, Database, BarChart3,
  Trash2, Plus, Loader2, CheckCircle, XCircle, Clock
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  project_type: string;
  status: string;
}

interface Dataset {
  id: string;
  name: string;
  dataset_type: string;
  classes: string;
  sample_count: number;
  status: string;
}

interface TrainingJob {
  id: string;
  status: string;
  progress: number;
  config: string;
  metrics: string;
  created_at: string;
}

interface Model {
  id: string;
  name: string;
  accuracy: number;
  status: string;
  created_at: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"data" | "train" | "models">("data");
  const [showCreateDataset, setShowCreateDataset] = useState(false);
  const [newDataset, setNewDataset] = useState({ name: "", dataset_type: "image", classes: "" });
  const [training, setTraining] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [p, d, j, m] = await Promise.all([
        projectsAPI.get(id),
        datasetsAPI.list(id),
        mlAPI.listJobs(id),
        mlAPI.listModels(id),
      ]);
      setProject(p.data);
      setDatasets(d.data);
      setJobs(j.data);
      setModels(m.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await datasetsAPI.create(id, {
        name: newDataset.name,
        dataset_type: newDataset.dataset_type,
        classes: newDataset.classes.split(",").map((c) => c.trim()).filter(Boolean),
      });
      setShowCreateDataset(false);
      setNewDataset({ name: "", dataset_type: "image", classes: "" });
      await loadData();
    } catch {
      // ignore
    }
  };

  const handleTrain = async (datasetId: string) => {
    if (!id) return;
    setTraining(true);
    try {
      await mlAPI.train({
        project_id: id,
        dataset_id: datasetId,
        config: { epochs: 10, learning_rate: 0.001, batch_size: 32 },
      });
      await loadData();
    } catch {
      // ignore
    } finally {
      setTraining(false);
    }
  };

  const handleDeleteDataset = async (datasetId: string) => {
    if (!id || !confirm("Delete this dataset?")) return;
    try {
      await datasetsAPI.delete(id, datasetId);
      await loadData();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-12 text-slate-400">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-slate-500">{project.description || "No description"}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {(["data", "train", "models"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "data" && <span className="inline-flex items-center gap-1.5"><Database className="h-4 w-4" />Datasets</span>}
            {t === "train" && <span className="inline-flex items-center gap-1.5"><Brain className="h-4 w-4" />Training</span>}
            {t === "models" && <span className="inline-flex items-center gap-1.5"><BarChart3 className="h-4 w-4" />Models</span>}
          </button>
        ))}
      </div>

      {tab === "data" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateDataset(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              New Dataset
            </button>
          </div>

          {showCreateDataset && (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <form onSubmit={handleCreateDataset} className="space-y-3">
                <input
                  type="text"
                  value={newDataset.name}
                  onChange={(e) => setNewDataset({ ...newDataset, name: e.target.value })}
                  placeholder="Dataset name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
                <select
                  value={newDataset.dataset_type}
                  onChange={(e) => setNewDataset({ ...newDataset, dataset_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="image">Image</option>
                  <option value="text">Text</option>
                  <option value="audio">Audio</option>
                </select>
                <input
                  type="text"
                  value={newDataset.classes}
                  onChange={(e) => setNewDataset({ ...newDataset, classes: e.target.value })}
                  placeholder="Classes (comma-separated, e.g. cat, dog, bird)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Create</button>
                  <button type="button" onClick={() => setShowCreateDataset(false)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {datasets.length > 0 ? (
            <div className="space-y-3">
              {datasets.map((ds) => (
                <div key={ds.id} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{ds.name}</h3>
                    <p className="text-sm text-slate-500">
                      {ds.dataset_type} &middot; {ds.sample_count} samples &middot;
                      Classes: {(Array.isArray(ds.classes) ? ds.classes : []).join(", ") || "none"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTrain(ds.id)}
                      disabled={training}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Train
                    </button>
                    <button
                      onClick={() => handleDeleteDataset(ds.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Upload className="h-10 w-10 mx-auto mb-2" />
              <p>No datasets yet. Create one to start training!</p>
            </div>
          )}
        </div>
      )}

      {tab === "train" && (
        <div className="space-y-3">
          {jobs.length > 0 ? (
            jobs.map((job) => {
              const metrics = typeof job.result === 'object' && job.result !== null ? job.result : {};
              return (
                <div key={job.id} className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {job.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {job.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                      {job.status === "running" && <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />}
                      {job.status === "queued" && <Clock className="h-5 w-5 text-amber-500" />}
                      <span className="font-medium text-slate-900 capitalize">{job.status}</span>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                    <div
                      className="bg-indigo-600 rounded-full h-2 transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500">
                    Progress: {job.progress}%
                    {metrics.accuracy && ` · Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Brain className="h-10 w-10 mx-auto mb-2" />
              <p>No training jobs yet. Add data and start training!</p>
            </div>
          )}
        </div>
      )}

      {tab === "models" && (
        <div className="space-y-3">
          {models.length > 0 ? (
            models.map((model) => (
              <div key={model.id} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">{model.name}</h3>
                  <p className="text-sm text-slate-500">
                    Accuracy: {(model.accuracy * 100).toFixed(1)}% &middot; {model.status}
                  </p>
                </div>
                <span className="text-xs text-slate-400">{new Date(model.created_at).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <BarChart3 className="h-10 w-10 mx-auto mb-2" />
              <p>No models yet. Train your first model!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
