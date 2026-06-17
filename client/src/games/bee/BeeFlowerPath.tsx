import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  PlayCircle, Trash2, RotateCcw, Volume2, VolumeX, ArrowLeft, ArrowUp, ArrowDown,
  ArrowRight, Sparkles, Sun, Moon, HelpCircle, Award, BarChart2, CheckCircle2, Navigation, Droplets, Zap, Terminal
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { gamesAPI } from "../../services/api";

// Web Audio API Synth Engine for Bee Game
const playBeeSynth = (type: string, soundOn: boolean) => {
  if (!soundOn) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    switch (type) {
      case "buzz": {
        // Bee flight buzz
        const osc = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.35);
        mod.frequency.setValueAtTime(15, now);
        modGain.gain.setValueAtTime(10, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(ctx.destination);
        mod.start();
        osc.start();
        mod.stop(now + 0.4);
        osc.stop(now + 0.4);
        break;
      }
      case "flower": {
        const notes = [587.33, 880, 1174.66];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
        break;
      }
      case "honey": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.1);
        break;
      }
      case "key": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.linearRampToValueAtTime(1318.51, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.22);
        break;
      }
      case "gate": {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(250, now);
        osc1.frequency.linearRampToValueAtTime(150, now + 0.15);
        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(220, now);
        osc2.frequency.linearRampToValueAtTime(120, now + 0.15);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(now + 0.2);
        osc2.stop(now + 0.2);
        break;
      }
      case "failure": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.35);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.4);
        break;
      }
      case "win": {
        const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50];
        scale.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.06, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.2);
        });
        break;
      }
      case "add": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.08);
        break;
      }
      case "clear": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(350, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.08);
        break;
      }
    }
  } catch (err) {
    console.warn("Synth audio blocked:", err);
  }
};

interface LevelData {
  name: string;
  emoji: string;
  diff: string;
  gridSize: number;
  start: [number, number];
  goals: [number, number][];
  obstacles: [number, number][];
  key: [number, number] | null;
  gate: [number, number] | null;
  honey: [number, number][];
  energy: number | null;
  wind: { dir: string; interval: number; label: string } | null;
  movingObstacles: { start: [number, number]; path: [number, number][]; label: string }[] | null;
  rain: boolean;
  hint: string;
  sky: string;
  diffColor: string;
}

const LEVELS: LevelData[] = [
  {
    name: "Gentle Flight", emoji: "🌸", diff: "EASY", gridSize: 5,
    start: [0, 2], goals: [[4, 2]],
    obstacles: [], key: null, gate: null, honey: [], energy: null, wind: null, movingObstacles: null, rain: false,
    hint: "Guide the bee directly to the flower. A straight path is all you need!",
    sky: "from-yellow-50 to-green-100 dark:from-slate-900 dark:to-[#0f1d19]",
    diffColor: "text-green-600 border-green-500/30 bg-green-500/10"
  },
  {
    name: "Round the Rock", emoji: "🪨", diff: "EASY", gridSize: 5,
    start: [0, 2], goals: [[4, 2]],
    obstacles: [[2, 2]], key: null, gate: null, honey: [], energy: null, wind: null, movingObstacles: null, rain: false,
    hint: "A heavy rock blocks the direct route. Fly above or below it to reach the flower!",
    sky: "from-yellow-50 to-green-100 dark:from-slate-900 dark:to-[#0f1d19]",
    diffColor: "text-green-600 border-green-500/30 bg-green-500/10"
  },
  {
    name: "Garden Obstacles", emoji: "🌿", diff: "MEDIUM", gridSize: 5,
    start: [0, 0], goals: [[4, 4]],
    obstacles: [[1, 1], [2, 2], [3, 3]], key: null, gate: null, honey: [], energy: null, wind: null, movingObstacles: null, rain: false,
    hint: "Bushes are blocking the diagonal. Weave through the garden grid to reach the flower!",
    sky: "from-emerald-50 to-green-100 dark:from-slate-900 dark:to-[#0f1d19]",
    diffColor: "text-teal-600 border-teal-500/30 bg-teal-500/10"
  },
  {
    name: "Bushy Maze", emoji: "🌳", diff: "MEDIUM", gridSize: 8,
    start: [0, 0], goals: [[7, 7]],
    obstacles: [
      [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [6, 2], [7, 2],
      [1, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4],
      [0, 6], [1, 6], [2, 6], [3, 6], [5, 6], [6, 6]
    ], key: null, gate: null, honey: [], energy: null, wind: null, movingObstacles: null, rain: false,
    hint: "Find your way through the openings in the maze of bushes. Plan ahead!",
    sky: "from-emerald-50 to-green-100 dark:from-slate-900 dark:to-[#0f1d19]",
    diffColor: "text-teal-600 border-teal-500/30 bg-teal-500/10"
  },
  {
    name: "Double Bloom", emoji: "🌺", diff: "TRICKY", gridSize: 8,
    start: [0, 0], goals: [[3, 3], [7, 7]],
    obstacles: [[1, 1], [2, 5], [5, 2], [6, 6]], key: null, gate: null, honey: [], energy: null, wind: null, movingObstacles: null, rain: false,
    hint: "There are two flowers! You must collect both of them to win. The order you visit them matters!",
    sky: "from-yellow-50 to-orange-100 dark:from-slate-900 dark:to-[#241a0d]",
    diffColor: "text-amber-600 border-amber-500/30 bg-amber-500/10"
  },
  {
    name: "Windy Meadow", emoji: "💨", diff: "TRICKY", gridSize: 8,
    start: [0, 7], goals: [[7, 0]],
    obstacles: [[1, 4], [2, 1], [4, 5], [5, 2]], key: null, gate: null, honey: [], energy: 15,
    wind: { dir: "E", interval: 3, label: "East wind pushes bee EAST (+1 cell) every 3 moves!" },
    movingObstacles: null, rain: false,
    hint: "A strong wind pushes you right every 3 steps! Keep your energy (15 moves max) and the wind push in mind.",
    sky: "from-sky-100 to-indigo-100 dark:from-slate-900 dark:to-[#12182b]",
    diffColor: "text-amber-600 border-amber-500/30 bg-amber-500/10"
  },
  {
    name: "Honey Harvest", emoji: "🍯", diff: "HARD", gridSize: 8,
    start: [0, 4], goals: [[7, 4]],
    obstacles: [[3, 3], [3, 4], [4, 3], [4, 4]], key: null, gate: null,
    honey: [[3, 1], [4, 6]], energy: null, wind: null, movingObstacles: null, rain: false,
    hint: "Collect the sweet honey jars for extra points (+20 score each) before heading to the final flower!",
    sky: "from-amber-50 to-yellow-100 dark:from-slate-900 dark:to-[#2d1d0c]",
    diffColor: "text-red-600 border-red-500/30 bg-red-500/10"
  },
  {
    name: "Key to the Gate", emoji: "🔑", diff: "HARD", gridSize: 8,
    start: [0, 7], goals: [[7, 0]],
    obstacles: [
      [3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 6], [3, 7]
    ],
    key: [0, 0], gate: [3, 3], honey: [], energy: null, wind: null, movingObstacles: null, rain: false,
    hint: "The gate at [3,3] blocks the wall divider! Fly to the key at [0,0] first to unlock the gate, then pass through it.",
    sky: "from-indigo-50 to-purple-100 dark:from-slate-950 dark:to-[#1f1630]",
    diffColor: "text-red-600 border-red-500/30 bg-red-500/10"
  },
  {
    name: "Jumping Frogs", emoji: "🐸", diff: "EXPERT", gridSize: 10,
    start: [0, 0], goals: [[9, 9]],
    obstacles: [[1, 1], [2, 8], [8, 2]], key: null, gate: null, honey: [], energy: null, wind: null,
    movingObstacles: [
      { start: [3, 2], path: [[3, 2], [3, 3], [3, 4], [3, 5], [3, 4], [3, 3]], label: "Frog A bounces vertically" },
      { start: [6, 7], path: [[4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [7, 7], [6, 7], [5, 7]], label: "Frog B bounces horizontally" }
    ], rain: true,
    hint: "Watch out for the frogs! They hop when you fly. Also, the rain slows down the bee's flight time.",
    sky: "from-cyan-100 to-indigo-150 dark:from-slate-900 dark:to-[#09152b]",
    diffColor: "text-purple-600 border-purple-500/30 bg-purple-500/10"
  },
  {
    name: "Bee Academy Master", emoji: "🏆", diff: "EXPERT", gridSize: 10,
    start: [0, 0], goals: [[9, 9]],
    obstacles: [
      [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 6], [4, 7], [4, 8], [4, 9],
      [7, 0], [7, 1], [7, 2], [7, 3], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9]
    ],
    key: [9, 0], gate: [4, 5], honey: [[0, 9]], energy: 30, wind: null, movingObstacles: null, rain: false,
    hint: "The ultimate maze! Key is in the bottom-right chamber, gate is at the center, honey is in the top-right. Plan your steps carefully!",
    sky: "from-yellow-100 via-orange-100 to-amber-200 dark:from-slate-900 dark:to-[#2d1b0c]",
    diffColor: "text-purple-600 border-purple-500/30 bg-purple-500/10"
  }
];

interface BFSState {
  x: number;
  y: number;
  collectedMask: number;
  hasKey: boolean;
  steps: number;
  path: [number, number][];
  moves: string[];
}

const isHexAdjacent = (c1: number, r1: number, c2: number, r2: number) => {
  const dc = c1 - c2;
  const dr = r1 - r2;
  if (dr === 0) return Math.abs(dc) === 1;
  if (Math.abs(dr) === 1) {
    if (r2 % 2 === 0) {
      return dc === -1 || dc === 0;
    } else {
      return dc === 0 || dc === 1;
    }
  }
  return false;
};

const solveBFS = (level: LevelData): { path: [number, number][]; moves: string[] } | null => {
  const { gridSize, start, goals, obstacles, key, gate, wind, movingObstacles } = level;
  const numGoals = goals.length;
  const targetMask = (1 << numGoals) - 1;

  const queue: BFSState[] = [{
    x: start[0],
    y: start[1],
    collectedMask: 0,
    hasKey: false,
    steps: 0,
    path: [start],
    moves: []
  }];

  const visited = new Set<string>();
  const getFrogPos = (idx: number, stepNum: number) => {
    if (!movingObstacles || !movingObstacles[idx]) return null;
    return movingObstacles[idx].path[stepNum % movingObstacles[idx].path.length];
  };

  const period = (wind ? wind.interval : 1) * 24;
  const getVisitedKey = (x: number, y: number, mask: number, hasKey: boolean, stepNum: number) => {
    return `${x},${y},${mask},${hasKey},${stepNum % period}`;
  };

  visited.add(getVisitedKey(start[0], start[1], 0, false, 0));

  const DIRS = ["NW", "NE", "E", "SE", "SW", "W"];

  let maxIterations = 30000;
  let iter = 0;

  while (queue.length > 0 && iter < maxIterations) {
    iter++;
    const curr = queue.shift()!;

    if (curr.collectedMask === targetMask) {
      return { path: curr.path, moves: curr.moves };
    }

    for (const dirName of DIRS) {
      let nx = curr.x;
      let ny = curr.y;
      if (dirName === "W") nx -= 1;
      else if (dirName === "E") nx += 1;
      else if (dirName === "NW") {
        if (curr.y % 2 === 0) { nx -= 1; ny -= 1; }
        else { ny -= 1; }
      }
      else if (dirName === "NE") {
        if (curr.y % 2 === 0) { ny -= 1; }
        else { nx += 1; ny -= 1; }
      }
      else if (dirName === "SW") {
        if (curr.y % 2 === 0) { nx -= 1; ny += 1; }
        else { ny += 1; }
      }
      else if (dirName === "SE") {
        if (curr.y % 2 === 0) { ny += 1; }
        else { nx += 1; ny += 1; }
      }

      let nextSteps = curr.steps + 1;
      let nextHasKey = curr.hasKey;
      let nextCollectedMask = curr.collectedMask;

      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) continue;
      if (obstacles.some(([ox, oy]) => ox === nx && oy === ny)) continue;
      if (gate && gate[0] === nx && gate[1] === ny && !curr.hasKey) continue;

      let crashedFrog = false;
      if (movingObstacles) {
        for (let fIdx = 0; fIdx < movingObstacles.length; fIdx++) {
          const frogPos = getFrogPos(fIdx, nextSteps);
          if (frogPos && frogPos[0] === nx && frogPos[1] === ny) {
            crashedFrog = true;
            break;
          }
        }
      }
      if (crashedFrog) continue;

      if (wind && nextSteps % wind.interval === 0) {
        const windDir = wind.dir;
        if (windDir === "W") nx -= 1;
        else if (windDir === "E") nx += 1;
        else if (windDir === "NW") {
          if (ny % 2 === 0) { nx -= 1; ny -= 1; }
          else { ny -= 1; }
        }
        else if (windDir === "NE") {
          if (ny % 2 === 0) { ny -= 1; }
          else { nx += 1; ny -= 1; }
        }
        else if (windDir === "SW") {
          if (ny % 2 === 0) { nx -= 1; ny += 1; }
          else { ny += 1; }
        }
        else if (windDir === "SE") {
          if (ny % 2 === 0) { ny += 1; }
          else { nx += 1; ny += 1; }
        }

        if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) continue;
        if (obstacles.some(([ox, oy]) => ox === nx && oy === ny)) continue;
        if (gate && gate[0] === nx && gate[1] === ny && !curr.hasKey) continue;

        if (movingObstacles) {
          let pushedIntoFrog = false;
          for (let fIdx = 0; fIdx < movingObstacles.length; fIdx++) {
            const frogPos = getFrogPos(fIdx, nextSteps);
            if (frogPos && frogPos[0] === nx && frogPos[1] === ny) {
              pushedIntoFrog = true;
              break;
            }
          }
          if (pushedIntoFrog) continue;
        }
      }

      if (key && key[0] === nx && key[1] === ny) {
        nextHasKey = true;
      }

      goals.forEach((g, idx) => {
        if (g[0] === nx && g[1] === ny) {
          nextCollectedMask |= (1 << idx);
        }
      });

      const visKey = getVisitedKey(nx, ny, nextCollectedMask, nextHasKey, nextSteps);
      if (!visited.has(visKey)) {
        visited.add(visKey);
        queue.push({
          x: nx,
          y: ny,
          collectedMask: nextCollectedMask,
          hasKey: nextHasKey,
          steps: nextSteps,
          path: [...curr.path, [nx, ny]],
          moves: [...curr.moves, dirName]
        });
      }
    }
  }

  return null;
};

export default function BeeFlowerPath() {
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [playerPos, setPlayerPos] = useState<[number, number]>([0, 0]);
  const [steps, setSteps] = useState<number>(0);
  const [moveQueue, setMoveQueue] = useState<string[]>([]);
  const [executing, setExecuting] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    return localStorage.getItem("bee_sound") !== "off";
  });

  const [hasKey, setHasKey] = useState<boolean>(false);
  const [collectedMask, setCollectedMask] = useState<number>(0);
  const [collectedHoney, setCollectedHoney] = useState<[number, number][]>([]);
  const [energy, setEnergy] = useState<number>(100);
  const [obstacleStates, setObstacleStates] = useState<[number, number][]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  const [dayNightMode, setDayNightMode] = useState<"day" | "night">("day");
  const [inputMode, setInputMode] = useState<"arrows" | "draw_path">("arrows");
  const [activeTab, setActiveTab] = useState<"play" | "analytics">("play");
  const [message, setMessage] = useState<string>("Plan the bee's flight route, then press RUN!");
  const [messageColor, setMessageColor] = useState<string>("text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20");
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [levelCompletionStats, setLevelCompletionStats] = useState<any | null>(null);
  const [flashingPlayer, setFlashingPlayer] = useState<boolean>(false);
  const [showPathsOverlay, setShowPathsOverlay] = useState<boolean>(false);
  const [pathTrace, setPathTrace] = useState<[number, number][]>([]);

  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [hintLevel, setHintLevel] = useState<number>(0);

  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(0);
  const [statsHistory, setStatsHistory] = useState<any[]>([]);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [totalSuccesses, setTotalSuccesses] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);

  const levelInfo = LEVELS[currentLevel];
  const drawingRef = useRef<boolean>(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await gamesAPI.getProgress("bee_flower_path");
        const progress = res.data.progress_data;
        if (progress) {
          if (typeof progress.maxUnlockedLevel === "number") {
            setMaxUnlockedLevel(progress.maxUnlockedLevel);
            setCurrentLevel(Math.min(progress.maxUnlockedLevel, LEVELS.length - 1));
          }
          if (Array.isArray(progress.history)) {
            setStatsHistory(progress.history);
          }
          if (typeof progress.totalAttempts === "number") setTotalAttempts(progress.totalAttempts);
          if (typeof progress.totalSuccesses === "number") setTotalSuccesses(progress.totalSuccesses);
          if (typeof progress.totalTimeSpent === "number") setTotalTimeSpent(progress.totalTimeSpent);
        }
      } catch (err) {
        console.error("Failed to load bee progress:", err);
      }
    };
    loadProgress();
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    return () => {
      const activeDuration = Math.round((Date.now() - startTime) / 1000);
      if (activeDuration > 1) {
        gamesAPI.getProgress("bee_flower_path").then((res) => {
          const progress = res.data.progress_data || {};
          const currentTotal = progress.totalTimeSpent || 0;
          gamesAPI.saveProgress("bee_flower_path", {
            ...progress,
            totalTimeSpent: currentTotal + activeDuration
          });
        }).catch(() => {});
      }
    };
  }, [startTime]);

  const handleReset = useCallback((silent = false) => {
    if (!silent) playBeeSynth("reset", soundOn);
    setPlayerPos(levelInfo.start);
    setSteps(0);
    setExecuting(false);
    setGameWon(false);
    setLevelCompletionStats(null);
    setFlashingPlayer(false);
    setHasKey(false);
    setCollectedMask(0);
    setCollectedHoney([]);
    setEnergy(levelInfo.energy || 100);
    setHintLevel(0);
    setPathTrace([levelInfo.start]);
    setShowPathsOverlay(false);

    if (levelInfo.movingObstacles) {
      setObstacleStates(levelInfo.movingObstacles.map(mo => mo.start));
    } else {
      setObstacleStates([]);
    }

    setConsoleLogs([
      "🐝 Interpreter: Program loaded successfully.",
      `🐝 Initial Position set to [${levelInfo.start.join(", ")}].`,
      `🐝 Environment: ${levelInfo.gridSize}x${levelInfo.gridSize} Garden Plot.`
    ]);

    if (!silent) {
      setMessage("Grid ready! Draw a path or queue up command blocks.");
      setMessageColor("text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20");
    }
  }, [currentLevel, soundOn, levelInfo]);

  useEffect(() => {
    handleReset(true);
    setMoveQueue([]);
    setStartTime(Date.now());
  }, [currentLevel, handleReset]);

  // Scroll logs to end
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs]);

  const getFrogPos = (idx: number, stepNum: number) => {
    const level = LEVELS[currentLevel];
    if (!level.movingObstacles || !level.movingObstacles[idx]) return null;
    const path = level.movingObstacles[idx].path;
    return path[stepNum % path.length];
  };

  const toggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    localStorage.setItem("bee_sound", nextVal ? "on" : "off");
    playBeeSynth(nextVal ? "add" : "clear", true);
  };

  const addMove = useCallback((direction: string) => {
    if (gameWon || executing) return;
    if (moveQueue.length >= 35) {
      setMessage("Route is too long! Clear and optimize.");
      setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
      return;
    }
    setMoveQueue(prev => [...prev, direction]);
    playBeeSynth("add", soundOn);
    setMessage(`Added ${direction} block to the queue.`);
    setMessageColor("text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20");
  }, [moveQueue, executing, gameWon, soundOn]);

  const clearQueue = () => {
    if (executing || gameWon) return;
    setMoveQueue([]);
    playBeeSynth("clear", soundOn);
    setMessage("Queue cleared. Draw a path or tap command buttons.");
    setMessageColor("text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20");
    setPathTrace([levelInfo.start]);
    setConsoleLogs(prev => [...prev, "🧹 Command Queue cleared by player."]);
  };

  const optimalRoute = solveBFS(levelInfo);

  const handleUseHint = () => {
    if (gameWon || executing) return;
    setHintsUsed(prev => prev + 1);
    
    if (hintLevel === 0) {
      setHintLevel(1);
      setMessage("Hint 1: Safe adjacent directions are highlighted in glowing green cells!");
      setMessageColor("text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20");
      setConsoleLogs(prev => [...prev, "💡 Hint level 1 activated: nearby safe cells highlighted."]);
    } else if (hintLevel === 1) {
      setHintLevel(2);
      if (optimalRoute && optimalRoute.moves.length > 0) {
        const nextMove = optimalRoute.moves[0];
        setMessage(`Hint 2: Recommended optimal next move: Fly ${nextMove}!`);
      } else {
        setMessage("Hint 2: Try clearing the queue and starting fresh.");
      }
      setMessageColor("text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20");
      setConsoleLogs(prev => [...prev, `💡 Hint level 2 activated: Next optimal move is suggested.`]);
    } else {
      setHintLevel(3);
      setMessage("Hint 3: Full optimal BFS path highlighted in Green on the board!");
      setMessageColor("text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20");
      setConsoleLogs(prev => [...prev, "💡 Hint level 3 activated: full optimal flight path highlighted."]);
    }
    playBeeSynth("key", soundOn);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "play") return;
      const key = e.key.toLowerCase();
      if (key === "q") { e.preventDefault(); addMove("NW"); }
      if (key === "e") { e.preventDefault(); addMove("NE"); }
      if (key === "d") { e.preventDefault(); addMove("E"); }
      if (key === "x" || key === "c") { e.preventDefault(); addMove("SE"); }
      if (key === "z") { e.preventDefault(); addMove("SW"); }
      if (key === "a") { e.preventDefault(); addMove("W"); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addMove, activeTab]);

  const executeQueue = () => {
    if (gameWon || executing || moveQueue.length === 0) return;

    setExecuting(true);
    setTotalAttempts(p => p + 1);
    setMessage("Bee executing programmed flight commands...");
    setMessageColor("text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20");
    setConsoleLogs(prev => [...prev, "🚀 Executing flight instructions sequence..."]);

    let stepIdx = 0;
    let currentPos = [...levelInfo.start] as [number, number];
    let currentHasKey = false;
    let currentCollectedMask = 0;
    let currentHoneyList: [number, number][] = [];
    let currentEnergy = levelInfo.energy || 100;

    const pathWalked: [number, number][] = [currentPos];
    const intervalTime = levelInfo.rain ? 800 : 450;

    const runInterval = setInterval(() => {
      if (stepIdx >= moveQueue.length) {
        clearInterval(runInterval);
        setExecuting(false);

        const targetMask = (1 << levelInfo.goals.length) - 1;
        if (currentCollectedMask === targetMask) {
          handleSuccess(moveQueue.length, currentHoneyList.length, currentEnergy);
        } else {
          playBeeSynth("failure", soundOn);
          setMessage("Incorrect path! The bee did not reach all flowers. Retry!");
          setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
          setFlashingPlayer(true);
          setConsoleLogs(prev => [...prev, "❌ FAILURE: Destination not reached. Remaining flowers left."]);
          setTimeout(() => handleReset(true), 1200);
        }
        return;
      }

      const move = moveQueue[stepIdx];
      stepIdx++;
      setSteps(stepIdx);
      currentEnergy -= 1;
      setEnergy(currentEnergy);

      let [x, y] = currentPos;
      if (move === "W") x -= 1;
      else if (move === "E") x += 1;
      else if (move === "NW") {
        if (y % 2 === 0) { x -= 1; y -= 1; }
        else { y -= 1; }
      }
      else if (move === "NE") {
        if (y % 2 === 0) { y -= 1; }
        else { x += 1; y -= 1; }
      }
      else if (move === "SW") {
        if (y % 2 === 0) { x -= 1; y += 1; }
        else { y += 1; }
      }
      else if (move === "SE") {
        if (y % 2 === 0) { y += 1; }
        else { x += 1; y += 1; }
      }

      // 1. Boundary check
      if (x < 0 || x >= levelInfo.gridSize || y < 0 || y >= levelInfo.gridSize) {
        clearInterval(runInterval);
        playBeeSynth("failure", soundOn);
        setMessage(`Oops! Boundary crash going ${move}! Resetting...`);
        setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
        setFlashingPlayer(true);
        setExecuting(false);
        setConsoleLogs(prev => [...prev, `💥 CRASH: Flew out of bounds going ${move} to [${x}, ${y}].`]);
        setTimeout(() => handleReset(true), 1200);
        return;
      }

      // 2. Obstacle check
      const hitsObstacle = levelInfo.obstacles.some(([ox, oy]) => ox === x && oy === y);
      if (hitsObstacle) {
        clearInterval(runInterval);
        playBeeSynth("failure", soundOn);
        setMessage(`Ouch! Bee hit a garden obstacle! Resetting...`);
        setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
        setFlashingPlayer(true);
        setExecuting(false);
        setConsoleLogs(prev => [...prev, `💥 CRASH: Collided with obstacle at [${x}, ${y}].`]);
        setTimeout(() => handleReset(true), 1200);
        return;
      }

      // 3. Gate check
      const hitsGate = levelInfo.gate && levelInfo.gate[0] === x && levelInfo.gate[1] === y;
      if (hitsGate && !currentHasKey) {
        clearInterval(runInterval);
        playBeeSynth("failure", soundOn);
        setMessage(`Locked Gate! Key is required to pass.`);
        setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
        setFlashingPlayer(true);
        setExecuting(false);
        setConsoleLogs(prev => [...prev, `⛔ BLOCKED: Gate at [${x}, ${y}] is locked.`]);
        setTimeout(() => handleReset(true), 1200);
        return;
      }

      // 4. Moving obstacle check
      if (levelInfo.movingObstacles) {
        const nextFrogs = levelInfo.movingObstacles.map((_, fIdx) => getFrogPos(fIdx, stepIdx)!);
        setObstacleStates(nextFrogs);

        const hitsFrog = nextFrogs.some(([fx, fy]) => fx === x && fy === y);
        if (hitsFrog) {
          clearInterval(runInterval);
          playBeeSynth("failure", soundOn);
          setMessage(`Ribbit! Bee collided with a jumping frog! Resetting...`);
          setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
          setFlashingPlayer(true);
          setExecuting(false);
          setConsoleLogs(prev => [...prev, `💥 CRASH: Hit a frog obstacle at [${x}, ${y}].`]);
          setTimeout(() => handleReset(true), 1200);
          return;
        }
      }

      // 5. Energy check
      if (currentEnergy < 0) {
        clearInterval(runInterval);
        playBeeSynth("failure", soundOn);
        setMessage(`Oh no! The bee ran out of energy. Optimize the route!`);
        setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
        setFlashingPlayer(true);
        setExecuting(false);
        setConsoleLogs(prev => [...prev, "❌ FAILURE: Energy depleted."]);
        setTimeout(() => handleReset(true), 1200);
        return;
      }

      // Log normal step
      setConsoleLogs(prev => [...prev, `➡️ Step ${stepIdx}: Fly ${move} to [${x}, ${y}]. (Energy: ${currentEnergy})`]);

      // 6. Wind push
      if (levelInfo.wind && stepIdx % levelInfo.wind.interval === 0) {
        const windDir = levelInfo.wind.dir;
        if (windDir === "W") x -= 1;
        else if (windDir === "E") x += 1;
        else if (windDir === "NW") {
          if (y % 2 === 0) { x -= 1; y -= 1; }
          else { y -= 1; }
        }
        else if (windDir === "NE") {
          if (y % 2 === 0) { y -= 1; }
          else { x += 1; y -= 1; }
        }
        else if (windDir === "SW") {
          if (y % 2 === 0) { x -= 1; y += 1; }
          else { y += 1; }
        }
        else if (windDir === "SE") {
          if (y % 2 === 0) { y += 1; }
          else { x += 1; y += 1; }
        }

        setConsoleLogs(prev => [...prev, `💨 Wind gust pushes bee to [${x}, ${y}].`]);

        if (x < 0 || x >= levelInfo.gridSize || y < 0 || y >= levelInfo.gridSize) {
          clearInterval(runInterval);
          playBeeSynth("failure", soundOn);
          setMessage(`Wind blew the bee out of bounds! Resetting...`);
          setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
          setFlashingPlayer(true);
          setExecuting(false);
          setConsoleLogs(prev => [...prev, `💥 CRASH: Blown out of bounds to [${x}, ${y}].`]);
          setTimeout(() => handleReset(true), 1200);
          return;
        }

        const windHitsObs = levelInfo.obstacles.some(([ox, oy]) => ox === x && oy === y);
        if (windHitsObs) {
          clearInterval(runInterval);
          playBeeSynth("failure", soundOn);
          setMessage(`Wind blew the bee into an obstacle! Resetting...`);
          setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
          setFlashingPlayer(true);
          setExecuting(false);
          setConsoleLogs(prev => [...prev, `💥 CRASH: Wind pushed into obstacle at [${x}, ${y}].`]);
          setTimeout(() => handleReset(true), 1200);
          return;
        }

        const windHitsGate = levelInfo.gate && levelInfo.gate[0] === x && levelInfo.gate[1] === y;
        if (windHitsGate && !currentHasKey) {
          clearInterval(runInterval);
          playBeeSynth("failure", soundOn);
          setMessage(`Wind blew the bee into a locked gate! Resetting...`);
          setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
          setFlashingPlayer(true);
          setExecuting(false);
          setConsoleLogs(prev => [...prev, `⛔ BLOCKED: Wind pushed into locked gate at [${x}, ${y}].`]);
          setTimeout(() => handleReset(true), 1200);
          return;
        }

        if (levelInfo.movingObstacles) {
          const nextFrogs = levelInfo.movingObstacles.map((_, fIdx) => getFrogPos(fIdx, stepIdx)!);
          const windHitsFrog = nextFrogs.some(([fx, fy]) => fx === x && fy === y);
          if (windHitsFrog) {
            clearInterval(runInterval);
            playBeeSynth("failure", soundOn);
            setMessage(`Wind blew the bee directly into a frog! Resetting...`);
            setMessageColor("text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20");
            setFlashingPlayer(true);
            setExecuting(false);
            setConsoleLogs(prev => [...prev, `💥 CRASH: Wind pushed into a frog at [${x}, ${y}].`]);
            setTimeout(() => handleReset(true), 1200);
            return;
          }
        }
      }

      currentPos = [x, y];
      setPlayerPos(currentPos);
      pathWalked.push(currentPos);
      setPathTrace([...pathWalked]);
      playBeeSynth("buzz", soundOn);(currentPos);
      setPathTrace([...pathWalked]);
      playBeeSynth("buzz", soundOn);

      // Collect key
      if (levelInfo.key && levelInfo.key[0] === x && levelInfo.key[1] === y && !currentHasKey) {
        currentHasKey = true;
        setHasKey(true);
        playBeeSynth("key", soundOn);
        setConsoleLogs(prev => [...prev, "🔑 Golden Key collected! Locked gates are now unlocked."]);
      }

      // Collect honey
      const hasHoney = levelInfo.honey.some(([hx, hy]) => hx === x && hy === y);
      const alreadyCollected = currentHoneyList.some(([hx, hy]) => hx === x && hy === y);
      if (hasHoney && !alreadyCollected) {
        currentHoneyList.push([x, y]);
        setCollectedHoney([...currentHoneyList]);
        playBeeSynth("honey", soundOn);
        setConsoleLogs(prev => [...prev, `🍯 Honey jar collected at [${x}, ${y}]! (+20 Score)`]);
      }

      // Collect flowers
      levelInfo.goals.forEach((g, idx) => {
        if (g[0] === x && g[1] === y) {
          const isCollected = (currentCollectedMask & (1 << idx)) !== 0;
          if (!isCollected) {
            currentCollectedMask |= (1 << idx);
            setCollectedMask(currentCollectedMask);
            playBeeSynth("flower", soundOn);
            setConsoleLogs(prev => [...prev, `🌸 Flower goal collected at [${x}, ${y}]!`]);
          }
        }
      });

    }, intervalTime);
  };

  const handleSuccess = (userSteps: number, honeyJarsCollected: number, finalEnergy: number) => {
    setTotalSuccesses(p => p + 1);
    playBeeSynth("win", soundOn);
    setGameWon(true);
    setMessage("🎉 SUCCESS! You successfully guided the bee to all the flowers!");
    setMessageColor("text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/20");
    setConsoleLogs(prev => [...prev, "🎉 SUCCESS: Flight path completed. Program exited successfully."]);

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const optimalSteps = optimalRoute ? optimalRoute.path.length - 1 : userSteps;
    const extraSteps = Math.max(0, userSteps - optimalSteps);
    const efficiency = Math.round((optimalSteps / userSteps) * 100);
    const hintPenalty = hintsUsed * 15;
    const timeBonus = timeTaken < (levelInfo.gridSize * 4) ? 15 : 0;
    const honeyBonus = honeyJarsCollected * 20;
    const calculatedScore = Math.max(10, Math.min(150, 100 - (extraSteps * 5) - hintPenalty + timeBonus + honeyBonus));

    let starsAwarded = 1;
    if (efficiency >= 90 && hintsUsed === 0) starsAwarded = 3;
    else if (efficiency >= 65) starsAwarded = 2;

    const stats = {
      userSteps,
      optimalSteps,
      efficiency,
      score: calculatedScore,
      stars: starsAwarded,
      time: timeTaken,
      hints: hintsUsed,
      bonus: honeyBonus + timeBonus
    };
    setLevelCompletionStats(stats);

    const nextLevelIndex = Math.max(maxUnlockedLevel, currentLevel + 1);
    if (nextLevelIndex < LEVELS.length) {
      setMaxUnlockedLevel(nextLevelIndex);
    }

    const updatedHistory = [...statsHistory];
    const existingIndex = updatedHistory.findIndex(h => h.level === currentLevel);
    const levelRecord = {
      level: currentLevel,
      levelName: levelInfo.name,
      score: calculatedScore,
      steps: userSteps,
      optimalSteps,
      efficiency,
      hints: hintsUsed,
      stars: starsAwarded,
      time: timeTaken
    };

    if (existingIndex > -1) {
      if (calculatedScore > updatedHistory[existingIndex].score) {
        updatedHistory[existingIndex] = levelRecord;
      }
    } else {
      updatedHistory.push(levelRecord);
    }
    setStatsHistory(updatedHistory);

    const activeDuration = Math.round((Date.now() - startTime) / 1000);
    gamesAPI.saveProgress("bee_flower_path", {
      maxUnlockedLevel: nextLevelIndex,
      history: updatedHistory,
      totalAttempts: totalAttempts + 1,
      totalSuccesses: totalSuccesses + 1,
      totalTimeSpent: totalTimeSpent + activeDuration
    }).catch(err => console.error("Failed to save progress:", err));
  };

  const handleNextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      setCurrentLevel(prev => prev + 1);
      setMoveQueue([]);
      setHintsUsed(0);
      setGameWon(false);
    }
  };

  const handlePrevLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(prev => prev - 1);
      setMoveQueue([]);
      setHintsUsed(0);
      setGameWon(false);
    }
  };

  const getCellCoordsFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!target) return null;
    const cell = target.closest("[data-col]") as HTMLElement | null;
    if (!cell) return null;
    const col = parseInt(cell.getAttribute("data-col") || "");
    const row = parseInt(cell.getAttribute("data-row") || "");
    if (!isNaN(col) && !isNaN(row)) {
      if (col >= 0 && col < levelInfo.gridSize && row >= 0 && row < levelInfo.gridSize) {
        return [col, row] as [number, number];
      }
    }
    return null;
  };

  const handleGridMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameWon || executing || inputMode !== "draw_path") return;
    const coords = getCellCoordsFromEvent(e);
    if (!coords) return;

    if (coords[0] === playerPos[0] && coords[1] === playerPos[1]) {
      drawingRef.current = true;
      setMoveQueue([]);
      setPathTrace([coords]);
      setConsoleLogs(prev => [...prev, "✍️ Drawing Flight path manually on the board..."]);
    }
  };

  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingRef.current || inputMode !== "draw_path") return;
    const coords = getCellCoordsFromEvent(e);
    if (!coords) return;

    const lastCell = pathTrace[pathTrace.length - 1];
    if (lastCell[0] === coords[0] && lastCell[1] === coords[1]) return;

    const dx = coords[0] - lastCell[0];
    const dy = coords[1] - lastCell[1];
    const r = lastCell[1];
    const isAdjacent = 
      (dx === -1 && dy === 0) || // W
      (dx === 1 && dy === 0) ||  // E
      (dy === -1 && (r % 2 === 0 ? dx === -1 || dx === 0 : dx === 0 || dx === 1)) || // NW or NE
      (dy === 1 && (r % 2 === 0 ? dx === -1 || dx === 0 : dx === 0 || dx === 1)); // SW or SE

    if (isAdjacent) {
      const hitsObstacle = levelInfo.obstacles.some(([ox, oy]) => ox === coords[0] && oy === coords[1]);
      if (hitsObstacle) return;

      const hitsGate = levelInfo.gate && levelInfo.gate[0] === coords[0] && levelInfo.gate[1] === coords[1];
      let pathHasKey = hasKey;
      for (const cell of pathTrace) {
        if (levelInfo.key && levelInfo.key[0] === cell[0] && levelInfo.key[1] === cell[1]) {
          pathHasKey = true;
        }
      }
      if (hitsGate && !pathHasKey) return;

      const newPath = [...pathTrace, coords];
      setPathTrace(newPath);

      let direction = "";
      if (dy === 0) {
        if (dx === 1) direction = "E";
        else if (dx === -1) direction = "W";
      } else if (dy === -1) {
        if (r % 2 === 0) {
          if (dx === -1) direction = "NW";
          else if (dx === 0) direction = "NE";
        } else {
          if (dx === 0) direction = "NW";
          else if (dx === 1) direction = "NE";
        }
      } else if (dy === 1) {
        if (r % 2 === 0) {
          if (dx === -1) direction = "SW";
          else if (dx === 0) direction = "SE";
        } else {
          if (dx === 0) direction = "SW";
          else if (dx === 1) direction = "SE";
        }
      }

      setMoveQueue(prev => [...prev, direction]);
      playBeeSynth("add", soundOn);
    }
  };

  const handleGridMouseUp = () => {
    drawingRef.current = false;
  };

  const totalCompleted = statsHistory.length;
  const avgScore = totalCompleted > 0 ? Math.round(statsHistory.reduce((acc, h) => acc + h.score, 0) / totalCompleted) : 0;
  const avgEfficiency = totalCompleted > 0 ? Math.round(statsHistory.reduce((acc, h) => acc + h.efficiency, 0) / totalCompleted) : 0;

  const achievements = [
    { id: "master", name: "Path Master", desc: "Unlock all 10 garden levels", unlocked: maxUnlockedLevel >= 9, icon: "👑" },
    { id: "efficient", name: "Optimal flight", desc: "Complete any level with 100% path efficiency", unlocked: statsHistory.some(h => h.efficiency === 100), icon: "⚡" },
    { id: "no_hints", name: "No Hint Champion", desc: "Beat a Level 5+ without using hints", unlocked: statsHistory.some(h => h.level >= 4 && h.hints === 0), icon: "🧠" },
    { id: "collector", name: "Honey Collector", desc: "Collect a honey jar in any level", unlocked: collectedHoney.length > 0 || statsHistory.some(h => h.score > 100), icon: "🍯" },
    { id: "maze", name: "Maze Solver", desc: "Complete Level 4 and Level 10 maze structures", unlocked: statsHistory.some(h => h.level === 3) && statsHistory.some(h => h.level === 9), icon: "🗺️" }
  ];

  return (
    <div className={`flex-1 min-h-[calc(100vh-6rem)] rounded-3xl p-6 relative overflow-hidden font-sans border-b-[6px] border-slate-950 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col transition-all duration-1000 ${
      dayNightMode === "day"
        ? "bg-gradient-to-br from-green-50 via-amber-50 to-emerald-100"
        : "bg-gradient-to-br from-[#090b14] via-[#0d1122] to-[#170e2b]"
    }`}>
      {levelInfo.rain && (
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 overflow-hidden bg-black/5">
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-sky-400 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * -10}%`,
                width: `2px`,
                height: `${Math.random() * 14 + 6}px`,
                transform: "rotate(15deg)",
                animationDuration: `${Math.random() * 1.2 + 0.6}s`,
                animationIterationCount: "infinite"
              }}
            />
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 py-3 px-6 rounded-2xl shadow-sm relative z-25 mb-4">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Game Hub
          </Link>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850 gap-1">
            <button
              onClick={() => setActiveTab("play")}
              className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "play"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" /> Play Game
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "analytics"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Analytics Dashboard
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDayNightMode(prev => prev === "day" ? "night" : "day")}
            className="w-10 h-10 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-all"
            title="Toggle Day/Night"
          >
            {dayNightMode === "day" ? (
              <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
          <button
            onClick={toggleSound}
            className="w-10 h-10 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-all"
            title="Mute Sound"
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-amber-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {activeTab === "play" ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 relative z-10">
          {/* Left panel */}
          <div className="w-full lg:w-[320px] bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md rounded-3xl p-5 shrink-0 flex flex-col justify-between gap-5 shadow-lg relative">
            <div className="space-y-4">
              <div className="text-center">
                <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  🐝 Computational Sequencing
                </span>
                <h1 className="text-2xl font-black text-amber-500 dark:text-amber-400 tracking-tight mt-1">Bee Flower Path</h1>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800" />

              <div className="text-center space-y-1">
                <h2 className="text-md font-black text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
                  <span>{levelInfo.emoji}</span> Level {currentLevel + 1}: {levelInfo.name}
                </h2>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${levelInfo.diffColor}`}>
                  ● {levelInfo.diff}
                </span>
              </div>

              <div className="bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/20 rounded-2xl p-3 text-center min-h-[4rem] flex flex-col items-center justify-center">
                <p className="text-[11px] font-bold text-slate-650 dark:text-slate-300 leading-normal">{levelInfo.hint}</p>
                {levelInfo.energy && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-black text-rose-500">
                    <Zap className="w-3.5 h-3.5 fill-rose-500" /> Energy Limit: {energy} / {levelInfo.energy} moves
                  </div>
                )}
                {levelInfo.wind && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-black text-sky-600 dark:text-sky-450">
                    <Navigation className="w-3.5 h-3.5 fill-sky-600/10 rotate-90" /> {levelInfo.wind.label}
                  </div>
                )}
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850 gap-1 my-1">
                <button
                  onClick={() => setInputMode("arrows")}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    inputMode === "arrows"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  🎮 Command Blocks
                </button>
                <button
                  onClick={() => setInputMode("draw_path")}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    inputMode === "draw_path"
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  ✍️ Draw Path
                </button>
              </div>

              {/* Active list styled like golden honeycombs */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Flight Sequence</h3>
                  {moveQueue.length > 0 && (
                    <button
                      onClick={clearQueue}
                      disabled={executing || gameWon}
                      className="text-[10px] text-red-500 hover:text-red-400 font-bold disabled:opacity-40"
                    >
                      Clear Queue
                    </button>
                  )}
                </div>
                
                <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl p-3 min-h-[4.5rem] flex flex-wrap gap-1.5 items-center justify-center text-center">
                  {moveQueue.length === 0 ? (
                    <span className="text-slate-400 dark:text-slate-650 text-xs italic font-bold">
                      {inputMode === "draw_path" ? "[ drag grid from bee ]" : "[ queue is empty ]"}
                    </span>
                  ) : (
                    moveQueue.map((m, idx) => (
                      <span
                        key={idx}
                        className="w-8 h-8 bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[9px] shadow-sm shrink-0"
                        style={{
                          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                        }}
                      >
                        {m}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {inputMode === "arrows" && (
                <div className="space-y-2">
                  <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Directions</h3>
                  <div className="flex flex-col items-center gap-2">
                    {/* Top Row: NW, NE */}
                    <div className="flex gap-2">
                      <button
                        disabled={executing || gameWon}
                        onClick={() => addMove("NW")}
                        className="w-14 h-9 bg-amber-500 hover:bg-amber-600 disabled:opacity-45 text-slate-950 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm border-b-2 border-amber-700 hover:translate-y-0.5 active:translate-y-1 transition-all"
                        title="North-West (Q)"
                      >
                        <span>↖️ NW</span>
                      </button>
                      <button
                        disabled={executing || gameWon}
                        onClick={() => addMove("NE")}
                        className="w-14 h-9 bg-amber-500 hover:bg-amber-600 disabled:opacity-45 text-slate-950 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm border-b-2 border-amber-700 hover:translate-y-0.5 active:translate-y-1 transition-all"
                        title="North-East (E)"
                      >
                        <span>↗️ NE</span>
                      </button>
                    </div>
                    {/* Middle Row: W, E */}
                    <div className="flex gap-6">
                      <button
                        disabled={executing || gameWon}
                        onClick={() => addMove("W")}
                        className="w-14 h-9 bg-amber-500 hover:bg-amber-600 disabled:opacity-45 text-slate-950 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm border-b-2 border-amber-700 hover:translate-y-0.5 active:translate-y-1 transition-all"
                        title="West (A)"
                      >
                        <span>⬅️ W</span>
                      </button>
                      <button
                        disabled={executing || gameWon}
                        onClick={() => addMove("E")}
                        className="w-14 h-9 bg-amber-500 hover:bg-amber-600 disabled:opacity-45 text-slate-950 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm border-b-2 border-amber-700 hover:translate-y-0.5 active:translate-y-1 transition-all"
                        title="East (D)"
                      >
                        <span>➡️ E</span>
                      </button>
                    </div>
                    {/* Bottom Row: SW, SE */}
                    <div className="flex gap-2">
                      <button
                        disabled={executing || gameWon}
                        onClick={() => addMove("SW")}
                        className="w-14 h-9 bg-amber-500 hover:bg-amber-600 disabled:opacity-45 text-slate-950 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm border-b-2 border-amber-700 hover:translate-y-0.5 active:translate-y-1 transition-all"
                        title="South-West (Z)"
                      >
                        <span>↙️ SW</span>
                      </button>
                      <button
                        disabled={executing || gameWon}
                        onClick={() => addMove("SE")}
                        className="w-14 h-9 bg-amber-500 hover:bg-amber-600 disabled:opacity-45 text-slate-950 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm border-b-2 border-amber-700 hover:translate-y-0.5 active:translate-y-1 transition-all"
                        title="South-East (X)"
                      >
                        <span>↘️ SE</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={executeQueue}
                disabled={executing || gameWon || moveQueue.length === 0}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40 text-slate-950 text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 border-b-4 border-green-700 active:translate-y-0.5 active:border-b-0 transition-all shadow-sm"
              >
                <PlayCircle className="w-4 h-4" /> RUN FLIGHT PROGRAM
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleReset(false)}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-2.5 rounded-lg border-b-2 border-rose-700 active:translate-y-0.5 active:border-b-0 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Reset Bee
                </button>
                <button
                  onClick={handleUseHint}
                  disabled={gameWon || executing}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-[10px] font-bold py-2.5 rounded-lg border-b-2 border-indigo-700 active:translate-y-0.5 active:border-b-0 shadow-sm"
                >
                  <HelpCircle className="w-3.5 h-3.5 inline mr-1" /> Hint ({hintsUsed})
                </button>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 my-2" />

              <div className="flex gap-2">
                <button
                  onClick={handlePrevLevel}
                  disabled={currentLevel === 0}
                  className="flex-1 bg-slate-200 dark:bg-slate-850 hover:bg-slate-300 dark:hover:bg-slate-750 disabled:opacity-40 text-[10px] font-bold py-2 px-3 rounded-lg"
                >
                  ◀ Level {currentLevel}
                </button>
                <button
                  onClick={handleNextLevel}
                  disabled={currentLevel >= maxUnlockedLevel}
                  className="flex-1 bg-slate-200 dark:bg-slate-850 hover:bg-slate-300 dark:hover:bg-slate-750 disabled:opacity-40 text-[10px] font-bold py-2 px-3 rounded-lg"
                >
                  Level {currentLevel + 2} ▶
                </button>
              </div>
            </div>
          </div>

          {/* Right Area: Grid board */}
          <div className="flex-1 flex flex-col justify-between items-center relative py-2 gap-4 w-full">
            
            <div className="w-full flex justify-between items-center bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 py-2 px-5 rounded-xl shadow-sm relative text-xs">
              <div className="font-bold text-slate-500">
                Commands Queue: <span className="text-amber-600 dark:text-amber-400 font-extrabold">{moveQueue.length}</span> / 35
              </div>
              <div className="flex items-center gap-3">
                {levelInfo.rain && (
                  <span className="flex items-center gap-1 text-sky-500 font-bold animate-pulse">
                    <Droplets className="w-3.5 h-3.5" /> Rain (Slower Flight)
                  </span>
                )}
                {levelInfo.wind && (
                  <span className="flex items-center gap-1 text-teal-500 font-bold">
                    <Navigation className="w-3.5 h-3.5 rotate-90 animate-bounce" /> Wind Active
                  </span>
                )}
              </div>
            </div>

            {/* Flat garden grid canvas */}
            <div className="flex-1 flex items-center justify-center w-full min-h-[42vh] p-2 relative overflow-auto">
              <div
                onMouseDown={handleGridMouseDown}
                onMouseMove={handleGridMouseMove}
                onMouseUp={handleGridMouseUp}
                onMouseLeave={handleGridMouseUp}
                className="relative bg-white/40 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-md select-none p-4"
                style={{
                  width: `calc(var(--hex-size) * ${levelInfo.gridSize} + calc(var(--hex-size) * 0.6))`,
                  height: `calc(var(--hex-size) * 0.75 * ${levelInfo.gridSize - 1} + var(--hex-size) + calc(var(--hex-size) * 0.2))`,
                  "--hex-size": levelInfo.gridSize > 8 ? "42px" : "52px"
                } as React.CSSProperties}
              >
                {Array.from({ length: levelInfo.gridSize }).map((_, r) => {
                  return Array.from({ length: levelInfo.gridSize }).map((_, c) => {
                    const isStart = levelInfo.start[0] === c && levelInfo.start[1] === r;
                    const isGoalIdx = levelInfo.goals.findIndex(([gx, gy]) => gx === c && gy === r);
                    const isGoal = isGoalIdx !== -1;
                    const isGoalCollected = isGoal && (collectedMask & (1 << isGoalIdx)) !== 0;

                    const isPlayer = playerPos[0] === c && playerPos[1] === r;
                    const isObstacle = levelInfo.obstacles.some(([ox, oy]) => ox === c && oy === r);
                    const isKey = levelInfo.key && levelInfo.key[0] === c && levelInfo.key[1] === r;
                    const isGate = levelInfo.gate && levelInfo.gate[0] === c && levelInfo.gate[1] === r;
                    const isHoney = levelInfo.honey.some(([hx, hy]) => hx === c && hy === r);
                    const isHoneyCollected = isHoney && collectedHoney.some(([hx, hy]) => hx === c && hy === r);

                    const frogIndex = levelInfo.movingObstacles
                      ? obstacleStates.findIndex(([fx, fy]) => fx === c && fy === r)
                      : -1;

                    // Checker cells flat backgrounds
                    const isEven = (r + c) % 2 === 0;
                    let bgCell = isEven 
                      ? "bg-emerald-500/10 hover:bg-emerald-500/15" 
                      : "bg-emerald-500/5 hover:bg-emerald-500/10";

                    if (dayNightMode === "night") {
                      bgCell = isEven 
                        ? "bg-[#181d33] hover:bg-[#1b213b]" 
                        : "bg-[#0f1222] hover:bg-[#121629]";
                    }

                    const isPathTraced = pathTrace.some(([px, py]) => px === c && py === r);
                    const isOptimalPath = optimalRoute && optimalRoute.path.some(([px, py]) => px === c && py === r);
                    const isAdjacentSafe = hintLevel === 1 && !isObstacle && !isGate &&
                      isHexAdjacent(c, r, playerPos[0], playerPos[1]);

                    return (
                      <div
                        key={`${c}-${r}`}
                        data-col={c}
                        data-row={r}
                        className={`absolute flex items-center justify-center shadow-inner transition-all duration-300 ${bgCell} ${
                          isAdjacentSafe ? "ring-2 ring-emerald-400 bg-emerald-500/10 animate-pulse" : ""
                        } ${
                          isPathTraced ? "ring-2 ring-amber-400 bg-amber-400/10" : ""
                        }`}
                        style={{
                          width: "var(--hex-size)",
                          height: "var(--hex-size)",
                          left: `calc(var(--hex-size) * ${c} + ${r % 2 === 1 ? "calc(var(--hex-size) * 0.5)" : "0px"})`,
                          top: `calc(var(--hex-size) * 0.75 * ${r})`,
                          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                        }}
                      >
                        {/* Optimal Path Trace line (Green) */}
                        {((hintLevel === 3) || (showPathsOverlay && isOptimalPath)) && (
                          <div className="absolute inset-0 bg-emerald-400/10 rounded-xl border-2 border-emerald-400 animate-pulse pointer-events-none z-10" />
                        )}

                        {/* Path Traced overlay (Rose red dot for Route Diffs comparison, or Honey yellow dot for current trace) */}
                        {isPathTraced && !isPlayer && (
                          showPathsOverlay ? (
                            <div className="w-3.5 h-3.5 bg-rose-500 rounded-full border border-rose-700 shadow-md z-15 absolute pointer-events-none" />
                          ) : (
                            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full border border-amber-600 shadow-sm z-5 absolute pointer-events-none" />
                          )
                        )}

                        {/* Start cell tag */}
                        {isStart && !isPlayer && (
                          <span className="absolute bottom-1 text-[7px] font-black text-emerald-600 dark:text-emerald-400 scale-90">START</span>
                        )}

                        {/* Flower Goal */}
                        {isGoal && !isPlayer && (
                          <div className={`absolute -top-3 w-9 h-9 flex flex-col justify-center items-center select-none z-10 transition-transform ${isGoalCollected ? "scale-0 duration-500" : "animate-bounce"}`}>
                            <svg className="w-7 h-7 filter drop-shadow-sm" viewBox="0 0 32 32">
                              <path d="M16 16v12" stroke="#22c55e" strokeWidth="2.5" />
                              <circle cx="16" cy="16" r="6" fill="#f43f5e" />
                              <circle cx="12" cy="12" r="5.5" fill="#ec4899" />
                              <circle cx="20" cy="12" r="5.5" fill="#ec4899" />
                              <circle cx="12" cy="20" r="5.5" fill="#ec4899" />
                              <circle cx="20" cy="20" r="5.5" fill="#ec4899" />
                              <circle cx="16" cy="16" r="4" fill="#eab308" />
                            </svg>
                          </div>
                        )}

                        {/* Static Obstacle: Bush/Rock/Water */}
                        {isObstacle && (
                          <div className="absolute -top-2 w-9 h-9 flex flex-col justify-center items-center select-none z-10">
                            {currentLevel % 3 === 0 ? (
                              <span className="text-xl filter drop-shadow-sm">🌳</span>
                            ) : currentLevel % 3 === 1 ? (
                              <span className="text-xl filter drop-shadow-sm">🪨</span>
                            ) : (
                              <span className="text-xl filter drop-shadow-sm">🌊</span>
                            )}
                          </div>
                        )}

                        {/* Collectible key */}
                        {isKey && !hasKey && (
                          <div className="absolute -top-2 w-8 h-8 flex justify-center items-center z-10 animate-bounce">
                            <span className="text-lg filter drop-shadow">🔑</span>
                          </div>
                        )}

                        {/* Wall Gate */}
                        {isGate && (
                          <div className="absolute inset-1 flex flex-col justify-center items-center z-10 bg-slate-700/90 border border-slate-600 rounded-xl">
                            <span className="text-xs">{hasKey ? "🔓" : "🔒"}</span>
                          </div>
                        )}

                        {/* Honey collectibles */}
                        {isHoney && !isHoneyCollected && (
                          <div className="absolute -top-2 w-8 h-8 flex justify-center items-center select-none z-10 animate-pulse">
                            <span className="text-lg filter drop-shadow">🍯</span>
                          </div>
                        )}

                        {/* Jumping frog */}
                        {frogIndex !== -1 && (
                          <div className="absolute -top-3 w-8 h-8 flex items-center justify-center shadow-md z-15 animate-bounce">
                            <span className="text-md">🐸</span>
                          </div>
                        )}

                        {/* Bee Player avatar */}
                        {isPlayer && (
                          <div
                            className={`absolute -top-5 w-10 h-10 flex flex-col justify-center items-center z-20 ${
                              flashingPlayer ? "animate-pulse" : ""
                            }`}
                          >
                            <svg className="w-8 h-8 filter drop-shadow-sm" viewBox="0 0 32 32">
                              <ellipse cx="11" cy="10" rx="3.5" ry="6.5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" className="animate-pulse" transform="rotate(-20 11 10)" />
                              <ellipse cx="21" cy="10" rx="3.5" ry="6.5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" className="animate-pulse" transform="rotate(20 21 10)" />
                              <ellipse cx="16" cy="17" rx="8" ry="6" fill="#eab308" stroke="#713f12" strokeWidth="1.5" />
                              <path d="M12 13 C12 18 12 19 12 21 M16 11 C16 17 16 18 16 23 M20 13 C20 18 20 19 20 21" stroke="#27272a" strokeWidth="2.5" />
                              <circle cx="13.5" cy="15" r="1" fill="#09090b" />
                              <circle cx="18.5" cy="15" r="1" fill="#09090b" />
                              <polygon points="16,23 15,26 17,26" fill="#09090b" />
                            </svg>
                          </div>
                        )}

                      </div>
                    );
                  });
                })}
              </div>
            </div>

            {/* Beekeeper interpreter console terminal log widget */}
            <div className="w-full max-w-2xl bg-black border border-slate-800 rounded-xl p-3 shadow-md z-15">
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 mb-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Beehive Interpreter Console</span>
              </div>
              <div className="h-20 overflow-y-auto font-mono text-[10px] text-emerald-400 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed whitespace-pre-wrap">{log}</div>
                ))}
                <div ref={consoleEndRef} />
              </div>
            </div>

            <div
              className={`w-full max-w-2xl text-center py-2.5 px-4 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-2 ${messageColor}`}
            >
              {message.includes("Oops") || message.includes("Ouch") || message.includes("Locked") ? (
                <span className="text-red-500 text-lg">⚠️</span>
              ) : message.includes("🎉") ? (
                <Sparkles className="w-4 h-4 text-green-500 animate-pulse" />
              ) : null}
              <span>{message}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Analytics Page */
        <div className="flex-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl z-10 shadow-lg relative flex flex-col gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 justify-center md:justify-start">
              <Award className="w-7 h-7 text-amber-500" /> Educational Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track algorithms learning curve, sequence counts, and pathfinding optimization.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Levels Completed", value: `${totalCompleted} / 10`, desc: "Unlocking computational levels" },
              { label: "Success Rate", value: totalAttempts > 0 ? `${Math.round((totalSuccesses / totalAttempts) * 100)}%` : "0%", desc: "Attempts vs successes" },
              { label: "Average Score", value: `${avgScore} pts`, desc: "Performance standard" },
              { label: "Avg Path Efficiency", value: `${avgEfficiency}%`, desc: "Sequence optimization rating" }
            ].map((st, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{st.label}</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">{st.value}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-505 mt-1">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Path Optimization Curve (%)</h3>
              <div className="h-48">
                {statsHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsHistory}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="levelName" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                      <Bar dataKey="efficiency" fill="#f59e0b" name="Efficiency %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs italic text-slate-400">Play levels to generate optimization charts!</div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Score Progress</h3>
              <div className="h-48">
                {statsHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statsHistory}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="levelName" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="score" stroke="#10b981" name="Score" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs italic text-slate-400">Play levels to generate score graphs!</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Academic Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`border p-3 rounded-xl flex items-center gap-3 transition-all ${
                    ach.unlocked
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
                      : "bg-slate-100/50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-850 text-slate-400"
                  }`}
                >
                  <span className={`text-2xl ${ach.unlocked ? "grayscale-0" : "grayscale"}`}>{ach.icon}</span>
                  <div>
                    <h4 className="text-xs font-black">{ach.name}</h4>
                    <p className="text-[9px] mt-0.5 leading-snug">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Level Success Modal */}
      {gameWon && levelCompletionStats && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-400 p-6 md:p-8 rounded-3xl text-center max-w-xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <span className="text-6xl mb-3 block animate-bounce">🐝🍯🌸</span>
            
            <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              LEVEL COMPLETED!
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">Bee Flower Path Academy</p>

            <div className="flex justify-center gap-2 my-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <StarIcon
                  key={i}
                  active={i < levelCompletionStats.stars}
                  className="w-10 h-10"
                />
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 my-5 border border-slate-200/50 dark:border-slate-850 text-left space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">📊 Algorithm & Path Analysis</h3>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white dark:bg-slate-900 p-2.5 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Your path</p>
                  <p className="text-lg font-black text-rose-500 mt-1">{levelCompletionStats.userSteps} Steps</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Optimal Path</p>
                  <p className="text-lg font-black text-emerald-500 mt-1">{levelCompletionStats.optimalSteps} Steps</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Path Efficiency</p>
                  <p className="text-lg font-black text-amber-500 mt-1">{levelCompletionStats.efficiency}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Compare Paths on Grid:</span>
                <button
                  onClick={() => setShowPathsOverlay(p => !p)}
                  className={`text-[10px] font-bold py-1 px-3 rounded-lg border transition-all ${
                    showPathsOverlay
                      ? "bg-amber-500 text-slate-950 border-amber-600"
                      : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                  }`}
                >
                  {showPathsOverlay ? "Showing: Red vs Green" : "Show Route Diffs"}
                </button>
              </div>

              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                {levelCompletionStats.efficiency === 100 ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Amazing! You programmed the absolute shortest path using BFS. Efficiency 100%!
                  </span>
                ) : (
                  <span>
                    You used <strong className="text-rose-500">{levelCompletionStats.userSteps - levelCompletionStats.optimalSteps} extra</strong> command steps. Study the Green optimal path on the grid and try again to improve efficiency score!
                  </span>
                )}
              </p>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between text-xs font-bold text-slate-500">
                <span>Bonus Score: +{levelCompletionStats.bonus} pts</span>
                <span>Hints Penalty: -{levelCompletionStats.hints * 15} pts</span>
                <span className="text-slate-800 dark:text-slate-200 font-black">Level Score: {levelCompletionStats.score} / 150</span>
              </div>
            </div>

            <div className="flex gap-4">
              {currentLevel < LEVELS.length - 1 ? (
                <button
                  onClick={handleNextLevel}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-md py-3.5 rounded-xl border-b-4 border-amber-700 active:translate-y-0.5 active:border-b-0 shadow-sm"
                >
                  Next Level ➡️
                </button>
              ) : (
                <button
                  onClick={() => { setCurrentLevel(0); setMoveQueue([]); setGameWon(false); }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-slate-950 font-black text-md py-3.5 rounded-xl border-b-4 border-green-700 active:translate-y-0.5 active:border-b-0 shadow-sm"
                >
                  🔄 Play Again
                </button>
              )}
              <button
                onClick={() => { setGameWon(false); }}
                className="flex-1 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 font-bold text-sm py-3.5 rounded-xl border-b-4 border-slate-300 dark:border-slate-950"
              >
                Keep Viewing
              </button>
            </div>
          </div>
        </div>
      )}

      {showPathsOverlay && levelCompletionStats && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl z-40 text-xs font-medium space-y-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-black uppercase tracking-wider text-slate-500">Route Comparison</h4>
            <button onClick={() => setShowPathsOverlay(false)} className="text-[10px] text-red-500 font-bold">Close</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-rose-500 rounded" />
            <span>Red Path = Programmed route ({levelCompletionStats.userSteps} steps)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-emerald-500 rounded" />
            <span>Green Path = Optimal BFS path ({levelCompletionStats.optimalSteps} steps)</span>
          </div>
        </div>
      )}

      <style>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function StarIcon({ active, className }: { active: boolean; className?: string }) {
  return (
    <svg
      className={`${className} ${
        active ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-800 fill-none"
      } stroke-amber-500 stroke-[1.5] transition-all`}
      viewBox="0 0 24 24"
    >
      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
    </svg>
  );
}
