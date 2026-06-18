import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Trophy, Play, Star, BrainCircuit, ArrowRight } from "lucide-react";
import { gamesAPI } from "../services/api";
import { evaluateSkills, getSkillRatings } from "../lib/skillsEngine";

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
  const [allProgress, setAllProgress] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const loadStats = async () => {
      // 1. Weather Adventure (localStorage backup)
      try {
        const weatherData = localStorage.getItem("weather-adventure-progress");
        if (weatherData) {
          const parsed = JSON.parse(weatherData);
          if (parsed.level) setWeatherLevel(parsed.level);
          if (parsed.coins) setWeatherCoins(parsed.coins);
        }
      } catch {}

      // Load all game progress from database
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
      } catch (err) {
        console.error("Failed to load overall stats:", err);
      }
    };
    loadStats();
  }, []);

  const games = [
    {
      id: "weather",
      title: "Weather Adventure",
      path: "/games/weather",
      emoji: "🌦️",
      description: "Explore micro-climates, rescue stranded wild animals, nurture a greenhouse, and open the legendary weather portal!",
      badge: "Sci-Adventure",
      color: "from-blue-500 to-cyan-400 border-blue-500/20 shadow-blue-500/10",
      stats: `Level ${weatherLevel} Explorer | 🪙 ${weatherCoins} Coins`
    },
    {
      id: "train",
      title: "Choo Choo Train Builder",
      path: "/games/train",
      emoji: "🚂",
      description: "Drag and drop colorful train cars onto the tracks in the correct blueprint sequence. Check with a loud horn blast!",
      badge: "Logic Puzzle",
      color: "from-red-500 to-orange-400 border-red-500/20 shadow-red-500/10",
      stats: `⭐ ${trainStars} Gold Stars Collected`
    },
    {
      id: "turtle",
      title: "Turtle Path 3D",
      path: "/games/turtle",
      emoji: "🐢",
      description: "Queue movement arrows in the planning sequencer to guide the turtle home safely while avoiding floating rock traps!",
      badge: "Algorithmic Code",
      color: "from-emerald-500 to-green-400 border-emerald-500/20 shadow-emerald-500/10",
      stats: `Level ${Math.min(turtleLevel, 5)} / 5 | Meadow to Galaxy`
    },
    {
      id: "puppy",
      title: "Feed the Puppy",
      path: "/games/puppy",
      emoji: "🐶",
      description: "Match the hungry puppy's dream food from a colorful pile while avoiding chocolate, grapes, and other harmful foods!",
      badge: "Decision Match",
      color: "from-[#FF9F43] to-[#FFB300] border-orange-500/20 shadow-orange-500/10",
      stats: `Level ${Math.min(puppyLevel, 10)} / 10 | Puppy Care Expert`
    },
    {
      id: "color",
      title: "Colour Magic Machine",
      path: "/games/color",
      emoji: "🎨",
      description: "Pick and mix base palette colors inside the magic swirl mixer to match target secondary, tertiary, and quaternary shades!",
      badge: "Color Physics",
      color: "from-purple-500 to-pink-400 border-purple-500/20 shadow-purple-500/10",
      stats: `Level ${Math.min(colorLevel, 10)} / 10 | Master Alchemist`
    },
    {
      id: "bee",
      title: "Bee Flower Path",
      path: "/games/bee",
      emoji: "🐝",
      description: "Draw a flight path or program command blocks to guide the cute bee to the flowers while navigating obstacles, gates, wind, and rain!",
      badge: "Pathfinding & Logic",
      color: "from-yellow-400 to-amber-500 border-yellow-500/20 shadow-yellow-500/10",
      stats: `Level ${Math.min(beeLevel, 10)} / 10 | Buzzing Programmer`
    }
  ];

  return (
    <div className="max-w-6xl mx-auto w-full py-4 font-sans animate-in fade-in transition-all duration-500 space-y-10">
      
      {/* Immersive Header Banner */}
      <div className="bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-[10%] w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 uppercase tracking-widest">
              Interactive Arcade Hub
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight flex items-center justify-center md:justify-start gap-3">
              <Trophy className="w-10 h-10 text-yellow-400 fill-yellow-400/20 animate-pulse" />
              Mindora Playground
            </h1>
            <p className="text-slate-300 font-medium text-lg max-w-2xl">
              Play scientific climate simulations, sequential builders, and algorithm planners to master physics, logic, and coding skills!
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs text-center md:text-left shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Play Stats</h3>
            <div className="mt-2 text-2xl font-black text-amber-400 flex items-center gap-2">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
              <span>{trainStars} Stars Earned</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Keep completing levels to collect more!</p>
          </div>
        </div>
      </div>

      {/* 🧠 Cognitive Capabilities Widget */}
      {Object.keys(allProgress).length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/85 shadow-md p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-indigo-600 animate-pulse" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Capabilities Dashboard</h2>
                <p className="text-xs font-semibold text-slate-500">Real-time evaluation of your gameplay problem-solving skills.</p>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider self-start md:self-center"
            >
              View Badges & Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {getSkillRatings(evaluateSkills(allProgress)).map((skill) => (
              <div key={skill.id} className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700">{skill.name}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {skill.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      skill.id === "sharp" ? "from-red-400 to-rose-500" :
                      skill.id === "thinker" ? "from-indigo-400 to-indigo-600" :
                      skill.id === "patient" ? "from-emerald-400 to-green-500" :
                      skill.id === "consistent" ? "from-amber-400 to-yellow-500" :
                      "from-purple-400 to-fuchsia-600"
                    }`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Interactive Games */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-500 fill-indigo-500/10" /> Select Your Mission
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => navigate(game.path)}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 flex flex-col justify-between overflow-hidden"
            >
              {/* Card Banner with dynamic gradients */}
              <div className={`h-40 bg-gradient-to-br ${game.color} relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 bg-white/10 opacity-30 mix-blend-overlay" />
                <span className="text-7xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                  {game.emoji}
                </span>
                <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white border border-white/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {game.badge}
                </span>
              </div>

              {/* Card body content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-3 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                  <div className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-widest bg-indigo-50 border border-indigo-100/50 py-1 px-3 rounded-lg inline-self-start">
                    🏆 {game.stats}
                  </div>
                  <button className="w-full bg-slate-900 group-hover:bg-indigo-600 text-white font-extrabold py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition-colors shadow">
                    <Play className="w-4 h-4 fill-white" /> Launch Game
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
