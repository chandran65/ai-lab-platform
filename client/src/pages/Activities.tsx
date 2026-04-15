import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { activitiesAPI } from "../services/api";
import { Sparkles, Image, FileText, Music, Eye, Rocket, Filter } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  description: string;
  activity_type: string;
  grade_levels: number[];
  difficulty: string;
  is_public: boolean;
}

const typeIcons: Record<string, typeof Image> = {
  image_classifier: Image,
  text_classifier: FileText,
  object_detection: Eye,
  audio_classifier: Music,
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await activitiesAPI.list();
        setActivities(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = filter === "all" ? activities : activities.filter((a) => a.activity_type === filter);

  const handleLaunch = async (id: string) => {
    try {
      const res = await activitiesAPI.launch(id);
      navigate(`/projects/${res.data.project_id}`);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-indigo-600" />
            AI Activities
          </h1>
          <p className="text-slate-500 mt-1">Choose an activity to start learning AI</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        {["all", "image_classifier", "text_classifier", "object_detection", "audio_classifier"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === type
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {type === "all" ? "All" : type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((activity) => {
          const Icon = typeIcons[activity.activity_type] || Sparkles;
          return (
            <div
              key={activity.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon className="h-12 w-12 text-white/80" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900">{activity.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[activity.difficulty] || "bg-slate-100 text-slate-600"}`}>
                    {activity.difficulty}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Grades {activity.grade_levels[0]}-{activity.grade_levels[activity.grade_levels.length - 1]}
                  </span>
                  <button
                    onClick={() => handleLaunch(activity.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Rocket className="h-3.5 w-3.5" />
                    Launch
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Sparkles className="h-12 w-12 mx-auto mb-3" />
          <p>No activities found for this filter</p>
        </div>
      )}
    </div>
  );
}
