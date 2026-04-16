import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FolderOpen, Sparkles, Trophy, TerminalSquare, BookOpenText, Puzzle, LayoutGrid, BrainCircuit, Box, Palette, XCircle, GraduationCap, Users } from "lucide-react";

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
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"student" | "teacher">("student");

  // Visual Assistant State
  const [showHelper, setShowHelper] = useState(false);

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
    
    // Auto-show helper for students after a delay
    if (viewMode === "student") {
        const timer = setTimeout(() => setShowHelper(true), 1500);
        return () => clearTimeout(timer);
    }
  }, [viewMode]);

  const chartData = stats?.recent_activity || [];
  const pieData = projects.reduce((acc, p) => {
    const type = typeLabels[p.project_type] || p.project_type;
    const existing = acc.find((d) => d.name === type);
    if (existing) existing.value++;
    else acc.push({ name: type, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-[#5e2d8b] rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-2 border-t-4 border-[#5e2d8b] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative font-sans animate-in fade-in transition-all duration-500">
      
      {/* Mode Switcher */}
      <div className="flex justify-end mb-4">
        <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 inline-flex items-center gap-1">
           <button 
             onClick={() => setViewMode("student")}
             className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${viewMode === "student" ? 'bg-[#5e2d8b] text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             <Sparkles className="w-4 h-4" /> Student Studio
           </button>
           <button 
             onClick={() => setViewMode("teacher")}
             className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${viewMode === "teacher" ? 'bg-amber-500 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             <GraduationCap className="w-4 h-4" /> Teacher Analytics
           </button>
        </div>
      </div>

      {viewMode === "student" ? (
        /* --- VISUAL STUDENT STUDIO DASHBOARD --- */
        <div className="max-w-6xl mx-auto w-full mb-16">
            
            {/* Header Box */}
            <div className="bg-[#5e2d8b] text-white text-center py-6 rounded-t-3xl shadow-md border-b-[6px] border-[#441d6b] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <h1 className="text-3xl font-black tracking-wide relative z-10 drop-shadow-md">What would you like to do?</h1>
            </div>

            <div className="bg-[#f8f9fa] border-x border-b border-gray-200 rounded-b-3xl p-8 shadow-sm">
                
                {/* Row 1: Block Coding & Python Coding */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Block Coding Box */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-center font-black text-gray-800 text-lg mb-6 tracking-wide">Block Coding</h2>
                      <div className="grid grid-cols-2 gap-4">
                          <Link to="/block-editor" className="flex flex-col items-center p-6 border-2 border-transparent hover:border-blue-200 hover:bg-blue-50 hover:-translate-y-1 transition-all rounded-xl relative group">
                              <span className="absolute top-2 right-2 bg-purple-100 text-[#5e2d8b] text-[10px] font-black px-2 py-1 rounded-full opacity-80">Ages 4+</span>
                              <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-blue-400 rounded-lg shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <Puzzle className="w-8 h-8 text-white drop-shadow" />
                              </div>
                              <h3 className="font-extrabold text-gray-900 mb-1">Junior Blocks</h3>
                              <p className="text-xs text-gray-500 text-center px-2">Code by stacking puzzle-shaped blocks</p>
                          </Link>
                          
                          <Link to="/activities" className="flex flex-col items-center p-6 border-2 border-transparent hover:border-pink-200 hover:bg-pink-50 hover:-translate-y-1 transition-all rounded-xl relative group">
                              <span className="absolute top-2 right-2 bg-purple-100 text-[#5e2d8b] text-[10px] font-black px-2 py-1 rounded-full opacity-80">Ages 7+</span>
                              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <LayoutGrid className="w-8 h-8 text-white drop-shadow" />
                              </div>
                              <h3 className="font-extrabold text-gray-900 mb-1">Blocks</h3>
                              <p className="text-xs text-gray-500 text-center px-2">Code with playful puzzle-shaped blocks</p>
                          </Link>
                      </div>
                    </div>

                    {/* Python Coding Box */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-center font-black text-gray-800 text-lg mb-6 tracking-wide">Python Coding</h2>
                      <div className="grid grid-cols-2 gap-4">
                          <Link to="/notebook" className="flex flex-col items-center p-6 border-2 border-transparent hover:border-yellow-200 hover:bg-yellow-50 hover:-translate-y-1 transition-all rounded-xl relative group">
                              <span className="absolute top-2 right-2 bg-purple-100 text-[#5e2d8b] text-[10px] font-black px-2 py-1 rounded-full opacity-80">Ages 12+</span>
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-yellow-400 rounded-lg shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <TerminalSquare className="w-8 h-8 text-white drop-shadow" />
                              </div>
                              <h3 className="font-extrabold text-gray-900 mb-1">Py Editor</h3>
                              <p className="text-xs text-gray-500 text-center px-2">Code with text based coding in Python.</p>
                          </Link>
                          
                          <Link to="/notebook" className="flex flex-col items-center p-6 border-2 border-transparent hover:border-indigo-200 hover:bg-indigo-50 hover:-translate-y-1 transition-all rounded-xl relative group">
                              <span className="absolute top-2 right-2 bg-purple-100 text-[#5e2d8b] text-[10px] font-black px-2 py-1 rounded-full opacity-80">Ages 12+</span>
                              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                  <BookOpenText className="w-8 h-8 text-white drop-shadow" />
                              </div>
                              <h3 className="font-extrabold text-gray-900 mb-1">Py Notebook</h3>
                              <p className="text-xs text-gray-500 text-center px-2">Code with text based coding in Notebook format.</p>
                          </Link>
                      </div>
                    </div>
                </div>

                {/* Row 2: Advanced Tech */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    
                    {/* Machine Learning Box */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer border-2 border-transparent hover:border-[#5e2d8b]/30 hover:shadow-md transition-all group" onClick={() => navigate('/create-project')}>
                        <span className="float-right bg-purple-100 text-[#5e2d8b] text-[10px] font-black px-2 py-1 rounded-full">Ages 12+</span>
                        <div className="flex flex-col items-center text-center mt-2">
                           <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-[#5e2d8b] to-pink-500 rounded-2xl shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                               <BrainCircuit className="w-10 h-10 text-white" />
                           </div>
                           <h3 className="font-black text-gray-900 text-xl mb-2">Machine Learning Environment</h3>
                           <p className="text-sm text-gray-500 max-w-[80%]">Train ML models for image, object, face, pose (hand and body), sound, NLP, and numbers.</p>
                        </div>
                    </div>

                    {/* 3D and XR Studio Box */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer border-2 border-transparent hover:border-blue-300 hover:shadow-md transition-all group">
                        <span className="float-right bg-purple-100 text-[#5e2d8b] text-[10px] font-black px-2 py-1 rounded-full">Ages 12+</span>
                        <div className="flex flex-col items-center text-center mt-2">
                           <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                               <Box className="w-10 h-10 text-white" />
                           </div>
                           <h3 className="font-black text-gray-900 text-xl mb-2">3D and XR Studio</h3>
                           <p className="text-sm text-gray-500 max-w-[80%]">Create interactive 3D projects in AR/VR with animations, physics, trackers, filters, and much more.</p>
                        </div>
                    </div>

                </div>

                {/* Bottom Row */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-center font-black text-gray-800 text-lg mb-4 tracking-wide">More Tools</h2>
                    <div className="flex justify-center">
                        <div className="flex items-center gap-4 py-3 px-6 border-2 border-gray-100 rounded-xl hover:border-orange-200 hover:bg-orange-50 cursor-pointer transition-all group">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <Palette className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-lg">Paint</h3>
                                <p className="text-sm text-gray-500">Draw, color, and create designs</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* AI Student Assistant Overlay */}
            {showHelper && (
              <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
                <div className="bg-white p-4 rounded-2xl shadow-2xl border-2 border-[#5e2d8b] flex items-start gap-4 max-w-[300px] relative">
                    <button onClick={() => setShowHelper(false)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors">
                       <XCircle className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 bg-[#5e2d8b] text-white rounded-full flex items-center justify-center shrink-0 animate-bounce">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-[#5e2d8b] text-sm mb-1">Hi {user?.full_name?.split(" ")[0]}! 👋</h4>
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                            Looking to build your first AI model? Click on the <b>Machine Learning Environment</b> to get started!
                        </p>
                        <button className="mt-2 text-xs font-bold text-white bg-[#5e2d8b] px-3 py-1.5 rounded-full hover:bg-purple-800 shadow-sm" onClick={() => navigate('/activities')}>
                           See guided experiments
                        </button>
                    </div>
                </div>
              </div>
            )}
            
        </div>
      ) : (
        /* --- TEACHER ANALYTICS DASHBOARD --- */
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Educator Global View
                </h1>
                <p className="text-slate-500 mt-1">Review organizational metrics, AI adoption, and student progress.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                { label: "Total Students", value: 142, icon: Users, color: "bg-blue-50 text-blue-600" },
                { label: "Projects Created", value: stats?.projects_count || 0, icon: FolderOpen, color: "bg-indigo-50 text-indigo-600" },
                { label: "Models Trained", value: stats?.models_trained || 0, icon: Trophy, color: "bg-amber-50 text-amber-600" },
                { label: "Avg Class Accuracy", value: `${(stats?.average_accuracy || 0.85) * 100}%`, icon: Sparkles, color: "bg-emerald-50 text-emerald-600" },
                ].map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                        <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black text-slate-900">Activity Overview</h2>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold">Past 30 Days</span>
                </div>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="count" fill="#5e2d8b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                    <BarChart className="w-12 h-12 mb-3 text-slate-300" />
                    <p className="font-medium">No activity data collected yet.</p>
                    </div>
                )}
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-6">ML Model Utilization</h2>
                {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={60} dataKey="value" label={{fill: '#475569', fontSize: 12, fontWeight: 600}}>
                        {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-64 flex items-center justify-center text-slate-400">
                    <p className="font-medium">Create projects to view class metrics.</p>
                    </div>
                )}
                </div>
            </div>

        </div>
      )}

    </div>
  );
}
