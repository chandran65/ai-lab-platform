import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { gamesAPI } from "../services/api";
import { evaluateSkills, getSkillRatings, getBadges, SkillRating, Badge } from "../lib/skillsEngine";
import { Award, User, Calendar, Mail, Compass, Star, CheckCircle, Lock, HelpCircle, Trophy } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"capabilities" | "badges">("capabilities");
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await gamesAPI.getAllProgress();
        setProgress(res.data);
      } catch (err) {
        console.error("Failed to load progress for profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

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

  const skillScores = evaluateSkills(progress);
  const skillRatings = getSkillRatings(skillScores);
  const badgesList = getBadges(skillScores, progress);

  // Compute overall stats
  const unlockedBadgesCount = badgesList.filter((b) => b.unlocked).length;
  const trainStars = progress["train_builder"]?.stars || 0;
  const weatherCoins = progress["weather_adventure"]?.coins || 0;
  
  // Find highest scoring skill
  const topSkill = [...skillRatings].sort((a, b) => b.score - a.score)[0];

  // Calculate total games played
  const gamesPlayed = Object.keys(progress).length;

  return (
    <div className="max-w-6xl mx-auto w-full py-4 font-sans animate-in fade-in transition-all duration-500 space-y-10">
      
      {/* 👤 Premium Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Avatar with dynamic glow */}
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full blur opacity-75 animate-pulse" />
            <div className="relative w-28 h-28 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-4xl font-extrabold shadow-2xl">
              {user?.full_name?.slice(0, 2).toUpperCase() || "ME"}
            </div>
            {unlockedBadgesCount > 0 && (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-2 border-2 border-slate-950 shadow-md">
                <Trophy className="w-5 h-5 fill-amber-300/30" />
              </span>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{user?.full_name}</h1>
              <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs mt-1.5 flex items-center justify-center md:justify-start gap-1">
                <Compass className="w-3.5 h-3.5" /> Mindora Arcade Scholar
              </p>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-300 text-sm">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 rounded-xl border border-white/10">
                <Mail className="w-4 h-4 text-slate-400" /> {user?.email || "scholar@mindora.edu"}
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 rounded-xl border border-white/10 capitalize">
                <User className="w-4 h-4 text-slate-400" /> {user?.role || "Student"}
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 rounded-xl border border-white/10">
                <Calendar className="w-4 h-4 text-slate-400" /> Joined Playground
              </span>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-3 gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs shrink-0 w-full md:w-auto">
            <div className="text-center">
              <span className="block text-2xl font-black text-amber-400">{trainStars}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Stars</span>
            </div>
            <div className="text-center border-x border-white/10 px-4">
              <span className="block text-2xl font-black text-cyan-400">{unlockedBadgesCount}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Badges</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-emerald-400">{gamesPlayed}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Missions</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* 🧠 COLUMN 1 & 2: Capability Analysis */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Dynamic Insight Banner */}
          {topSkill && topSkill.score > 0 ? (
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950/40 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-4">
              <span className="text-4xl">{topSkill.emoji}</span>
              <div className="space-y-1">
                <h4 className="font-black text-indigo-950 dark:text-indigo-200">Your Top Capability: {topSkill.name}</h4>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Excellent work! Your performance shows you are a **{topSkill.level}** in {topSkill.name}. 
                  {topSkill.description} Look at the suggestions below to sharpen your other skills.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-slate-900 dark:to-amber-950/20 rounded-3xl p-6 border border-amber-100 dark:border-amber-900/20 flex items-start gap-4">
              <span className="text-4xl">🚀</span>
              <div className="space-y-1">
                <h4 className="font-black text-amber-900 dark:text-amber-200">Welcome to your Cognitive Profile!</h4>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Start playing games like Weather Adventure, Choo Choo Train, Turtle Path, or Bee Flower Path to evaluate your capabilities. Your progress will show up right here!
                </p>
              </div>
            </div>
          )}

          {/* Capabilities Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-md space-y-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" /> Cognitive Capabilities Profile
            </h2>

            <div className="space-y-6">
              {skillRatings.map((rating) => (
                <div key={rating.id} className="group bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 transition-colors space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {rating.emoji}
                      </span>
                      <div>
                        <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg">{rating.name}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{rating.level}</p>
                      </div>
                    </div>
                    {/* Score badge */}
                    <span className="px-3.5 py-1.5 rounded-full text-sm font-extrabold bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shadow-xs text-slate-700 dark:text-slate-200 sm:self-center">
                      Score: {rating.score} / 100
                    </span>
                  </div>

                  {/* Progress Bar wrapper */}
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${
                          rating.id === "sharp" ? "from-red-400 to-rose-500" :
                          rating.id === "thinker" ? "from-indigo-400 to-indigo-600" :
                          rating.id === "patient" ? "from-emerald-400 to-green-500" :
                          rating.id === "consistent" ? "from-amber-400 to-yellow-500" :
                          "from-purple-400 to-fuchsia-600"
                        } transition-all duration-1000`}
                        style={{ width: `${rating.score}%` }}
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                      {rating.description}
                    </p>
                  </div>

                  {/* Suggestion / Tip box */}
                  <div className={`p-3.5 rounded-xl border ${rating.color} text-xs font-medium leading-relaxed`}>
                    {rating.improvementTip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🎖️ COLUMN 3: Badges Collection Grid */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-md space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500 fill-amber-500/10" /> Badges Showcase
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-2">
                Complete level criteria inside games to unlock badges! Unlocked badges will light up.
              </p>
            </div>

            {/* Badges List */}
            <div className="space-y-3">
              {badgesList.map((badge) => (
                <div
                  key={badge.id}
                  onMouseEnter={() => setHoveredBadge(badge.id)}
                  onMouseLeave={() => setHoveredBadge(null)}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                    badge.unlocked
                      ? "bg-gradient-to-r from-amber-50/50 to-white dark:from-slate-800 dark:to-slate-900 border-amber-300/60 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      : "bg-slate-50/40 dark:bg-slate-950/20 border-slate-200/60 dark:border-slate-850 opacity-60 grayscale"
                  }`}
                >
                  {/* Badge Icon */}
                  <span className={`text-3xl w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    badge.unlocked
                      ? "bg-amber-100/60 dark:bg-amber-950/20"
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}>
                    {badge.icon}
                  </span>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-black text-sm truncate flex items-center gap-1.5 ${
                      badge.unlocked ? "text-slate-900 dark:text-white" : "text-slate-500"
                    }`}>
                      {badge.name}
                      {badge.unlocked ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </h3>
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">
                      {badge.skill} • Stage {badge.stage}
                    </p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {badge.description}
                    </p>
                  </div>

                  {/* Hover tooltip explanation */}
                  {hoveredBadge === badge.id && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-950 text-white rounded-xl p-3 shadow-xl z-30 text-xs leading-relaxed space-y-1.5 animate-in fade-in duration-200">
                      <p className="font-bold text-amber-400">Unlock Criteria:</p>
                      <p className="font-medium text-slate-300">{badge.criteria}</p>
                      <p className={`text-[10px] font-bold uppercase ${badge.unlocked ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {badge.unlocked ? "✓ Unlocked" : "🔒 Locked"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
