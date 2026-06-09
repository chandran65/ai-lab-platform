import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, Trash2, RotateCcw, Volume2, VolumeX, ArrowLeft, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight, Sparkles } from "lucide-react";
import { gamesAPI } from "../../services/api";

// Web Audio API Synth Engine for Turtle Game
const playSynth = (type: string, soundOn: boolean) => {
  if (!soundOn) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    switch (type) {
      case "add": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(880, now + 0.06);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.14);
        break;
      }
      case "clear": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(330, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.12);
        break;
      }
      case "move": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.exponentialRampToValueAtTime(659, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.12);
        break;
      }
      case "wall":
      case "rock": {
        // Low crash buzz
        [150, 155].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(80, now + 0.3);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(now + 0.35);
        });
        break;
      }
      case "win": {
        // Joyful arpeggio
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.3);
        });
        break;
      }
      case "level": {
        const notes = [659, 784, 988, 1319];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.08, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.22);
        });
        break;
      }
      case "reset": {
        [550, 440, 330].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.06, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.12);
        });
        break;
      }
    }
  } catch (err) {
    console.warn("Synth audio playing blocked:", err);
  }
};

interface LevelData {
  name: string;
  emoji: string;
  diff: string;
  start: [number, number];
  goal: [number, number];
  obstacles: [number, number][];
  hint: string;
  sky: string;
  diffColor: string;
}

const LEVELS: LevelData[] = [
  {
    name: "Meadow", emoji: "🌿", diff: "EASY",
    start: [0, 0], goal: [7, 5],
    obstacles: [[2, 1], [[3, 2] as any, [4, 3] as any] as any].flat(), // flatten elements safely
    hint: "A gentle stroll — build your path!",
    sky: "bg-gradient-to-br from-[#0a2015] to-[#1a4030]",
    diffColor: "text-green-400 border-green-500/30 bg-green-500/10"
  },
  {
    name: "Forest", emoji: "🌲", diff: "MEDIUM",
    start: [0, 0], goal: [7, 4],
    obstacles: [[1, 1], [2, 1], [3, 1], [4, 1], [4, 2], [4, 3], [2, 3], [2, 4]],
    hint: "Weave through the trees carefully!",
    sky: "bg-gradient-to-br from-[#0a1a0a] to-[#153020]",
    diffColor: "text-teal-400 border-teal-500/30 bg-teal-500/10"
  },
  {
    name: "Canyon", emoji: "🏜️", diff: "TRICKY",
    start: [0, 2], goal: [7, 3],
    obstacles: [[1, 0], [1, 1], [1, 3], [1, 4], [1, 5], [3, 0], [3, 1], [3, 3], [3, 4], [5, 1], [5, 2], [5, 4], [5, 5]],
    hint: "Squeeze through the canyon gaps!",
    sky: "bg-gradient-to-br from-[#1a1000] to-[#302010]",
    diffColor: "text-amber-400 border-amber-500/30 bg-amber-500/10"
  },
  {
    name: "Volcano", emoji: "🌋", diff: "HARD",
    start: [0, 5], goal: [7, 0],
    obstacles: [[1, 3], [1, 4], [2, 1], [2, 2], [3, 3], [3, 4], [4, 1], [4, 2], [5, 3], [5, 4], [6, 2], [6, 3]],
    hint: "Climb to safety — one wrong step resets!",
    sky: "bg-gradient-to-br from-[#1a0505] to-[#300a0a]",
    diffColor: "text-red-400 border-red-500/30 bg-red-500/10"
  },
  {
    name: "Galaxy", emoji: "🌌", diff: "EXPERT",
    start: [0, 0], goal: [7, 5],
    obstacles: [[1, 1], [1, 2], [2, 0], [2, 3], [3, 1], [3, 4], [4, 2], [4, 5], [5, 0], [5, 3], [6, 1], [6, 4], [3, 2], [5, 4]],
    hint: "Master the cosmos — plan every move!",
    sky: "bg-gradient-to-br from-[#050010] to-[#0a0020]",
    diffColor: "text-purple-400 border-purple-500/30 bg-purple-500/10"
  }
];

// Clean Meadow obstacles level mapping
LEVELS[0].obstacles = [[2, 1], [3, 2], [4, 3]];

const COLS = 8;
const ROWS = 6;
const DIR_SYMBOLS: Record<string, string> = { UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→" };

export default function TurtlePath() {
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [player, setPlayer] = useState<[number, number]>([0, 0]);
  const [steps, setSteps] = useState<number>(0);
  const [moveQueue, setMoveQueue] = useState<string[]>([]);
  const [executing, setExecuting] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    return localStorage.getItem("turtle_sound") !== "off";
  });
  
  // Game alerts
  const [message, setMessage] = useState<string>("Queue your moves then press EXECUTE!");
  const [messageColor, setMessageColor] = useState<string>("text-slate-300");
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [flashingPlayer, setFlashingPlayer] = useState<boolean>(false);

  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(0);
  const [inputMode, setInputMode] = useState<"arrows" | "block_code">("arrows");
  const [jsonCode, setJsonCode] = useState<string>("[\n  { \"type\": \"move\", \"direction\": \"RIGHT\", \"times\": 3 }\n]");

  // Load progress from backend on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await gamesAPI.getProgress("turtle_path");
        const progress = res.data.progress_data;
        if (progress && typeof progress.maxUnlockedLevel === "number") {
          setMaxUnlockedLevel(progress.maxUnlockedLevel);
          setCurrentLevel(progress.maxUnlockedLevel);
        }
      } catch (err) {
        console.error("Failed to load turtle path progress:", err);
      }
    };
    loadProgress();
  }, []);

  const appendSnippet = (direction: string, times: number = 1) => {
    try {
      let currentArray: any[] = [];
      try {
        currentArray = JSON.parse(jsonCode);
        if (!Array.isArray(currentArray)) currentArray = [];
      } catch {
        currentArray = [];
      }
      currentArray.push({ type: "move", direction, times });
      setJsonCode(JSON.stringify(currentArray, null, 2));
      setMessage(`Added JSON command: Move ${direction} x${times}`);
      setMessageColor("text-sky-300");
      playSynth("add", soundOn);
    } catch {
      setJsonCode(prev => prev + `,\n  { "type": "move", "direction": "${direction}", "times": ${times} }`);
    }
  };

  const appendRepeatSnippet = (direction: string, times: number) => {
    try {
      let currentArray: any[] = [];
      try {
        currentArray = JSON.parse(jsonCode);
        if (!Array.isArray(currentArray)) currentArray = [];
      } catch {
        currentArray = [];
      }
      currentArray.push({
        type: "repeat",
        times,
        commands: [{ type: "move", direction, times: 1 }]
      });
      setJsonCode(JSON.stringify(currentArray, null, 2));
      setMessage(`Added JSON Repeat: ${direction} x${times}`);
      setMessageColor("text-sky-300");
      playSynth("add", soundOn);
    } catch {}
  };

  const compileJsonToQueue = (code: string): string[] => {
    try {
      const blocks = JSON.parse(code);
      if (!Array.isArray(blocks)) {
        throw new Error("JSON must be a list of commands like [ ... ]");
      }
      const queue: string[] = [];
      
      const parseBlock = (block: any) => {
        if (!block || typeof block !== "object") return;
        if (block.type === "move") {
          const dir = (block.direction || "").toUpperCase();
          if (dir !== "UP" && dir !== "DOWN" && dir !== "LEFT" && dir !== "RIGHT") {
            throw new Error(`Invalid direction: "${block.direction}". Must be UP, DOWN, LEFT, or RIGHT.`);
          }
          const times = typeof block.times === "number" ? block.times : 1;
          for (let i = 0; i < times; i++) {
            queue.push(dir);
          }
        } else if (block.type === "repeat") {
          const times = typeof block.times === "number" ? block.times : 1;
          const subCommands = block.commands;
          if (!Array.isArray(subCommands)) {
            throw new Error("Repeat block must have a 'commands' array");
          }
          for (let t = 0; t < times; t++) {
            subCommands.forEach(sub => parseBlock(sub));
          }
        } else {
          throw new Error(`Unknown block type: "${block.type}"`);
        }
      };

      blocks.forEach(block => parseBlock(block));
      return queue;
    } catch (err: any) {
      throw new Error(err.message || "Failed to parse block code JSON");
    }
  };
  
  // Confetti particles for win screen
  const [confetti, setConfetti] = useState<{ id: number; left: number; top: number; color: string; size: number }[]>([]);

  const levelInfo = LEVELS[currentLevel];

  // Reset player to start
  const handleReset = useCallback((silent = false) => {
    if (!silent) playSynth("reset", soundOn);
    setPlayer(levelInfo.start);
    setSteps(0);
    setExecuting(false);
    setGameWon(false);
    setFlashingPlayer(false);
    if (!silent) {
      setMessage("Level reset! Ready for your path commands.");
      setMessageColor("text-indigo-300");
    }
  }, [currentLevel, soundOn, levelInfo]);

  useEffect(() => {
    handleReset(true);
    setMoveQueue([]);
  }, [currentLevel, handleReset]);

  // Command additions
  const addMove = useCallback((direction: string) => {
    if (gameWon || executing) return;
    if (moveQueue.length >= 20) {
      setMessage("Queue full! Clear some moves first.");
      setMessageColor("text-amber-400");
      return;
    }
    setMoveQueue(prev => [...prev, direction]);
    playSynth("add", soundOn);
    setMessage(`Added ${DIR_SYMBOLS[direction]} to queue (${moveQueue.length + 1}/20)`);
    setMessageColor("text-sky-300");
  }, [moveQueue, executing, gameWon, soundOn]);

  const clearQueue = () => {
    if (executing || gameWon) return;
    setMoveQueue([]);
    playSynth("clear", soundOn);
    setMessage("Queue cleared. Enter new movements.");
    setMessageColor("text-slate-400");
  };

  const toggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    localStorage.setItem("turtle_sound", nextVal ? "on" : "off");
    playSynth(nextVal ? "sndon" : "sndoff", true);
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") { e.preventDefault(); addMove("UP"); }
      if (e.key === "ArrowDown") { e.preventDefault(); addMove("DOWN"); }
      if (e.key === "ArrowLeft") { e.preventDefault(); addMove("LEFT"); }
      if (e.key === "ArrowRight") { e.preventDefault(); addMove("RIGHT"); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addMove]);

  // Execute sequence
  const executeQueue = () => {
    if (gameWon || executing) return;
    
    let activeQueue = [...moveQueue];
    
    if (inputMode === "block_code") {
      try {
        activeQueue = compileJsonToQueue(jsonCode);
        if (activeQueue.length === 0) {
          setMessage("Compiled empty sequence! Add some blocks.");
          setMessageColor("text-amber-400");
          return;
        }
        setMoveQueue(activeQueue);
      } catch (err: any) {
        playSynth("failure", soundOn);
        setMessage(`JSON Syntax Error: ${err.message}`);
        setMessageColor("text-red-400");
        return;
      }
    } else {
      if (moveQueue.length === 0) {
        setMessage("Queue is empty! Queue up some moves first.");
        setMessageColor("text-amber-400");
        return;
      }
    }

    setExecuting(true);
    setMessage("Turtle executing path sequence...");
    setMessageColor("text-green-300");

    let stepIdx = 0;
    let currentPos = [...levelInfo.start] as [number, number];

    const stepInterval = setInterval(() => {
      if (stepIdx >= activeQueue.length) {
        clearInterval(stepInterval);
        setExecuting(false);
        // If finished queue and not at goal, we failed
        const [px, py] = currentPos;
        const [gx, gy] = levelInfo.goal;
        if (px !== gx || py !== gy) {
          playSynth("wall", soundOn);
          setMessage("Incorrect path! Bounded or stranded before Home. Resetting...");
          setMessageColor("text-red-400");
          setFlashingPlayer(true);
          setTimeout(() => {
            handleReset(true);
          }, 1000);
        }
        return;
      }

      const move = activeQueue[stepIdx];
      stepIdx++;
      setSteps(prev => prev + 1);

      let [x, y] = currentPos;
      if (move === "UP") y -= 1;
      if (move === "DOWN") y += 1;
      if (move === "LEFT") x -= 1;
      if (move === "RIGHT") x += 1;

      // Check boundary hit
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
        clearInterval(stepInterval);
        playSynth("wall", soundOn);
        setMessage(`Hit boundary going ${move}! Resetting...`);
        setMessageColor("text-red-400");
        setFlashingPlayer(true);
        setExecuting(false);
        setTimeout(() => {
          handleReset(true);
        }, 1000);
        return;
      }

      // Check obstacle hit
      const hitsObstacle = levelInfo.obstacles.some(([ox, oy]) => ox === x && oy === y);
      if (hitsObstacle) {
        clearInterval(stepInterval);
        playSynth("rock", soundOn);
        setMessage(`Oops! Crashed into a floating boulder! Resetting...`);
        setMessageColor("text-red-400");
        setFlashingPlayer(true);
        setExecuting(false);
        setTimeout(() => {
          handleReset(true);
        }, 1000);
        return;
      }

      // Valid move
      currentPos = [x, y];
      setPlayer(currentPos);
      playSynth("move", soundOn);

      // Check goal
      const [gx, gy] = levelInfo.goal;
      if (x === gx && y === gy) {
        clearInterval(stepInterval);
        setExecuting(false);
        setGameWon(true);
        playSynth("win", soundOn);
        setMessage("🎉 SUCCESS! The turtle reached Home!");
        setMessageColor("text-green-400");
        triggerVictoryConfetti();

        const nextLvl = Math.max(maxUnlockedLevel, currentLevel + 1);
        if (nextLvl < LEVELS.length) {
          setMaxUnlockedLevel(nextLvl);
        }
        gamesAPI.saveProgress("turtle_path", {
          maxUnlockedLevel: nextLvl
        }).catch(err => console.error("Failed to save turtle path progress:", err));
      }
    }, 450);
  };

  // Win confetti trigger
  const triggerVictoryConfetti = () => {
    const colors = ["#FFD700", "#00e5ff", "#00e676", "#ff1744", "#d500f9"];
    const items = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 85 + 5,
      top: Math.random() * 60 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 12 + 6
    }));
    setConfetti(items);
  };

  const handleNextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      playSynth("level", soundOn);
      setCurrentLevel(prev => prev + 1);
      setMoveQueue([]);
      setConfetti([]);
    }
  };

  const handlePrevLevel = () => {
    if (currentLevel > 0) {
      playSynth("level", soundOn);
      setCurrentLevel(prev => prev - 1);
      setMoveQueue([]);
      setConfetti([]);
    }
  };

  return (
    <div className={`flex-1 min-h-[calc(100vh-6rem)] rounded-3xl p-6 relative overflow-hidden font-mono border-b-[6px] border-slate-950 shadow-2xl text-white ${levelInfo.sky} flex flex-col lg:flex-row gap-6 transition-all duration-1000`}>
      {/* Visual Stars Backdrop for cosmic levels */}
      {currentLevel === 4 && (
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Confetti overlays */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="absolute rounded-full pointer-events-none z-50 animate-bounce duration-500"
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            boxShadow: "0 0 10px rgba(255,255,255,0.4)"
          }}
        />
      ))}

      {/* Left panel: Path instructions and controls */}
      <div className="w-full lg:w-[280px] bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shrink-0 flex flex-col justify-between gap-6 z-10 shadow-lg relative">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-black text-amber-400 tracking-wider">MINDORA 3D</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Turtle Path Grid Game</p>
          </div>
          
          <div className="border-t border-slate-800 my-2" />

          {/* Level details */}
          <div className="text-center space-y-1.5">
            <h2 className="text-lg font-black text-cyan-400 flex items-center justify-center gap-1.5">
              <span>{levelInfo.emoji}</span> Level {currentLevel + 1}: {levelInfo.name}
            </h2>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${levelInfo.diffColor}`}>
              ● {levelInfo.diff}
            </span>
          </div>

          {/* Hint panel */}
          <div className="bg-[#05111e] border border-slate-800 rounded-xl p-3 text-center min-h-[4rem] flex items-center justify-center">
            <p className="text-[11px] font-bold text-slate-300 leading-normal">{levelInfo.hint}</p>
          </div>

          {/* Input Mode Selector Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 gap-1 my-1">
            <button
              onClick={() => setInputMode("arrows")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                inputMode === "arrows"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎮 Arrows
            </button>
            <button
              onClick={() => setInputMode("block_code")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                inputMode === "block_code"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              💻 JSON Blocks
            </button>
          </div>

          {inputMode === "arrows" ? (
            <>
              {/* Movement Queuer HUD */}
              <div className="space-y-2">
                <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center">Command Queue</h3>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 min-h-[4.5rem] flex flex-wrap gap-1.5 items-center justify-center text-center">
                  {moveQueue.length === 0 ? (
                    <span className="text-slate-600 text-xs italic font-bold">[ queue empty ]</span>
                  ) : (
                    moveQueue.map((m, idx) => (
                      <span
                        key={idx}
                        className="w-7 h-7 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm"
                        title={m}
                      >
                        {DIR_SYMBOLS[m]}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Direction inputs */}
              <div className="space-y-3">
                <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Add Moves</h3>
                <div className="flex flex-col items-center gap-2">
                  <button
                    disabled={executing || gameWon}
                    onClick={() => addMove("UP")}
                    className="w-16 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl flex items-center justify-center font-bold shadow border-b-4 border-blue-800"
                  >
                    <ArrowUp className="w-5 h-5 text-white" />
                  </button>
                  <div className="flex gap-2">
                    <button
                      disabled={executing || gameWon}
                      onClick={() => addMove("LEFT")}
                      className="w-16 h-10 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 rounded-xl flex items-center justify-center font-bold shadow border-b-4 border-amber-800"
                    >
                      <ArrowLeftIcon className="w-5 h-5 text-white" />
                    </button>
                    <button
                      disabled={executing || gameWon}
                      onClick={() => addMove("RIGHT")}
                      className="w-16 h-10 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 rounded-xl flex items-center justify-center font-bold shadow border-b-4 border-purple-800"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <button
                    disabled={executing || gameWon}
                    onClick={() => addMove("DOWN")}
                    className="w-16 h-10 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 rounded-xl flex items-center justify-center font-bold shadow border-b-4 border-teal-800"
                  >
                    <ArrowDown className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">JSON Code</h3>
                <button
                  onClick={() => {
                    setJsonCode("[]");
                    playSynth("clear", soundOn);
                  }}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                >
                  Clear Code
                </button>
              </div>
              <textarea
                value={jsonCode}
                onChange={(e) => setJsonCode(e.target.value)}
                className="w-full h-32 p-2 text-[10px] bg-slate-950 border border-slate-800 rounded-xl font-mono text-cyan-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 overflow-y-auto whitespace-pre leading-relaxed"
                spellCheck={false}
              />
              {/* Block Quick Templates */}
              <div className="space-y-1.5">
                <h4 className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Add Commands</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => appendSnippet("UP")}
                    className="py-1 bg-blue-900/40 hover:bg-blue-900 text-blue-300 rounded border border-blue-500/20 text-[9px] font-bold"
                  >
                    + Move UP
                  </button>
                  <button
                    onClick={() => appendSnippet("DOWN")}
                    className="py-1 bg-teal-900/40 hover:bg-teal-900 text-teal-300 rounded border border-teal-500/20 text-[9px] font-bold"
                  >
                    + Move DOWN
                  </button>
                  <button
                    onClick={() => appendSnippet("LEFT")}
                    className="py-1 bg-amber-900/40 hover:bg-amber-900 text-amber-300 rounded border border-amber-500/20 text-[9px] font-bold"
                  >
                    + Move LEFT
                  </button>
                  <button
                    onClick={() => appendSnippet("RIGHT")}
                    className="py-1 bg-purple-900/40 hover:bg-purple-900 text-purple-300 rounded border border-purple-500/20 text-[9px] font-bold"
                  >
                    + Move RIGHT
                  </button>
                </div>
                <div className="grid grid-cols-1 mt-1">
                  <button
                    onClick={() => appendRepeatSnippet("RIGHT", 3)}
                    className="py-1 bg-indigo-900/40 hover:bg-indigo-900 text-indigo-300 rounded border border-indigo-500/20 text-[9px] font-bold"
                  >
                    🔄 Loop: Move RIGHT x3
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Console control buttons */}
        <div className="space-y-2 mt-4">
          <button
            onClick={executeQueue}
            disabled={executing || gameWon || moveQueue.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 border-b-4 border-green-800 active:translate-y-0.5 active:border-b-0 transition-all shadow"
          >
            <PlayCircle className="w-4 h-4" /> EXECUTE MOVES
          </button>
          <button
            onClick={clearQueue}
            disabled={executing || gameWon || moveQueue.length === 0}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 border-b-4 border-slate-900 active:translate-y-0.5 active:border-b-0 transition-all shadow"
          >
            <Trash2 className="w-4 h-4" /> CLEAR QUEUE
          </button>
          <button
            onClick={() => handleReset(false)}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 border-b-4 border-red-800 active:translate-y-0.5 active:border-b-0 transition-all shadow"
          >
            <RotateCcw className="w-4 h-4" /> RESET PLAYER
          </button>

          <div className="border-t border-slate-800 my-2" />

          {/* Level Jumps */}
          <div className="flex gap-2">
            <button
              onClick={handlePrevLevel}
              disabled={currentLevel === 0}
              className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-[10px] font-bold py-2 px-3 rounded-lg border-b-2 border-slate-950"
            >
              ◀ PREV
            </button>
            <button
              onClick={handleNextLevel}
              disabled={currentLevel === LEVELS.length - 1}
              className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-[10px] font-bold py-2 px-3 rounded-lg border-b-2 border-slate-950"
            >
              NEXT ▶
            </button>
          </div>

          {/* Audio Chime Controller */}
          <button
            onClick={toggleSound}
            className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-extrabold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 shadow-sm"
          >
            {soundOn ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>SOUND ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>SOUND MUTED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Content Area: 3D Grid board map */}
      <div className="flex-1 flex flex-col justify-between items-center relative z-10 py-4 gap-6 w-full">
        {/* Navigation title banner bar */}
        <div className="w-full flex justify-between items-center bg-slate-950/80 border border-slate-800/80 py-3 px-6 rounded-2xl shadow-lg relative">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Game Hub
          </Link>
          <div className="text-xs font-bold text-slate-400">
            Commands Count: <span className="text-cyan-400 font-extrabold">{moveQueue.length}</span> | Steps: <span className="text-green-400 font-extrabold">{steps}</span>
          </div>
        </div>

        {/* 3D Grid canvas area */}
        <div className="flex-1 flex items-center justify-center w-full min-h-[50vh] p-4 relative overflow-auto">
          {/* Isometric grid matrix structure */}
          <div
            className="grid grid-cols-8 grid-rows-6 gap-2 p-6 bg-slate-950/30 border border-white/5 rounded-3xl relative shadow-2xl"
            style={{
              perspective: "800px",
              transform: "rotateX(20deg) rotateZ(-10deg)"
            }}
          >
            {Array.from({ length: ROWS }).map((_, r) => {
              return Array.from({ length: COLS }).map((_, c) => {
                const isStart = levelInfo.start[0] === c && levelInfo.start[1] === r;
                const isGoal = levelInfo.goal[0] === c && levelInfo.goal[1] === r;
                const isPlayer = player[0] === c && player[1] === r;
                const isObstacle = levelInfo.obstacles.some(([ox, oy]) => ox === c && oy === r);
                
                // Color coordinate checker pattern
                const isEven = (r + c) % 2 === 0;
                let bgFace = isEven ? "bg-emerald-700/80" : "bg-emerald-800/80";
                let shadowColor = "border-emerald-950";
                
                if (currentLevel === 2) {
                  // Canyon styling
                  bgFace = isEven ? "bg-[#8c5230]" : "bg-[#9a5d39]";
                  shadowColor = "border-[#542d17]";
                } else if (currentLevel === 3) {
                  // Volcano
                  bgFace = isEven ? "bg-[#451414]" : "bg-[#541a1a]";
                  shadowColor = "border-[#2d0a0a]";
                } else if (currentLevel === 4) {
                  // Galaxy
                  bgFace = isEven ? "bg-indigo-950/90" : "bg-slate-900/90";
                  shadowColor = "border-indigo-950";
                }

                return (
                  <div
                    key={`${c}-${r}`}
                    className={`w-14 h-14 md:w-16 md:h-16 relative flex items-center justify-center rounded-lg border border-white/5 shadow-inner transition-all duration-300 ${bgFace}`}
                    style={{
                      transformStyle: "preserve-3d",
                      boxShadow: "inset 0 4px 6px rgba(255,255,255,0.06)"
                    }}
                  >
                    {/* 3D Side extrusion panels to render "height" depth */}
                    <div className={`absolute bottom-[-6px] left-0 w-full h-[6px] border-b-6 ${shadowColor} rounded-b-md z-0 pointer-events-none`} />

                    {/* Start tile highlight border overlay */}
                    {isStart && !isPlayer && (
                      <div className="absolute inset-1 border-2 border-cyan-400 rounded-md bg-cyan-950/40 flex flex-col justify-center items-center text-[7px] font-bold text-cyan-300">
                        START
                      </div>
                    )}

                    {/* Goal item */}
                    {isGoal && !isPlayer && (
                      <div className="absolute -top-4 w-12 h-12 flex flex-col justify-center items-center select-none animate-bounce" style={{ transform: "translateZ(20px)" }}>
                        <span className="text-3xl filter drop-shadow-[0_4px_8px_rgba(255,215,0,0.5)]">🏠</span>
                        <span className="text-[7px] font-black bg-yellow-400 text-slate-950 rounded px-1 -mt-1 scale-90">HOME</span>
                      </div>
                    )}

                    {/* Obstacle animated floating rock */}
                    {isObstacle && (
                      <div
                        className="absolute -top-6 w-11 h-11 bg-gradient-to-b from-slate-600 to-slate-800 border-2 border-slate-950 rounded-2xl flex flex-col justify-center items-center shadow-lg select-none z-10"
                        style={{
                          transform: "translateZ(30px)",
                          animation: `float-rock 3s ease-in-out infinite alternate`,
                          animationDelay: `${(c + r) * 0.15}s`
                        }}
                      >
                        {/* SPECULAR SHIMMER & CRACKS */}
                        <div className="w-2 h-2 rounded-full bg-white/20 absolute top-1 left-2 blur-[1px]" />
                        <div className="w-full h-0.5 bg-sky-300/30 rotate-12 absolute" />
                        <span className="text-lg filter drop-shadow">💎</span>
                      </div>
                    )}

                    {/* Player Turtle avatar character */}
                    {isPlayer && (
                      <div
                        className={`absolute -top-8 w-12 h-12 flex flex-col justify-center items-center z-20 transition-all duration-300 ${
                          flashingPlayer ? "animate-pulse" : ""
                        }`}
                        style={{ transform: "translateZ(35px) scale(1.1)" }}
                      >
                        {/* Custom animated SVG Turtle face/shell */}
                        <svg className="w-10 h-10 filter drop-shadow-[0_8px_10px_rgba(0,0,0,0.35)]" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="14" fill={flashingPlayer ? "#ef4444" : "#1a7a3a"} stroke="#0a3018" strokeWidth="1.5" />
                          <circle cx="20" cy="20" r="10" fill={flashingPlayer ? "#f87171" : "#229948"} />
                          {/* head */}
                          <circle cx="20" cy="6" r="4.5" fill={flashingPlayer ? "#b91c1c" : "#56c97a"} stroke="#0a3018" strokeWidth="1" />
                          {/* flippers */}
                          <ellipse cx="6" cy="14" rx="4" ry="7" fill="#1a7a3a" transform="rotate(-30 6 14)" />
                          <ellipse cx="34" cy="14" rx="4" ry="7" fill="#1a7a3a" transform="rotate(30 34 14)" />
                          <ellipse cx="8" cy="28" rx="3.5" ry="6.5" fill="#1a7a3a" transform="rotate(30 8 28)" />
                          <ellipse cx="32" cy="28" rx="3.5" ry="6.5" fill="#1a7a3a" transform="rotate(-30 32 28)" />
                          {/* tail */}
                          <polygon points="20,32 18,37 22,37" fill="#1a7a3a" />
                          {/* eyes */}
                          <circle cx="18.5" cy="5" r="0.8" fill="white" />
                          <circle cx="21.5" cy="5" r="0.8" fill="white" />
                          <circle cx="18.5" cy="5" r="0.4" fill="black" />
                          <circle cx="21.5" cy="5" r="0.4" fill="black" />
                        </svg>
                        <span className="text-[7px] font-black text-white bg-slate-900/80 px-1 rounded absolute -bottom-1">TURTLE</span>
                      </div>
                    )}
                  </div>
                );
              });
            })}
          </div>
        </div>

        {/* Console feedback alert bar */}
        <div
          className={`w-full max-w-4xl text-center py-4 px-6 rounded-2xl text-sm font-black border transition-all flex items-center justify-center gap-2 bg-[#05111e] border-slate-800 ${messageColor}`}
        >
          {message.startsWith("❌") && <span className="text-red-500 text-lg">⚠️</span>}
          {message.startsWith("🎉") && <Sparkles className="w-5 h-5 text-green-400 shrink-0" />}
          <span>{message}</span>
        </div>
      </div>

      {/* Screen: Game won next-level modal overlay */}
      {gameWon && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-400 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <span className="text-6xl mb-4 block animate-bounce">🐢🏡</span>
            <h2 className="text-3xl font-black text-green-400 tracking-wide font-heading">
              LEVEL COMPLETED!
            </h2>
            <p className="text-slate-300 font-bold mt-3 leading-relaxed">
              Fantastic! You successfully guided the turtle back to its cozy home!
            </p>

            <div className="flex gap-4 mt-8">
              {currentLevel < LEVELS.length - 1 ? (
                <button
                  onClick={handleNextLevel}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-lg py-4 rounded-xl border-b-4 border-cyan-800"
                >
                  Next Level ➡️
                </button>
              ) : (
                <button
                  onClick={() => { playSynth("level", soundOn); setCurrentLevel(0); setMoveQueue([]); setConfetti([]); setGameWon(false); }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-extrabold text-lg py-4 rounded-xl border-b-4 border-green-800"
                >
                  🔄 Play Again!
                </button>
              )}
              <button
                onClick={() => { playSynth("clear", soundOn); setGameWon(false); setMoveQueue([]); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-md py-4 rounded-xl border-b-4 border-slate-950"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inject custom floats CSS animation right in the document */}
      <style>{`
        @keyframes float-rock {
          from {
            transform: translateZ(30px) translateY(0);
          }
          to {
            transform: translateZ(30px) translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
}
