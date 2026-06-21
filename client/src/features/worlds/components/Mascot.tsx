/**
 * Mascot — Animated mascot display with personality message.
 */

import { motion } from "framer-motion";

interface MascotProps {
  emoji: string;
  name: string;
  personality: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { emoji: "text-4xl", name: "text-sm", desc: "text-xs" },
  md: { emoji: "text-6xl", name: "text-lg", desc: "text-sm" },
  lg: { emoji: "text-8xl", name: "text-2xl", desc: "text-base" },
};

export default function Mascot({ emoji, name, personality, size = "md" }: MascotProps) {
  const s = sizeMap[size];
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 12 }}
      className="flex flex-col items-center gap-3 text-center"
    >
      <motion.span
        className={`${s.emoji} filter drop-shadow-lg inline-block`}
        animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        {emoji}
      </motion.span>
      <div>
        <h3 className={`${s.name} font-black text-slate-900`}>{name}</h3>
        <p className={`${s.desc} text-slate-500 font-medium italic max-w-xs`}>"{personality}"</p>
      </div>
    </motion.div>
  );
}
