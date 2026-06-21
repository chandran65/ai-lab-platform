/**
 * NovaBunnyCompanion — Interactive Nova Bunny companion for The Wildlands.
 * Reacts to world progress with different moods/animations,
 * gives hints about experiments, celebrates completions.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageCircle, HelpCircle, PartyPopper } from "lucide-react";

type Mood = "idle" | "happy" | "excited" | "thinking" | "celebrating";

interface NovaBunnyProps {
  name?: string;
  emoji?: string;
  progress?: number;
  completedCount?: number;
  totalCount?: number;
  onHint?: () => void;
  className?: string;
}

const HINTS = [
  "Try matching colors that look similar — they might mix perfectly! 🌈",
  "Red + Blue makes Purple. Can you find the right combination? 🎨",
  "Start with the bright colors — they're the easiest to mix! ✨",
  "Don't forget: Yellow and Blue make Green! 🌿",
  "The forest is counting on you! Keep experimenting! 🌳",
  "Every correct mix helps the Wildlands grow healthier! 🌻",
  "Try using the Color Mixing Guide at the bottom for help! 📖",
  "You're doing amazing! Each flower that blooms thanks you! 🌸",
];

const CELEBRATIONS = [
  "Amazing work! The forest is healing! 🌿✨",
  "You did it! I can feel the Wildlands getting stronger! 🌳💚",
  "Wonderful! The animals are returning thanks to you! 🐰🌟",
  "Brilliant! Another part of the forest restored! 🌺🎉",
];

function getNovaMood(progress: number): Mood {
  if (progress >= 100) return "celebrating";
  if (progress >= 60) return "happy";
  if (progress >= 30) return "excited";
  if (progress > 0) return "thinking";
  return "idle";
}

function getMoodEmoji(mood: Mood): string {
  switch (mood) {
    case "idle": return "🐰";
    case "happy": return "🐰✨";
    case "excited": return "🐰🌟";
    case "thinking": return "🐰💭";
    case "celebrating": return "🎉🐰🎉";
  }
}

function getMoodMessage(mood: Mood, progress: number, completedCount: number): string {
  if (mood === "celebrating") return "The Wildlands is fully restored! You're a true hero! 🏆";
  if (mood === "happy") return "The forest is thriving! Keep going, explorer! 🌿";
  if (mood === "excited") return `${completedCount} experiments done! The Wildlands is changing! 🌱`;
  if (progress > 0) return "Hmm, what color combination will work next? 🤔";
  return "Welcome to The Wildlands! Let's heal the forest together! 🌳";
}

export default function NovaBunnyCompanion({
  name = "Nova Bunny",
  emoji = "🐰",
  progress = 0,
  completedCount = 0,
  totalCount = 5,
  onHint,
  className = "",
}: NovaBunnyProps) {
  const [mood, setMood] = useState<Mood>("idle");
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState("");
  const [bounceKey, setBounceKey] = useState(0);
  const prevProgress = useRef(progress);

  // Update mood based on progress
  useEffect(() => {
    const newMood = getNovaMood(progress);
    setMood(newMood);

    // Trigger celebration on progress increase
    if (progress > prevProgress.current && progress > 0) {
      const randomCelebration = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
      setBubbleText(randomCelebration);
      setShowBubble(true);
      setBounceKey((k) => k + 1);
      setTimeout(() => setShowBubble(false), 4000);
    } else if (progress === 0 && mood !== "idle") {
      // Show welcome message
      setBubbleText("Welcome to The Wildlands! Let's heal the forest together! 🌳");
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 5000);
    }

    prevProgress.current = progress;
  }, [progress]);

  const handleHint = useCallback(() => {
    const randomHint = HINTS[Math.floor(Math.random() * HINTS.length)];
    setHintText(randomHint);
    setShowHint(true);
    setMood("thinking");
    setBounceKey((k) => k + 1);
    onHint?.();
    setTimeout(() => setShowHint(false), 6000);
  }, [onHint]);

  // Mood-driven animations
  const floatY = mood === "celebrating" ? [0, -12, 0] : mood === "excited" ? [0, -8, 0] : [0, -5, 0];
  const floatDuration = mood === "celebrating" ? 1.5 : mood === "excited" ? 2.5 : 3.5;
  const rotateRange = mood === "celebrating" ? [-8, 8] : mood === "happy" ? [-4, 4] : [-2, 2];

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Nova Bunny Avatar */}
      <motion.div
        key={bounceKey}
        className="relative"
        animate={{ y: floatY }}
        transition={{ repeat: Infinity, duration: floatDuration, ease: "easeInOut" }}
      >
        {/* Glow effect */}
        <motion.div
          className={`absolute -inset-4 rounded-full opacity-30 blur-xl ${
            mood === "celebrating" ? "bg-yellow-400" :
            mood === "happy" ? "bg-emerald-400" :
            mood === "excited" ? "bg-purple-400" :
            "bg-white/10"
          }`}
          animate={{
            scale: mood === "celebrating" ? [1, 1.2, 1] : 1,
            opacity: mood === "celebrating" ? [0.3, 0.5, 0.3] : 0.3,
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* Nova Bunny emoji with rotation */}
        <motion.div
          animate={{ rotate: rotateRange }}
          transition={{ repeat: Infinity, duration: floatDuration, ease: "easeInOut" }}
          className="relative z-10 text-6xl md:text-7xl cursor-pointer select-none"
          onClick={handleHint}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          {getMoodEmoji(mood)}
        </motion.div>

        {/* Sparkles around Nova */}
        {mood === "celebrating" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-2 -right-2"
          >
            <motion.span
              animate={{ rotate: 360, scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-2xl"
            >
              ✨
            </motion.span>
          </motion.div>
        )}
      </motion.div>

      {/* Name & Title */}
      <span className="text-xs font-black text-white mt-2 drop-shadow-md">
        {name}
      </span>
      <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">
        {mood === "celebrating" ? "Celebrating! 🎉" :
         mood === "happy" ? "Happy 🌿" :
         mood === "excited" ? "Excited ✨" :
         mood === "thinking" ? "Thinking 🤔" :
         "Guide"}
      </span>

      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-emerald-200 z-20"
          >
            {/* Speech bubble tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 border-r border-b border-emerald-200" />
            <div className="flex items-start gap-2">
              <PartyPopper className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] font-bold text-slate-700 leading-relaxed">
                {bubbleText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Bubble */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 bg-indigo-600/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-indigo-400/50 z-20"
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-600/95 rotate-45 border-t border-l border-indigo-400/50" />
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] font-bold text-white leading-relaxed">
                {hintText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleHint}
        className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30 transition-all text-[9px] font-bold"
      >
        <MessageCircle className="w-3 h-3" />
        Need a Hint?
      </motion.button>

      {/* Mood message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={mood}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-[10px] font-medium text-white/70 mt-1.5 text-center max-w-[200px] leading-relaxed"
        >
          {getMoodMessage(mood, progress, completedCount)}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
