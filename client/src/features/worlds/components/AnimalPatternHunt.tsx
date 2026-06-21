/**
 * AnimalPatternHunt — Themed game component for The Wildlands' first experiment.
 * Wraps the ColourMagic color mixing game in a Wildlands forest narrative.
 * Shows plant growth, animal companions, and Nova Bunny hints.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, TreePine, ArrowLeft, Star } from "lucide-react";

interface PatternHuntProps {
  onComplete?: (score: number) => void;
  worldSlug?: string;
}

const FOREST_STAGES = [
  { threshold: 0, title: "Dormant Forest", desc: "The forest needs your help to bloom!", trees: "🌲🌲", animals: "🦋" },
  { threshold: 25, title: "Sprouting Meadow", desc: "Flowers begin to bloom!", trees: "🌲🌿🌲", animals: "🦋🐝" },
  { threshold: 50, title: "Flourishing Woods", desc: "The forest is coming alive!", trees: "🌲🌿🌳🌿🌲", animals: "🦋🐝🐦" },
  { threshold: 75, title: "Vibrant Forest", desc: "Animals are returning home!", trees: "🌲🌳🌺🌳🌲", animals: "🦋🐝🐦🦊" },
  { threshold: 100, title: "Wildlands Restored", desc: "The Wildlands is fully healed!", trees: "🌳🌺🌳🌺🌳", animals: "🦋🐝🐦🦊🐰" },
];

const NOVA_HINTS = [
  { levelRange: [0, 2], text: "Try mixing Red + Blue to make Purple! 🎨" },
  { levelRange: [2, 4], text: "Yellow + Blue = Green! Can you find the combo? 🌿" },
  { levelRange: [4, 6], text: "Add White to make colors lighter and softer! ✨" },
  { levelRange: [6, 8], text: "Dark colors need Black to deepen them! 🌙" },
  { levelRange: [8, 10], text: "You're almost there! Mix 4 colors for the final challenge! 🏆" },
];

const ANIMAL_TRAIL = ["🦋", "🐝", "🐦", "🦊", "🐰"];

export default function AnimalPatternHunt({ onComplete, worldSlug }: PatternHuntProps) {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [forestStage, setForestStage] = useState(0);
  const [unlockedAnimals, setUnlockedAnimals] = useState<string[]>(["🦋"]);
  const [showNovaHint, setShowNovaHint] = useState(false);
  const [novaHintText, setNovaHintText] = useState("");

  // Listen for postMessage from ColourMagic game
  useEffect(() => {
    if (!gameStarted) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "colour_magic_level" && typeof e.data.level === "number") {
        setCurrentLevel(e.data.level + 1);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [gameStarted]);

  // Calculate forest stage from level
  useEffect(() => {
    if (!gameStarted) return;
    const pct = Math.min(100, (currentLevel / 10) * 100);
    const stageIdx = FOREST_STAGES.findLastIndex((s) => pct >= s.threshold);
    setForestStage(Math.max(0, stageIdx));

    // Unlock animals at each threshold
    const animalsToUnlock = ANIMAL_TRAIL.slice(0, Math.min(Math.floor(pct / 25) + 1, ANIMAL_TRAIL.length));
    setUnlockedAnimals(animalsToUnlock);
  }, [currentLevel, gameStarted]);

  // Show Nova hint when entering a new level group
  useEffect(() => {
    if (!gameStarted) return;
    const hint = NOVA_HINTS.find((h) => currentLevel >= h.levelRange[0] && currentLevel <= h.levelRange[1]);
    if (hint && currentLevel > 0) {
      setNovaHintText(hint.text);
      setShowNovaHint(true);
      const timer = setTimeout(() => setShowNovaHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, gameStarted]);

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
  }, []);

  const handleBackToWorld = useCallback(() => {
    if (worldSlug) {
      navigate(`/worlds/${worldSlug}`);
    } else {
      navigate("/worlds");
    }
  }, [worldSlug, navigate]);

  const forestStageData = FOREST_STAGES[forestStage];

  if (!gameStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 min-h-[calc(100vh-6rem)] rounded-3xl overflow-hidden relative"
      >
        {/* Wildlands background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-800/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-900/30 to-transparent" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] p-8 text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-8xl mb-6"
          >
            🦋
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-white/20 text-white border border-white/30 uppercase tracking-widest mb-4">
              <TreePine className="w-3.5 h-3.5" /> The Wildlands · Animal Pattern Hunt
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-4">
              Heal the Forest
            </h1>
            <p className="text-lg text-white/80 font-medium max-w-lg mx-auto mb-2">
              Mix colors to create the perfect patterns and restore the Wildlands!
            </p>
            <p className="text-sm text-emerald-200/60 font-medium mb-8 max-w-md mx-auto">
              Each correct mix helps plants grow, animals return, and the forest heal.
              Nova Bunny is here to guide you! 🐰
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-3xl">🌲</span>
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-3xl"
              >
                🦋
              </motion.span>
              <span className="text-3xl">🌿</span>
              {["🌸", "🐝", "🌳"].map((emoji, i) => (
                <motion.span
                  key={emoji}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                  className="text-3xl"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGame}
              className="px-10 py-4 rounded-2xl bg-white text-emerald-700 font-black text-lg shadow-2xl hover:bg-emerald-50 transition-all border-2 border-white/50"
            >
              🌟 Begin the Hunt!
            </motion.button>

            <button
              onClick={handleBackToWorld}
              className="block mt-4 mx-auto text-sm font-bold text-white/60 hover:text-white transition-colors"
            >
              ← Back to The Wildlands
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-6rem)] rounded-3xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-green-800/10 to-emerald-900/30 pointer-events-none" />

      {/* Nova Hint Toast */}
      <AnimatePresence>
        {showNovaHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-xl border border-indigo-400/50"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🐰</span>
              <p className="text-xs font-bold text-white">{novaHintText}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-emerald-900/40 to-transparent p-4 pointer-events-none">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToWorld}
            className="pointer-events-auto px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold border border-white/20 hover:bg-black/40 transition-all"
          >
            ← The Wildlands
          </button>
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20">
              <TreePine className="w-3 h-3 text-emerald-300" />
              <span className="text-[10px] font-bold text-white">{forestStageData.title}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20">
              <Star className="w-3 h-3 text-amber-300" />
              <span className="text-[10px] font-bold text-white">Level {currentLevel}/10</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2 ml-1">
          {unlockedAnimals.map((animal, i) => (
            <motion.span
              key={animal}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="text-lg"
            >
              {animal}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Forest growth sidebar */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-2">
        {FOREST_STAGES.map((stage, i) => (
          <motion.div
            key={stage.threshold}
            whileHover={{ scale: 1.1 }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs border-2 transition-all ${
              i <= forestStage
                ? "bg-white/20 border-emerald-300 shadow-lg"
                : "bg-black/20 border-white/10 opacity-40"
            }`}
            title={stage.title}
          >
            <span className="text-sm">{stage.trees[0]}</span>
          </motion.div>
        ))}
      </div>

      {/* ColourMagic game embedded in iframe with postMessage level tracking */}
      <iframe
        src="/games/color"
        className="w-full h-[calc(100vh-6rem)] border-0"
        title="Animal Pattern Hunt"
      />
    </div>
  );
}
