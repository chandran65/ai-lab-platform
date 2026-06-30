import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Trophy, Play, Star, BrainCircuit, Flame, Award, 
  Calendar, CheckSquare, Sparkles, AlertCircle 
} from "lucide-react";
import { gamesAPI } from "../services/api";
import { evaluateSkills, getSkillRatings, getBadges } from "../lib/skillsEngine";
import { PortalLoader } from "../components/PortalLoader";

export default function GameHub() {
  const navigate = useNavigate();

  // Dynamic stats loaded from database / localStorage
  const [weatherLevel, setWeatherLevel] = useState(1);
  const [weatherCoins, setWeatherCoins] = useState(0);
  const [trainStars, setTrainStars] = useState(0);
  const [turtleLevel, setTurtleLevel] = useState(1);
  const [puppyLevel, setPuppyLevel] = useState(1);
  const [colorLevel, setColorLevel] = useState(1);
  const [beeLevel, setBeeLevel] = useState(1);
  const [classifierModelsTrained, setClassifierModelsTrained] = useState(0);
  const [classifierBestAccuracy, setClassifierBestAccuracy] = useState(0);
  const [kaggleAttempts, setKaggleAttempts] = useState(0);
  const [allProgress, setAllProgress] = useState<Record<string, any>>({});

  // Simulation loader states
  const [selectedGame, setSelectedGame] = useState<{ id: string; title: string; path: string } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const weatherData = localStorage.getItem("weather-adventure-progress");
        if (weatherData) {
          const parsed = JSON.parse(weatherData);
          if (parsed.level) setWeatherLevel(parsed.level);
          if (parsed.coins) setWeatherCoins(parsed.coins);
        }
      } catch {}

      try {
        const res = await gamesAPI.getAllProgress();
        const progress = res.data || {};
        setAllProgress(progress);

        // Weather
        const wData = progress["weather_adventure"];
        if (wData) {
          if (wData.level) setWeatherLevel(wData.level);
          if (wData.coins) setWeatherCoins(wData.coins);
        }

        // Choo Choo Train
        const trainData = progress["train_builder"];
        if (trainData) {
          if (typeof trainData.stars === "number") setTrainStars(trainData.stars);
        } else {
          setTrainStars(Number(localStorage.getItem("train_stars") || "0"));
        }

        // Turtle Path
        const turtleData = progress["turtle_path"];
        if (turtleData && typeof turtleData.maxUnlockedLevel === "number") {
          setTurtleLevel(turtleData.maxUnlockedLevel + 1);
        }

        // Feed Puppy
        const puppyData = progress["feed_puppy"];
        if (puppyData && typeof puppyData.maxUnlockedLevel === "number") {
          setPuppyLevel(puppyData.maxUnlockedLevel + 1);
        }

        // Colour Magic
        const colorData = progress["colour_magic"];
        if (colorData && typeof colorData.maxUnlockedLevel === "number") {
          setColorLevel(colorData.maxUnlockedLevel + 1);
        }

        // Bee Flower Path
        const beeData = progress["bee_flower_path"];
        if (beeData && typeof beeData.maxUnlockedLevel === "number") {
          setBeeLevel(beeData.maxUnlockedLevel + 1);
        }

        // Image Classifier
        const cData = progress["image_classifier"];
        if (cData) {
          if (typeof cData.modelsTrained === "number") setClassifierModelsTrained(cData.modelsTrained);
          if (typeof cData.bestAccuracy === "number") setClassifierBestAccuracy(cData.bestAccuracy);
        }

        // Kaggle Arena
        const kData = progress["kaggle_arena"];
        if (kData) {
          if (typeof kData.attempts === "number") setKaggleAttempts(kData.attempts);
        }
      } catch (err) {
        console.error("Failed to load platform dashboard data:", err);
      }
    };
    loadStats();
  }, []);

  const games = [
    {
      id: "weather",
      title: "🌦️ Weather Valley",
      path: "/games/weather",
      illustration: "🌈",
      description: "Explore weather portals and storm simulations.",
      stats: `Level ${weatherLevel} Explorer`,
      badge: "Weather Lab",
      xp: "XP +120",
      color: "border-[#69B8FF]/20 shadow-[#69B8FF]/5 hover:border-[#69B8FF]/50"
    },
    {
      id: "train",
      title: "🚂 Engineering Station",
      path: "/games/train",
      illustration: "🚂",
      description: "Build logic pathways and blueprint locomotives.",
      stats: `${trainStars} Stars Earned`,
      badge: "Train Builder",
      xp: "XP +100",
      color: "border-[#FFC88A]/20 shadow-[#FFC88A]/5 hover:border-[#FFC88A]/50"
    },
    {
      id: "turtle",
      title: "🐢 Algorithm Forest",
      path: "/games/turtle",
      illustration: "🏝️",
      description: "Queue movement cards to guide a cute turtle.",
      stats: `Level ${Math.min(turtleLevel, 5)}/5 Meadow`,
      badge: "Turtle Path",
      xp: "XP +150",
      color: "border-[#8BE39B]/20 shadow-[#8BE39B]/5 hover:border-[#8BE39B]/50"
    },
    {
      id: "puppy",
      title: "🐶 Puppy Care Plaza",
      path: "/games/puppy",
      illustration: "🦴",
      description: "Classify healthy treats for a happy puppy.",
      stats: `Level ${Math.min(puppyLevel, 10)}/10`,
      badge: "Feed Puppy",
      xp: "XP +80",
      color: "border-[#FFC88A]/20 shadow-[#FFC88A]/5 hover:border-[#FFC88A]/50"
    },
    {
      id: "color",
      title: "🎨 Magic Laboratory",
      path: "/games/color",
      illustration: "🧪",
      description: "Mix potion colors and light spectrums.",
      stats: `Level ${Math.min(colorLevel, 10)}/10`,
      badge: "Color Magic",
      xp: "XP +90",
      color: "border-[#B59CFF]/20 shadow-[#B59CFF]/5 hover:border-[#B59CFF]/50"
    },
    {
      id: "bee",
      title: "🐝 Blossom Garden",
      path: "/games/bee",
      illustration: "🌻",
      description: "Program flight blocks to guide bees to flowers.",
      stats: `Level ${Math.min(beeLevel, 10)}/10`,
      badge: "Bee Flight",
      xp: "XP +110",
      color: "border-[#FFD76A]/20 shadow-[#FFD76A]/5 hover:border-[#FFD76A]/50"
    },
    {
      id: "classifier",
      title: "🤖 Innovation Tower",
      path: "/games/classifier",
      illustration: "💻",
      description: "Train a friendly AI pet to classify cameras.",
      stats: `Acc: ${classifierBestAccuracy}% | Trained: ${classifierModelsTrained}`,
      badge: "AI Learning Lab",
      xp: "XP +250",
      color: "border-[#69B8FF]/20 shadow-[#69B8FF]/5 hover:border-[#69B8FF]/50"
    },
    {
      id: "kaggle",
      title: "🏆 Champions Coliseum",
      path: "/games/kaggle",
      illustration: "🥇",
      description: "Race AI models in competitive tabular data.",
      stats: `Evaluations: ${kaggleAttempts} Runs`,
      badge: "Kaggle Arena",
      xp: "XP +300",
      color: "border-[#FF9BAA]/20 shadow-[#FF9BAA]/5 hover:border-[#FF9BAA]/50"
    }
  ];

  // Helper values to evaluate skills & badges
  const evaluatedScores = evaluateSkills(allProgress);
  const skillRatings = getSkillRatings(evaluatedScores);
  const badgesList = getBadges(evaluatedScores, allProgress);

  // Friendly competition scoreboard
  const leaderboard = [
    { rank: 1, name: "sarah_ai", score: "94.2%", level: "Lvl 15", medal: "🥇" },
    { rank: 2, name: "alex_code", score: "89.4%", level: "Lvl 13", medal: "🥈" },
    { rank: 3, name: "You (Researcher)", score: classifierBestAccuracy > 0 ? `${classifierBestAccuracy}%` : "84.2%", level: "Lvl 12", medal: "🥉", highlight: true },
    { rank: 4, name: "neural_ninja", score: "82.3%", level: "Lvl 10", medal: "🏅" }
  ];

  // SVG parameters for the Golden Radar Chart
  const R = 80;
  const cx = 110;
  const cy = 110;
  const vertices = [
    { name: "Sharpness", angle: -Math.PI / 2, id: "sharp" },
    { name: "Thinking", angle: -Math.PI / 2 + (2 * Math.PI) / 5, id: "thinker" },
    { name: "Patience", angle: -Math.PI / 2 + (4 * Math.PI) / 5, id: "patient" },
    { name: "Consistency", angle: -Math.PI / 2 + (6 * Math.PI) / 5, id: "consistent" },
    { name: "Perseverance", angle: -Math.PI / 2 + (8 * Math.PI) / 5, id: "perseverance" },
  ];

  // Radar polygon points
  const scorePath = vertices.map((v) => {
    const ratingObj = skillRatings.find((sr) => sr.id === v.id);
    const scoreVal = ratingObj ? ratingObj.score : 50;
    const r = R * (scoreVal / 100);
    const x = cx + r * Math.cos(v.angle);
    const y = cy + r * Math.sin(v.angle);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="max-w-7xl mx-auto w-full py-2 font-sans animate-in fade-in transition-all duration-500 space-y-8 select-none">
      
      {/* 1. HERO ADVENTURE BANNER */}
      <div className="adventure-card p-6 md:p-8 relative overflow-hidden bg-white border border-[#FFD76A]/40 rounded-[28px] shadow-[0_12px_36px_rgba(244,185,66,0.05)]">
        
        {/* Floating sky decorations (illustration) */}
        <div className="absolute top-[10%] right-[10%] opacity-20 pointer-events-none select-none text-8xl">🏰</div>
        <div className="absolute top-[20%] right-[32%] opacity-15 pointer-events-none select-none text-4xl animate-bounce" style={{ animationDuration: "5s" }}>🎈</div>
        <div className="absolute top-[55%] right-[25%] opacity-10 pointer-events-none select-none text-2xl">☁️</div>

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#F4B942] uppercase tracking-widest font-mono bg-[#FFF9F0] border border-[#FFD76A]/30 py-1 px-3.5 rounded-full shadow-sm">
                Mindora Academy Welcome Plaza
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold font-display text-slate-800 tracking-tight leading-tight">
              Ready for another adventure today, Researcher?
            </h1>
            
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9F0] border border-[#FFD76A]/20 rounded-xl shadow-xs">
                <Flame className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24]/10" />
                Streak: <strong className="text-slate-700">28 Days</strong>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9F0] border border-[#FFD76A]/20 rounded-xl shadow-xs">
                <Calendar className="w-4 h-4 text-[#69B8FF]" />
                Research Level: <strong className="text-slate-700">12</strong>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9F0] border border-[#FFD76A]/20 rounded-xl shadow-xs">
                <CheckSquare className="w-4 h-4 text-[#8BE39B]" />
                Daily Goal: <strong className="text-[#8BE39B]">Complete 2 Missions</strong>
              </span>
            </div>
          </div>

          <div className="bg-[#FFF9F0] border border-[#FFD76A]/30 p-5 rounded-[20px] flex flex-col justify-center min-w-[240px] shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>ACADEMY XP PROGRESS</span>
              <span className="text-[#a16207] font-black font-mono">8,420 XP</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white h-3.5 rounded-full overflow-hidden border border-[#FFD76A]/20 mt-2.5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#FFD76A] to-[#F4B942] rounded-full shadow-[0_2px_6px_rgba(244,185,66,0.3)]" 
                style={{ width: "72%" }} 
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wider text-right">
              2,580 XP TO LEVEL 13
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: MISSION CARD GRID */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xl font-black font-display text-slate-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F4B942] fill-[#F4B942]/10" /> Explore Mindora World
            </h2>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {games.length} Destined Kingdoms
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className={`adventure-card border ${game.color} p-6 flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Visual illustration box */}
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF9F0] border border-[#FFD76A]/20 flex items-center justify-center text-4xl shadow-sm">
                    {game.illustration}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#FFF9F0] border border-[#FFD76A]/20 text-[#a16207] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    {game.badge}
                  </span>
                </div>

                <div className="my-5">
                  <h3 className="text-lg font-black font-display text-slate-800">{game.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{game.description}</p>
                </div>

                {/* Card footer CTA */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 font-mono text-[10px]">
                    <div className="font-bold text-slate-400 uppercase tracking-wider">{game.stats}</div>
                    <div className="text-[#FBBF24] font-black">{game.xp}</div>
                  </div>
                  <button
                    onClick={() => setSelectedGame({ id: game.id, title: game.badge, path: game.path })}
                    className="btn-adventure-primary text-xs py-2 px-5 rounded-xl flex items-center gap-1 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#3f2203] text-[#3f2203]" /> Launch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: RADAR & MASCOT */}
        <div className="space-y-6">
          
          {/* A. GOLDEN RADAR CHART */}
          <div className="adventure-card bg-white border border-[#FFD76A]/40 p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-[#69B8FF]" /> My Super Skills
            </h3>
            
            <div className="flex items-center justify-center py-2 relative">
              <svg width="220" height="220" viewBox="0 0 220 220" className="relative z-10">
                {/* Concentric rings */}
                {[1.0, 0.75, 0.5, 0.25].map((scale) => {
                  const points = vertices.map((v) => {
                    const x = cx + R * scale * Math.cos(v.angle);
                    const y = cy + R * scale * Math.sin(v.angle);
                    return `${x},${y}`;
                  }).join(" ");
                  return (
                    <polygon
                      key={scale}
                      points={points}
                      fill="none"
                      stroke="rgba(244, 185, 66, 0.08)"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Vertex lines */}
                {vertices.map((v, idx) => {
                  const x = cx + R * Math.cos(v.angle);
                  const y = cy + R * Math.sin(v.angle);
                  return (
                    <line
                      key={idx}
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke="rgba(244, 185, 66, 0.08)"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Custom golden Radar Polygon */}
                <polygon
                  points={scorePath}
                  fill="url(#radar-gold-grad)"
                  stroke="#F4B942"
                  strokeWidth="2.5"
                />

                {/* Vertex anchor points */}
                {vertices.map((v, idx) => {
                  const ratingObj = skillRatings.find((sr) => sr.id === v.id);
                  const scoreVal = ratingObj ? ratingObj.score : 50;
                  const r = R * (scoreVal / 100);
                  const x = cx + r * Math.cos(v.angle);
                  const y = cy + r * Math.sin(v.angle);
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#FFD76A"
                      stroke="#F4B942"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Definitions for Gradients */}
                <defs>
                  <linearGradient id="radar-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 215, 0, 0.35)" />
                    <stop offset="100%" stopColor="rgba(244, 185, 66, 0.15)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Pentagon Labels placed dynamically */}
              <div className="absolute top-[8px] text-[9.5px] font-black font-display text-slate-500 uppercase">SHARPNESS</div>
              <div className="absolute top-[76px] right-[4px] text-[9.5px] font-black font-display text-slate-500 uppercase">THINKING</div>
              <div className="absolute bottom-[24px] right-[26px] text-[9.5px] font-black font-display text-slate-500 uppercase">PATIENCE</div>
              <div className="absolute bottom-[24px] left-[20px] text-[9.5px] font-black font-display text-slate-500 uppercase">CONSISTENCY</div>
              <div className="absolute top-[76px] left-[0px] text-[9.5px] font-black font-display text-slate-500 uppercase">GRIT</div>
            </div>

            {/* Micro stats details */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono border-t border-slate-100 pt-3">
              <div className="bg-[#FFF9F0] p-2 rounded-xl border border-[#FFD76A]/20">
                <span className="text-[9px] text-slate-400 block font-bold">MODELS TRAINED</span>
                <strong className="text-slate-700 text-sm">{classifierModelsTrained}</strong>
              </div>
              <div className="bg-[#FFF9F0] p-2 rounded-xl border border-[#FFD76A]/20">
                <span className="text-[9px] text-slate-400 block font-bold">KAGGLER RUNS</span>
                <strong className="text-slate-700 text-sm">{kaggleAttempts}</strong>
              </div>
            </div>
          </div>

          {/* B. MINDORA BUDDY MASCOT */}
          <div className="adventure-card bg-white border border-[#FFD76A]/40 p-5 space-y-4 relative overflow-hidden shadow-sm">
            <h3 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-[#F4B942]" /> Meet Mindora Buddy
            </h3>

            <div className="flex items-center gap-4 bg-[#FFF9F0] p-4 rounded-2xl border border-[#FFD76A]/20 relative">
              {/* Waving mascot SVG */}
              <div className="relative w-16 h-16 shrink-0 floating-buddy">
                <svg viewBox="0 0 60 60" className="w-full h-full">
                  {/* Robot body */}
                  <rect x="15" y="22" width="30" height="26" rx="8" fill="#69B8FF" stroke="#334155" strokeWidth="2" />
                  <rect x="20" y="27" width="20" height="15" rx="4" fill="#FFFCF8" />
                  
                  {/* Screen details */}
                  <circle cx="26" cy="33" r="1.5" fill="#334155" />
                  <circle cx="34" cy="33" r="1.5" fill="#334155" />
                  <path d="M 27 38 Q 30 40 33 38" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Robot head */}
                  <rect x="20" y="10" width="20" height="10" rx="4" fill="#FFD76A" stroke="#334155" strokeWidth="2" />
                  <circle cx="26" cy="15" r="2" fill="#334155" />
                  <circle cx="34" cy="15" r="2" fill="#334155" />

                  {/* Antenna */}
                  <line x1="30" y1="10" x2="30" y2="4" stroke="#334155" strokeWidth="2" />
                  <circle cx="30" cy="3" r="2.5" fill="#FF9BAA" stroke="#334155" strokeWidth="1.5" />

                  {/* Robot Waving Arm */}
                  <g className="waving-arm" style={{ transformOrigin: "15px 26px" }}>
                    <path d="M 15 26 Q 8 20 10 14" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  <path d="M 45 26 Q 52 28 50 34" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Little wheels */}
                  <circle cx="23" cy="50" r="3.5" fill="#334155" />
                  <circle cx="37" cy="50" r="3.5" fill="#334155" />
                </svg>
              </div>
              
              <div>
                <p className="text-xs font-black text-slate-800">Mindora Buddy</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Learning Companion</p>
              </div>
            </div>

            {/* Mascot message */}
            <div className="bg-[#FFF9F0] border border-[#FFD76A]/20 p-3.5 rounded-xl text-slate-600 font-semibold text-xs leading-relaxed">
              <span className="text-[#a16207] font-black">Buddy:</span>
              <span className="ml-1">
                {classifierBestAccuracy > 0 
                  ? "Awesome! Your AI became smarter today! Let's check out the Coliseum next."
                  : "Welcome to the Plaza! Pick any path on the world map and let's go on an adventure!"
                }
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. FOOTER ROW: BADGE VAULT & LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: BADGE VAULT */}
        <div className="lg:col-span-2 adventure-card bg-white border border-[#FFD76A]/40 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#FF9BAA]" /> Academy Badge Vault
            </h3>
            <Link to="/profile" className="text-[10px] font-black text-[#69B8FF] hover:underline uppercase tracking-wider">
              My Profile
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {badgesList.slice(0, 5).map((badge) => (
              <div 
                key={badge.id}
                className={`relative flex flex-col items-center justify-center p-3.5 rounded-[20px] border transition-all ${
                  badge.unlocked 
                    ? "bg-[#FFF9F0]/60 border-[#FFD76A]/40 shadow-[0_4px_12px_rgba(244,185,66,0.06)]"
                    : "bg-slate-50 border-slate-100 opacity-30"
                }`}
                title={badge.description}
              >
                <span className={`text-4xl ${badge.unlocked ? "filter drop-shadow-sm" : "grayscale"}`}>{badge.icon}</span>
                <span className="text-[9px] font-black text-slate-600 mt-2.5 text-center truncate w-full">{badge.name}</span>
                
                {badge.unlocked && (
                  <span className="absolute top-1 text-[7px] font-black text-[#F4B942] tracking-widest uppercase">
                    {badge.id.includes("dl_") || badge.id.includes("kaggle_") ? "EPIC" : "COMMON"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: SCOREBOARD */}
        <div className="adventure-card bg-white border border-[#FFD76A]/40 p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-black font-display text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Trophy className="w-4 h-4 text-[#F4B942]" /> Top Researchers
          </h3>

          <div className="space-y-2">
            {leaderboard.map((user) => (
              <div 
                key={user.rank}
                className={`flex items-center justify-between p-2.5 rounded-xl border ${
                  user.highlight 
                    ? "bg-[#FFD76A]/10 border-[#FFD76A]/30 text-slate-800" 
                    : "bg-white border-slate-100 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{user.medal}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black">{user.name}</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">{user.level}</span>
                  </div>
                </div>
                <div className="text-right font-mono text-xs font-bold text-[#F4B942]">
                  {user.score}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* PORTAL SIMULATOR POPUP */}
      <PortalLoader
        isOpen={selectedGame !== null}
        gameTitle={selectedGame?.title || ""}
        onComplete={() => {
          if (selectedGame) {
            navigate(selectedGame.path);
          }
          setSelectedGame(null);
        }}
      />

    </div>
  );
}
