import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { activitiesAPI } from "../services/api";
import { Sparkles, Image, FileText, Music, Eye, Rocket, Filter, Lightbulb, PlayCircle, Star, MoveRight } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  description: string;
  activity_type: string;
  grade_levels: number[];
  difficulty: "beginner" | "intermediate" | "advanced";
  is_public: boolean;
}

const typeConfig: Record<string, { icon: typeof Image, color: string, bg: string }> = {
  image_classifier: { icon: Image, color: "text-blue-500", bg: "from-blue-400 to-cyan-400" },
  text_classifier: { icon: FileText, color: "text-pink-500", bg: "from-pink-400 to-rose-400" },
  object_detection: { icon: Eye, color: "text-purple-500", bg: "from-purple-400 to-[#5e2d8b]" },
  audio_classifier: { icon: Music, color: "text-green-500", bg: "from-emerald-400 to-teal-400" },
};

const diffConfig = {
  beginner: { label: "Beginner", ring: "ring-green-400", bg: "bg-green-50 text-green-700 border-green-200" },
  intermediate: { label: "Intermediate", ring: "ring-amber-400", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  advanced: { label: "Advanced", ring: "ring-rose-400", bg: "bg-rose-50 text-rose-700 border-rose-200" },
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
        // Sort beginners first for better student progression
        setActivities(res.data.sort((a: Activity, b: Activity) => 
            a.difficulty === 'beginner' ? -1 : (b.difficulty === 'beginner' ? 1 : 0)
        ));
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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-[#5e2d8b] rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-2 border-t-4 border-[#5e2d8b] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4 font-sans animate-in fade-in">
      
      {/* Header Banner */}
      <div className="bg-[#5e2d8b] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border-b-[6px] border-[#441d6b]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-yellow-300" />
                    Guided AI Experiments
                </h1>
                <p className="text-purple-100 font-medium text-lg max-w-xl">
                    Step-by-step interactive missions designed to teach you how Artificial Intelligence sees, hears, and reads the world.
                </p>
            </div>
            <div className="hidden md:flex bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/20 items-center justify-center">
                <Lightbulb className="w-10 h-10 text-yellow-300 animate-pulse" />
                <div className="ml-4">
                    <div className="text-xs font-bold text-purple-200 uppercase tracking-widest">Your Next Goal</div>
                    <div className="font-bold text-white">Complete a Beginner Mission!</div>
                </div>
            </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <div className="bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm flex items-center shrink-0">
           <Filter className="h-4 w-4 text-slate-400 mr-2" />
           <span className="text-sm font-bold text-gray-500 pr-2 border-r border-gray-200">Sort by Media</span>
        </div>
        {["all", "image_classifier", "object_detection", "text_classifier", "audio_classifier"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-5 py-2 rounded-full text-sm font-extrabold capitalize transition-all whitespace-nowrap shrink-0 ${
              filter === type
                ? "bg-[#5e2d8b] text-white shadow-md scale-105"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {type === "all" ? "All Experiments" : type.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Experiment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((activity) => {
          const config = typeConfig[activity.activity_type] || { icon: Sparkles, color: "text-[#5e2d8b]", bg: "from-purple-500 to-[#5e2d8b]" };
          const Icon = config.icon;
          const diff = diffConfig[activity.difficulty] || diffConfig.beginner;

          return (
            <div
              key={activity.id}
              className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-200 hover:${diff.ring} hover:ring-2 flex flex-col`}
            >
              {/* Card Banner Image Substitute */}
              <div className={`h-36 bg-gradient-to-br ${config.bg} rounded-t-2xl relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                <Icon className="h-16 w-16 text-white drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
              </div>
              
              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col relative">
                
                {/* Floating Action Button */}
                <button 
                  onClick={() => handleLaunch(activity.id)}
                  className="absolute -top-7 right-6 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white text-[#5e2d8b] group-hover:bg-[#5e2d8b] group-hover:text-white transition-colors z-10 active:scale-95"
                >
                    <PlayCircle className="w-8 h-8" />
                </button>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${diff.bg}`}>
                    {activity.difficulty}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Grades {activity.grade_levels[0]}-{activity.grade_levels[activity.grade_levels.length - 1]}
                  </span>
                </div>

                <h3 className="font-black text-gray-900 text-xl mb-2 line-clamp-1 group-hover:text-[#5e2d8b] transition-colors">{activity.name}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                  {activity.description}
                </p>
                
                <div className="mt-auto">
                    <button
                        onClick={() => handleLaunch(activity.id)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-sm font-bold group-hover:border-[#5e2d8b] group-hover:bg-purple-50 transition-colors"
                    >
                        <Rocket className="h-4 w-4" /> Start Experiment <MoveRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center bg-white rounded-3xl p-16 border border-gray-200 shadow-sm max-w-2xl mx-auto mt-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No experiments found</h3>
          <p className="text-gray-500 font-medium">Try changing your media filter above to see other exciting AI experiments!</p>
          <button onClick={() => setFilter('all')} className="mt-6 px-6 py-2 bg-[#5e2d8b] text-white rounded-full font-bold shadow-sm hover:bg-purple-800 transition-colors">
              View All Experiments
          </button>
        </div>
      )}
    </div>
  );
}
