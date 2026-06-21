import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../services/api";
import { Sparkles, TerminalSquare, BookOpenText, Puzzle, LayoutGrid, BrainCircuit, Box, Palette, XCircle, GraduationCap } from "lucide-react";
import LeaderboardPanel from "../features/gamification/components/LeaderboardPanel";
import SkillRadarChart from "../features/gamification/components/SkillRadarChart";
import SkillHistoryChart from "../features/gamification/components/SkillHistoryChart";
import { useTeacherOverview } from "../features/teacher/hooks/useTeacherAnalytics";
import TeacherOverview from "../features/teacher/components/TeacherOverview";
import SkillHeatmap from "../features/teacher/components/SkillHeatmap";
import StudentProgressTable from "../features/teacher/components/StudentProgressTable";
import PerformanceTrends from "../features/teacher/components/PerformanceTrends";
import LearningGaps from "../features/teacher/components/LearningGaps";
import AIReadiness from "../features/teacher/components/AIReadiness";
import ScheduleReport from "../features/teacher/components/ScheduleReport";
import { usePdfExport } from "../features/teacher/hooks/usePdfExport";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, setStats] = useState<any>(null);
  const [, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"student" | "teacher">("student");

  // Visual Assistant State
  const [showHelper, setShowHelper] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const { generatePdf, exporting } = usePdfExport();

  // Get class list from overview for the filter
  const { data: overviewData } = useTeacherOverview();
  const classes = overviewData?.classes ?? [];

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

                {/* Gamification Section — Leaderboard & Skill Progression */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <LeaderboardPanel />
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <SkillRadarChart />
                    </div>
                </div>

                {/* Skill History Timeline — full width */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
                    <SkillHistoryChart />
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
        /* --- TEACHER ANALYTICS DASHBOARD V2 --- */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                <h1 className="text-2xl font-black text-slate-900">
                    Educator Global View
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Comprehensive analytics across all your classes.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Class filter dropdown */}
                    <div className="relative">
                    <select
                        value={selectedClassId ?? ""}
                        onChange={(e) => setSelectedClassId(e.target.value || undefined)}
                        className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-8 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 cursor-pointer"
                    >
                        <option value="">All Classes</option>
                        {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name} (Grade {c.grade_level})
                        </option>
                        ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    </div>
                    <button
                    onClick={generatePdf}
                    disabled={exporting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
                    >
                    {exporting ? (
                    <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating...
                    </>
                    ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export PDF
                    </>
                    )}
                    </button>
                </div>
            </div>

            {/* Section 1: Class Overview */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <TeacherOverview />
            </div>

            {/* Section 2: Student Progress Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <StudentProgressTable classId={selectedClassId} />
            </div>

            {/* Section 3: Performance Trends */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <PerformanceTrends classId={selectedClassId} />
            </div>

            {/* Section 4: Two-column (Skill Heatmap + Learning Gaps) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <SkillHeatmap classId={selectedClassId} />
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <LearningGaps classId={selectedClassId} />
                </div>
            </div>

            {/* Section 5: Two-column (AI Readiness + Skill Progression) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <AIReadiness classId={selectedClassId} />
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <SkillRadarChart />
                </div>
            </div>

            {/* Section 6: Skill History Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <SkillHistoryChart />
            </div>

            {/* Section 7: Scheduled Reports */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <ScheduleReport classId={selectedClassId} classes={classes} />
            </div>

        </div>
      )}

    </div>
  );
}
