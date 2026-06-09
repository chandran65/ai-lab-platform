import React, { useState, useEffect, useRef } from "react";
import { Star, Play, Sparkles, ArrowLeft, RotateCcw, AlertCircle, HelpCircle } from "lucide-react";
import { gamesAPI } from "../../services/api";

// Web Audio API Retro Sound Effects Engine
const playSound = (type: "click" | "success" | "failure" | "whistle" | "snap") => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.1);
    } else if (type === "snap") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.setValueAtTime(750, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.14);
    } else if (type === "whistle") {
      // Train Choo-Choo Whistle (dual tones with slight frequency ramp)
      [880, 920].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq + 15, now + 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.35);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.45);
      });
      // Double blast
      setTimeout(() => {
        const ctx2 = new AudioContextClass();
        const now2 = ctx2.currentTime;
        [880, 920].forEach((freq) => {
          const osc = ctx2.createOscillator();
          const gain = ctx2.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now2);
          osc.frequency.linearRampToValueAtTime(freq + 15, now2 + 0.4);
          gain.gain.setValueAtTime(0, now2);
          gain.gain.linearRampToValueAtTime(0.08, now2 + 0.04);
          gain.gain.linearRampToValueAtTime(0.08, now2 + 0.35);
          gain.gain.linearRampToValueAtTime(0, now2 + 0.4);
          osc.connect(gain);
          gain.connect(ctx2.destination);
          osc.start();
          osc.stop(now2 + 0.45);
        });
      }, 500);
    } else if (type === "success") {
      // Happy major chord arpeggio sweep
      const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } else if (type === "failure") {
      // Sad slide down
      [150, 153].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.45);
      });
    }
  } catch (e) {
    console.warn("Sound play failed:", e);
  }
};

interface CarInfo {
  emoji: string;
  name: string;
  color: string;
  order: number;
}

const CAR_DICTIONARY: Record<string, CarInfo> = {
  engine: { emoji: "🚂", name: "ENGINE", color: "bg-red-500 hover:bg-red-600", order: 0 },
  car1: { emoji: "🍎", name: "APPLE", color: "bg-pink-500 hover:bg-pink-600", order: 1 },
  car2: { emoji: "☀️", name: "SUN", color: "bg-amber-400 hover:bg-amber-500", order: 2 },
  car3: { emoji: "🐸", name: "FROG", color: "bg-green-500 hover:bg-green-600", order: 3 },
  car4: { emoji: "💧", name: "WATER", color: "bg-sky-500 hover:bg-sky-600", order: 4 },
  car5: { emoji: "🦄", name: "PONY", color: "bg-purple-500 hover:bg-purple-600", order: 5 },
  car6: { emoji: "🦋", name: "BUG", color: "bg-teal-500 hover:bg-teal-600", order: 6 },
  car7: { emoji: "🌙", name: "MOON", color: "bg-emerald-500 hover:bg-emerald-600", order: 7 },
  caboose: { emoji: "🐶", name: "PUPPY", color: "bg-orange-500 hover:bg-orange-600", order: -1 }
};

interface LevelConfig {
  cars: string[];
  shuffle: boolean;
  hints: boolean;
}

const LEVELS: Record<number, LevelConfig> = {
  1: { cars: ["engine", "car1", "car2", "car3", "caboose"], shuffle: false, hints: true },
  2: { cars: ["engine", "car1", "car2", "car3", "caboose"], shuffle: true, hints: true },
  3: { cars: ["engine", "car1", "car2", "car3", "caboose"], shuffle: true, hints: true },
  4: { cars: ["engine", "car1", "car2", "car3", "caboose"], shuffle: true, hints: true },
  5: { cars: ["engine", "car1", "car2", "car3", "caboose"], shuffle: true, hints: false },
  6: { cars: ["engine", "car1", "car2", "car3", "car4", "car5", "caboose"], shuffle: true, hints: true },
  7: { cars: ["engine", "car1", "car2", "car3", "car4", "car5", "caboose"], shuffle: true, hints: false },
  8: { cars: ["engine", "car1", "car2", "car3", "car4", "car5", "car6", "car7", "caboose"], shuffle: true, hints: false }
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
}

export default function TrainBuilder() {
  const [stars, setStars] = useState<number>(() => {
    return Number(localStorage.getItem("train_stars") || "0");
  });
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    return Number(localStorage.getItem("train_max_level") || "1");
  });
  const [screen, setScreen] = useState<"menu" | "levels" | "help" | "game">("menu");

  // Load progress from backend on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await gamesAPI.getProgress("train_builder");
        const progress = res.data.progress_data;
        if (progress) {
          if (typeof progress.stars === "number") {
            setStars(progress.stars);
            localStorage.setItem("train_stars", String(progress.stars));
          }
          if (typeof progress.maxUnlockedLevel === "number") {
            setMaxUnlockedLevel(progress.maxUnlockedLevel);
            localStorage.setItem("train_max_level", String(progress.maxUnlockedLevel));
          }
        }
      } catch (err) {
        console.error("Failed to load train builder progress:", err);
      }
    };
    loadProgress();
  }, []);
  
  // Game States
  const [placedCars, setPlacedCars] = useState<(string | null)[]>([]);
  const [dockCars, setDockCars] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("👆 Drag the cars onto the track!");
  const [feedbackType, setFeedbackType] = useState<"info" | "success" | "error" | "warning">("info");
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [earnedStars, setEarnedStars] = useState<number>(3);
  const [flashingSlot, setFlashingSlot] = useState<number | null>(null);
  
  // Confetti particles state
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // Initialize level
  const startLevel = (lvl: number) => {
    playSound("click");
    setCurrentLevel(lvl);
    setAttempts(0);
    setShowVictory(false);
    setFeedback("👆 Drag the cars onto the track!");
    setFeedbackType("info");
    
    const config = LEVELS[lvl];
    const slotsCount = config.cars.length;
    setPlacedCars(Array(slotsCount).fill(null));
    
    // Setup Caboose order index dynamically based on level slots
    CAR_DICTIONARY["caboose"].order = slotsCount - 1;
    
    let spawnList = [...config.cars];
    if (config.shuffle) {
      spawnList.sort(() => Math.random() - 0.5);
    }
    setDockCars(spawnList);
    setScreen("game");
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, carType: string, source: "dock" | number) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ carType, source }));
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData("text/plain");
      if (!dataStr) return;
      const { carType, source } = JSON.parse(dataStr);
      
      const updatedPlaced = [...placedCars];
      const targetCurrent = updatedPlaced[targetIndex];
      
      // If the target slot already holds a car, return that car to the dock or swap
      if (source === "dock") {
        // Remove from dock
        setDockCars(prev => {
          const idx = prev.indexOf(carType);
          const next = [...prev];
          if (idx > -1) next.splice(idx, 1);
          if (targetCurrent) next.push(targetCurrent); // return target car to dock
          return next;
        });
        updatedPlaced[targetIndex] = carType;
      } else {
        // Swap slots
        const sourceIndex = source as number;
        updatedPlaced[sourceIndex] = targetCurrent;
        updatedPlaced[targetIndex] = carType;
      }
      
      playSound("snap");
      setPlacedCars(updatedPlaced);
      setFeedback("🌟 Great job! Check the Blueprint Order for the next one!",);
      setFeedbackType("info");
    } catch (err) {
      console.error(err);
    }
  };

  const returnToDock = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData("text/plain");
      if (!dataStr) return;
      const { carType, source } = JSON.parse(dataStr);
      
      if (source !== "dock") {
        const sourceIndex = source as number;
        const updatedPlaced = [...placedCars];
        updatedPlaced[sourceIndex] = null;
        setPlacedCars(updatedPlaced);
        setDockCars(prev => [...prev, carType]);
        playSound("click");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheck = () => {
    setAttempts(prev => prev + 1);
    
    // Check if empty slots exist
    const hasEmpty = placedCars.some(c => c === null);
    if (hasEmpty) {
      playSound("failure");
      setFeedback("⚠️ Put all cars on the tracks first, silly!",);
      setFeedbackType("warning");
      return;
    }
    
    let isCorrect = true;
    let errorIdx: number | null = null;
    let errMsg = "";
    
    // Validate order
    for (let i = 0; i < placedCars.length; i++) {
      const car = placedCars[i];
      if (car) {
        const targetOrder = CAR_DICTIONARY[car].order;
        if (targetOrder !== i) {
          isCorrect = false;
          errorIdx = i;
          if (i === 0) {
            errMsg = "❌ The ENGINE always goes FIRST!";
          } else if (car === "caboose") {
            errMsg = "❌ The CABOOSE always goes LAST!";
          } else {
            errMsg = "❌ Oops! Look at the Blueprint Order to see the correct sequence.";
          }
          break;
        }
      }
    }

    if (isCorrect) {
      const earned = attempts === 0 ? 3 : 2;
      setEarnedStars(earned);
      const newStars = stars + earned;
      setStars(newStars);
      localStorage.setItem("train_stars", String(newStars));
      
      playSound("whistle");
      playSound("success");
      setFeedback("🎉 YAY! YOU DID IT! 🎉");
      setFeedbackType("success");
      
      let nextLvl = maxUnlockedLevel;
      // Unlock next level
      if (currentLevel === maxUnlockedLevel && currentLevel < 8) {
        nextLvl = currentLevel + 1;
        setMaxUnlockedLevel(nextLvl);
        localStorage.setItem("train_max_level", String(nextLvl));
      }

      // Save progress to backend
      gamesAPI.saveProgress("train_builder", {
        stars: newStars,
        maxUnlockedLevel: nextLvl
      }).catch(err => console.error("Failed to save train builder progress:", err));
      
      triggerConfetti();
      setTimeout(() => {
        setShowVictory(true);
      }, 1500);
    } else {
      playSound("failure");
      setFeedback(errMsg);
      setFeedbackType("error");
      if (errorIdx !== null) {
        setFlashingSlot(errorIdx);
        setTimeout(() => setFlashingSlot(null), 1000);
      }
    }
  };

  const handleReset = () => {
    playSound("click");
    startLevel(currentLevel);
  };

  // Fanfare confetti generator
  const triggerConfetti = () => {
    const colors = ["#FF4500", "#33CC33", "#3399FF", "#CC66FF", "#FFCC00", "#FF3366"];
    const initialParticles: Particle[] = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      size: Math.random() * 12 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 6 + 4
    }));
    setParticles(initialParticles);
  };

  useEffect(() => {
    if (particles.length === 0) return;
    
    const updateConfetti = () => {
      setParticles(prev => {
        let active = false;
        const next = prev.map(p => {
          const ny = p.y + p.vy;
          const nx = p.x + p.vx;
          if (ny < window.innerHeight) active = true;
          return { ...p, x: nx, y: ny };
        });
        if (!active) return [];
        return next;
      });
      animationFrameId.current = requestAnimationFrame(updateConfetti);
    };
    
    animationFrameId.current = requestAnimationFrame(updateConfetti);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [particles]);

  const sortedBluePrint = [...LEVELS[currentLevel]?.cars || []].sort(
    (a, b) => CAR_DICTIONARY[a].order - CAR_DICTIONARY[b].order
  );

  return (
    <div className="flex-1 min-h-[calc(100vh-6rem)] bg-gradient-to-b from-[#87CEEB] to-[#c2e5f2] rounded-3xl p-6 relative overflow-hidden font-sans border-b-[6px] border-sky-600 shadow-xl">
      {/* Decorative Clouds & Sun */}
      <div className="absolute top-8 right-12 w-28 h-28 bg-yellow-300 rounded-full blur-sm opacity-90 animate-pulse border border-yellow-200" />
      <div className="absolute top-16 left-[20%] w-24 h-12 bg-white rounded-full opacity-60 blur-xs" />
      <div className="absolute top-24 right-[35%] w-32 h-14 bg-white rounded-full opacity-70 blur-xs" />
      
      {/* Confetti Canvas Substitute */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none z-50 transition-all duration-75"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        />
      ))}

      {/* Screen: Main Menu */}
      {screen === "menu" && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center relative z-10 py-12">
          <div className="text-7xl mb-4 animate-bounce">🚂</div>
          <h1 className="text-5xl md:text-6xl font-black text-red-500 drop-shadow-md tracking-wide font-heading">
            Choo Choo Train Builder!
          </h1>
          <p className="text-slate-700 text-lg md:text-xl font-bold mt-4 max-w-lg leading-relaxed">
            All aboard! Let's build a beautiful, colorful train together!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button
              onClick={() => { playSound("click"); setScreen("levels"); }}
              className="bg-green-500 hover:bg-green-600 text-white font-extrabold text-2xl px-12 py-5 rounded-3xl border-b-8 border-green-700 hover:border-green-800 transform active:scale-95 active:border-b-2 transition-all flex items-center gap-3 shadow-lg"
            >
              <Play className="fill-white w-6 h-6" /> PLAY TIME!
            </button>
            <button
              onClick={() => { playSound("click"); setScreen("help"); }}
              className="bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xl px-10 py-5 rounded-3xl border-b-8 border-sky-700 hover:border-sky-800 transform active:scale-95 active:border-b-2 transition-all flex items-center gap-2 shadow-lg"
            >
              <HelpCircle className="w-5 h-5" /> How to Play
            </button>
          </div>

          <div className="mt-12 bg-white/60 backdrop-blur-xs py-3 px-6 rounded-full border border-white/80 inline-flex items-center gap-2 text-xl font-extrabold text-amber-500 shadow-sm">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500 animate-spin-slow" />
            <span>Your Gold Stars: {stars}</span>
          </div>
        </div>
      )}

      {/* Screen: Level Selector Map */}
      {screen === "levels" && (
        <div className="relative z-10 max-w-5xl mx-auto py-8">
          <button
            onClick={() => { playSound("click"); setScreen("menu"); }}
            className="mb-8 inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-extrabold px-6 py-3 rounded-2xl border-b-4 border-slate-300 hover:border-slate-400 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" /> Back Menu
          </button>
          
          <h2 className="text-center text-4xl md:text-5xl font-black text-red-500 mb-10 tracking-wide font-heading">
            🗺️ Pick a Fun Level!
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {Object.keys(LEVELS).map(lvlKey => {
              const lvl = Number(lvlKey);
              const unlocked = lvl <= maxUnlockedLevel;
              const completed = lvl < maxUnlockedLevel;

              return (
                <div
                  key={lvl}
                  className={`rounded-3xl p-6 border-4 flex flex-col items-center justify-between text-center transition-all ${
                    unlocked
                      ? "bg-white border-green-400 shadow-md hover:-translate-y-1 hover:shadow-lg"
                      : "bg-slate-300/80 border-slate-400 opacity-60"
                  }`}
                >
                  <div>
                    <span className="text-4xl">
                      {unlocked ? (completed ? "✅" : "🎯") : "🔒"}
                    </span>
                    <h3 className="font-extrabold text-2xl text-slate-800 mt-3">
                      Level {lvl}
                    </h3>
                    <div className="text-yellow-400 text-lg font-bold mt-2">
                      {"⭐".repeat(Math.min(lvl, 5))}
                    </div>
                  </div>

                  {unlocked ? (
                    <button
                      onClick={() => startLevel(lvl)}
                      className={`w-full mt-6 py-3 rounded-2xl text-white font-extrabold text-lg border-b-4 ${
                        completed
                          ? "bg-sky-500 border-sky-700 hover:bg-sky-600"
                          : "bg-green-500 border-green-700 hover:bg-green-600"
                      }`}
                    >
                      {completed ? "🔄 Play Again" : "▶️ GO!"}
                    </button>
                  ) : (
                    <div className="w-full mt-6 py-3 bg-slate-400 text-slate-200 font-extrabold text-lg rounded-2xl">
                      Locked
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Screen: How to Play */}
      {screen === "help" && (
        <div className="relative z-10 max-w-3xl mx-auto py-8">
          <button
            onClick={() => { playSound("click"); setScreen("menu"); }}
            className="mb-8 inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-extrabold px-6 py-3 rounded-2xl border-b-4 border-slate-300 hover:border-slate-400 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" /> Back Menu
          </button>

          <div className="bg-white rounded-3xl p-8 border-4 border-sky-400 shadow-lg text-slate-800">
            <h2 className="text-3xl font-black text-red-500 mb-6 flex items-center gap-2 font-heading">
              📖 How to Play
            </h2>
            <ol className="list-decimal list-inside text-lg md:text-xl font-bold space-y-4 leading-relaxed pl-2 text-slate-700">
              <li>Drag a colorful train car card from the dock at the bottom.</li>
              <li>Look at the Blueprint Order box to see the target pattern.</li>
              <li>Place the <span className="text-red-500">ENGINE</span> in the first slot (START).</li>
              <li>Order the remaining colorful items according to the guides.</li>
              <li>Place the <span className="text-orange-500">CABOOSE</span> in the very last slot.</li>
              <li>Click the big <span className="text-red-500 font-black">CHOO CHOO!</span> button to check your path!</li>
            </ol>

            <button
              onClick={() => { playSound("click"); setScreen("levels"); }}
              className="w-full mt-10 bg-green-500 hover:bg-green-600 text-white font-extrabold text-2xl py-4 rounded-2xl border-b-6 border-green-700 transition-all active:scale-95 shadow-md"
            >
              🚀 Let's Go!
            </button>
          </div>
        </div>
      )}

      {/* Screen: Gameboard */}
      {screen === "game" && (
        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
          {/* Level Header HUD */}
          <div className="flex justify-between items-center bg-[#3399FF] text-white py-3 px-6 rounded-2xl border-b-4 border-blue-700 shadow-md">
            <span className="font-extrabold text-xl md:text-2xl flex items-center gap-2">
              🎈 Level {currentLevel}
            </span>
            <div className="flex items-center gap-2 bg-amber-400 border border-amber-500 py-1.5 px-4 rounded-full text-amber-950 font-extrabold shadow-sm">
              <Star className="w-5 h-5 fill-amber-500" />
              <span>{stars} Stars</span>
            </div>
          </div>

          {/* Blueprint & Guide Box */}
          <div className="bg-[#FFFDEE] border-4 border-orange-400 rounded-3xl p-4 md:p-6 shadow-md max-w-lg mx-auto w-full text-center">
            <h3 className="font-black text-amber-800 text-lg mb-4 flex items-center justify-center gap-2">
              🗺️ Blueprint Order Guidance
            </h3>
            {LEVELS[currentLevel].hints ? (
              <div className="flex justify-center items-center gap-2 overflow-x-auto py-2">
                {sortedBluePrint.map((car, idx) => (
                  <React.Fragment key={car}>
                    <div
                      style={{ backgroundColor: CAR_DICTIONARY[car].color.includes("bg-") ? "" : CAR_DICTIONARY[car].color }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border-2 border-white text-white font-black shrink-0 ${CAR_DICTIONARY[car].color}`}
                      title={CAR_DICTIONARY[car].name}
                    >
                      {CAR_DICTIONARY[car].emoji}
                    </div>
                    {idx < sortedBluePrint.length - 1 && (
                      <span className="text-xl text-orange-500 font-extrabold shrink-0">➔</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="py-2 text-slate-500 font-extrabold italic text-sm">
                💡 Hints are locked! Use your memory and blueprints logic!
              </div>
            )}
          </div>

          {/* Tracks Area */}
          <div className="flex flex-col items-center justify-center py-6 w-full relative">
            {/* Wooden Train Track Backdrop */}
            <div className="w-full max-w-5xl h-8 bg-slate-500 rounded-lg opacity-40 absolute top-[55%] -translate-y-1/2 flex items-center justify-around z-0 border-b-2 border-slate-600">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-2 h-12 bg-amber-900 border-l border-amber-950 opacity-90 rounded-sm" />
              ))}
            </div>
            {/* Tracks rails */}
            <div className="w-full max-w-5xl h-2 bg-slate-300 absolute top-[48%] -translate-y-1/2 z-0 border-b border-slate-400" />
            <div className="w-full max-w-5xl h-2 bg-slate-300 absolute top-[58%] -translate-y-1/2 z-0 border-b border-slate-400" />

            {/* Placed Slots Grid */}
            <div className="flex justify-center items-center gap-6 relative z-10 w-full overflow-x-auto py-4">
              {placedCars.map((car, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === placedCars.length - 1;
                const label = isFirst ? "START" : isLast ? "END" : `${idx + 1}`;
                
                return (
                  <div
                    key={idx}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`w-28 h-32 rounded-2xl border-4 border-dashed bg-white/20 flex flex-col items-center justify-center relative transition-all shrink-0 ${
                      flashingSlot === idx
                        ? "border-red-500 bg-red-100/50 scale-105"
                        : "border-white hover:border-green-300 hover:bg-white/40"
                    }`}
                  >
                    <div className="absolute top-1 bg-white/80 px-2 py-0.5 rounded-md text-[10px] font-black text-slate-800 shadow-xs border border-white">
                      {label}
                    </div>

                    {car ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, car, idx)}
                        className={`w-24 h-24 rounded-xl flex flex-col items-center justify-center shadow-lg border-2 border-white cursor-grab active:cursor-grabbing transform hover:scale-105 transition-all text-white font-extrabold ${CAR_DICTIONARY[car].color}`}
                      >
                        <span className="text-4xl leading-none">{CAR_DICTIONARY[car].emoji}</span>
                        <span className="text-[10px] uppercase mt-2 tracking-wider">{CAR_DICTIONARY[car].name}</span>
                      </div>
                    ) : (
                      <span className="text-white/40 font-extrabold text-sm uppercase mt-4">Drop Here</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spawn Dock (Bottom Station) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={returnToDock}
            className="bg-white/50 backdrop-blur-xs border-4 border-dashed border-white rounded-3xl p-6 max-w-4xl mx-auto w-full min-h-[7rem] flex flex-wrap justify-center items-center gap-4 shadow-inner"
          >
            {dockCars.length === 0 ? (
              <span className="text-slate-600 font-extrabold italic text-sm py-4">All cars are on the track!</span>
            ) : (
              dockCars.map((car) => (
                <div
                  key={car}
                  draggable
                  onDragStart={(e) => handleDragStart(e, car, "dock")}
                  className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center shadow-md border-3 border-white cursor-grab active:cursor-grabbing transform hover:scale-105 active:scale-95 transition-all text-white font-black ${CAR_DICTIONARY[car].color}`}
                >
                  <span className="text-4xl leading-none">{CAR_DICTIONARY[car].emoji}</span>
                  <span className="text-[10px] uppercase mt-2 tracking-wider">{CAR_DICTIONARY[car].name}</span>
                </div>
              ))
            )}
          </div>

          {/* Action Control Panel */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCheck}
                className="bg-red-500 hover:bg-red-600 text-white font-black text-xl px-8 py-4 rounded-2xl border-b-6 border-red-700 hover:border-red-800 transition-all active:scale-95 active:border-b-2 flex items-center gap-2 shadow-md"
              >
                🚂 CHOO CHOO! (Check)
              </button>
              <button
                onClick={handleReset}
                className="bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-lg px-6 py-4 rounded-2xl border-b-4 border-pink-700 hover:border-pink-800 transition-all active:scale-95 flex items-center gap-1 shadow-md"
              >
                <RotateCcw className="w-5 h-5" /> Start Over
              </button>
            </div>
            
            <button
              onClick={() => { playSound("click"); setScreen("levels"); }}
              className="bg-slate-600 hover:bg-slate-700 text-white font-extrabold text-lg px-6 py-4 rounded-2xl border-b-4 border-slate-700 transition-all active:scale-95 shadow-md self-end md:self-auto"
            >
              ⬅ Quit Level
            </button>
          </div>

          {/* Interactive Feedback banner */}
          <div
            className={`w-full text-center py-3.5 px-6 rounded-xl text-lg font-black shadow-xs border flex items-center justify-center gap-2 transition-all ${
              feedbackType === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : feedbackType === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : feedbackType === "warning"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-white text-slate-800 border-slate-200"
            }`}
          >
            {feedbackType === "error" && <AlertCircle className="w-5 h-5 shrink-0" />}
            {feedbackType === "success" && <Sparkles className="w-5 h-5 text-green-500 shrink-0" />}
            <span>{feedback}</span>
          </div>
        </div>
      )}

      {/* Screen: Victory Dialog Modal */}
      {showVictory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#87CEEB] to-white rounded-3xl border-4 border-orange-400 p-8 text-center max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Fanfare floating particles */}
            <div className="text-6xl mb-4 animate-bounce">🚂💨</div>
            <h2 className="text-4xl font-black text-red-500 drop-shadow font-heading">
              CHOO CHOO!
            </h2>
            <p className="text-slate-800 text-xl font-bold mt-2">
              You built the train!
            </p>
            
            <div className="bg-amber-100/80 border border-amber-300 rounded-2xl py-4 px-6 inline-flex flex-col items-center mt-6 shadow-xs">
              <span className="text-sm font-bold text-amber-800 uppercase tracking-widest">Stars Earned</span>
              <div className="flex gap-1 text-3xl mt-1 text-amber-500">
                {Array.from({ length: earnedStars }).map((_, i) => (
                  <Star key={i} className="fill-amber-400 text-amber-500" />
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              {currentLevel < 8 ? (
                <button
                  onClick={() => startLevel(currentLevel + 1)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-extrabold text-xl py-4 rounded-2xl border-b-6 border-green-700 transition-all active:scale-95"
                >
                  Next Level ➡️
                </button>
              ) : (
                <button
                  onClick={() => { playSound("click"); setScreen("levels"); }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-extrabold text-xl py-4 rounded-2xl border-b-6 border-green-700 transition-all active:scale-95"
                >
                  Victory Lap! 🎉
                </button>
              )}
              <button
                onClick={() => { playSound("click"); setScreen("levels"); }}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-lg py-4 rounded-2xl border-b-6 border-sky-700 transition-all active:scale-95"
              >
                Level Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
