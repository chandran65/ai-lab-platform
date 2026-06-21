import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Sparkles, RefreshCw, Trash2, BookOpen } from "lucide-react";
import { gamesAPI } from "../../services/api";

// Sound Generator
const playMixerSound = (type: "bubble" | "success" | "failure" | "click", muted: boolean) => {
  if (muted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case "click": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(700, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case "bubble": {
        // Soft bubbling/swirling sounds
        for (let i = 0; i < 6; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.12;
          osc.type = "sine";
          // Alternating frequencies for bubble feel
          const freq = [350, 420, 380, 470, 410, 450][i];
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.03, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.12);
        }
        break;
      }
      case "success": {
        [523, 659, 784, 880, 1047, 1319, 1568].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0.05, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.18);
        });
        break;
      }
      case "failure": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.3);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
    }
  } catch (err) {
    console.warn("Web Audio API blocked:", err);
  }
};

// Colors Palette definition
interface PaletteColor {
  hex: string;
  name: string;
}

const PALETTE: PaletteColor[] = [
  { hex: "#FF2020", name: "Red" },
  { hex: "#1A6EFF", name: "Blue" },
  { hex: "#FFE000", name: "Yellow" },
  { hex: "#FF0090", name: "Pink" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#000000", name: "Black" },
  { hex: "#FF6600", name: "Orange" },
  { hex: "#00BB44", name: "Green" },
];

interface MixRecipe {
  ingredients: string[];
  resultHex: string;
  resultName: string;
}

const MIX_RECIPES: MixRecipe[] = [
  // 2-color mixes
  { ingredients: ["#FF2020", "#FFE000"], resultHex: "#FF7700", resultName: "Orange" },
  { ingredients: ["#FF2020", "#1A6EFF"], resultHex: "#8833BB", resultName: "Purple" },
  { ingredients: ["#1A6EFF", "#FFE000"], resultHex: "#33AA44", resultName: "Green" },
  // 3-color mixes
  { ingredients: ["#FF2020", "#FFE000", "#FFFFFF"], resultHex: "#FFCC88", resultName: "Peach" },
  { ingredients: ["#FF2020", "#1A6EFF", "#FFFFFF"], resultHex: "#CC99EE", resultName: "Lavender" },
  { ingredients: ["#1A6EFF", "#FFE000", "#000000"], resultHex: "#336600", resultName: "Dark Green" },
  { ingredients: ["#FF2020", "#FFE000", "#000000"], resultHex: "#994400", resultName: "Dark Orange" },
  // 4-color mixes
  { ingredients: ["#FF2020", "#1A6EFF", "#FFE000", "#FFFFFF"], resultHex: "#BBDDCC", resultName: "Sage" },
  { ingredients: ["#FF2020", "#1A6EFF", "#FFE000", "#000000"], resultHex: "#334422", resultName: "Forest" },
  { ingredients: ["#FF2020", "#FF0090", "#1A6EFF", "#FFFFFF"], resultHex: "#EE88CC", resultName: "Rose" },
];

interface LevelSpec {
  targetHex: string;
  targetName: string;
  numSlots: number;
}

const LEVELS: LevelSpec[] = [
  { targetHex: "#FF7700", targetName: "Orange", numSlots: 2 },
  { targetHex: "#8833BB", targetName: "Purple", numSlots: 2 },
  { targetHex: "#33AA44", targetName: "Green", numSlots: 2 },
  { targetHex: "#FFCC88", targetName: "Peach", numSlots: 3 },
  { targetHex: "#CC99EE", targetName: "Lavender", numSlots: 3 },
  { targetHex: "#336600", targetName: "Dark Green", numSlots: 3 },
  { targetHex: "#994400", targetName: "Dark Orange", numSlots: 3 },
  { targetHex: "#BBDDCC", targetName: "Sage", numSlots: 4 },
  { targetHex: "#334422", targetName: "Forest", numSlots: 4 },
  { targetHex: "#EE88CC", targetName: "Rose", numSlots: 4 },
];

// Helper to determine text color on background
const getContrastColor = (hex: string) => {
  const hexClean = hex.replace("#", "");
  const r = parseInt(hexClean.substring(0, 2), 16);
  const g = parseInt(hexClean.substring(2, 4), 16);
  const b = parseInt(hexClean.substring(4, 6), 16);
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness > 155 ? "text-slate-900" : "text-white";
};

const getColorName = (hex: string) => {
  const palMatch = PALETTE.find((p) => p.hex === hex);
  if (palMatch) return palMatch.name;
  const mixMatch = MIX_RECIPES.find((m) => m.resultHex === hex);
  return mixMatch ? mixMatch.resultName : "Result";
};

export default function ColourMagic() {
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(0);
  const [selectedSlots, setSelectedSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [activeSlotIdx, setActiveSlotIdx] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    return localStorage.getItem("color_sound") !== "off";
  });

  // Mixer States
  const [mixing, setMixing] = useState<boolean>(false);
  const [mixerColor, setMixerColor] = useState<string>("#EBEBEB");
  const [mixerAnimationActive, setMixerAnimationActive] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  // Notifications
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "error" | "info" | "complete";
  } | null>(null);

  // 1. Fetch initial progress from backend
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await gamesAPI.getProgress("colour_magic");
        const progress = res.data.progress_data;
        if (progress && typeof progress.maxUnlockedLevel === "number") {
          setMaxUnlockedLevel(progress.maxUnlockedLevel);
          setCurrentLevel(progress.maxUnlockedLevel);
        }
      } catch (err) {
        console.error("Failed to load color magic progress:", err);
      }
    };
    loadProgress();
  }, []);

  // PostMessage to parent — used by AnimalPatternHunt wildlands wrapper
  useEffect(() => {
    if (typeof currentLevel === "number") {
      try {
        window.parent.postMessage({ type: "colour_magic_level", level: currentLevel }, "*");
      } catch {
        // Parent may not exist (standalone mode)
      }
    }
  }, [currentLevel]);

  // 2. Load the current level
  useEffect(() => {
    if (currentLevel >= LEVELS.length) return;
    const spec = LEVELS[currentLevel];
    // Reset selected slots
    const resetSlots = Array(spec.numSlots).fill(null);
    setSelectedSlots(resetSlots);
    setActiveSlotIdx(0);
    setMixerColor("#EBEBEB");
    setFeedback(null);
    setAttempts(0);
  }, [currentLevel]);

  // Click slot to activate it
  const handleSlotSelect = (idx: number) => {
    if (mixing) return;
    playMixerSound("click", !soundOn);
    setActiveSlotIdx(idx);
  };

  // Click palette color to assign
  const handlePaletteSelect = (hex: string) => {
    if (mixing) return;
    playMixerSound("click", !soundOn);

    const updated = [...selectedSlots];
    updated[activeSlotIdx] = hex;
    setSelectedSlots(updated);

    // Auto advance to next empty slot
    const nextEmpty = updated.findIndex((s) => s === null);
    if (nextEmpty !== -1) {
      setActiveSlotIdx(nextEmpty);
    }
    setFeedback(null);
  };

  // Clear slots
  const handleClear = () => {
    if (mixing) return;
    playMixerSound("click", !soundOn);
    const spec = LEVELS[currentLevel];
    setSelectedSlots(Array(spec.numSlots).fill(null));
    setActiveSlotIdx(0);
    setMixerColor("#EBEBEB");
    setFeedback(null);
  };

  // Click Mix button
  const handleMix = () => {
    if (mixing) return;
    const spec = LEVELS[currentLevel];

    // Check if slots are fully filled
    if (selectedSlots.some((s) => s === null)) {
      playMixerSound("failure", !soundOn);
      setFeedback({
        text: `⚠ Please fill all ${spec.numSlots} color slots first!`,
        type: "info",
      });
      return;
    }

    setMixing(true);
    setFeedback(null);
    setMixerAnimationActive(true);

    // Trigger looping bubble sound effect
    playMixerSound("bubble", !soundOn);
    const soundInterval = setInterval(() => {
      playMixerSound("bubble", !soundOn);
    }, 600);

    // Compute result color
    const ingredientSet = new Set(selectedSlots as string[]);
    // Find matching recipe
    const matched = MIX_RECIPES.find((recipe) => {
      if (recipe.ingredients.length !== selectedSlots.length) return false;
      return recipe.ingredients.every((ing) => ingredientSet.has(ing));
    });

    const finalHex = matched ? matched.resultHex : "#7A5C3A"; // brown mud if wrong

    setTimeout(() => {
      clearInterval(soundInterval);
      setMixerAnimationActive(false);
      setMixerColor(finalHex);

      // Evaluate result
      const target = spec.targetHex;
      if (finalHex === target) {
        // CORRECT
        playMixerSound("success", !soundOn);
        const formula = selectedSlots.map((s) => getColorName(s!)).join(" + ");
        
        const isFinal = currentLevel === LEVELS.length - 1;
        setFeedback({
          text: isFinal
            ? `🏆 AMAZING WORK! You completed all 10 Levels! You are a master color alchemist! 🌈`
            : `🎉 Correct! ${formula} mixes perfectly to make ${spec.targetName}!`,
          type: isFinal ? "complete" : "success",
        });

        // Trigger next level advance
        setTimeout(() => {
          const nextLvl = currentLevel + 1;
          const updatedMax = Math.max(maxUnlockedLevel, nextLvl);
          
          if (nextLvl < LEVELS.length) {
            setMaxUnlockedLevel(updatedMax);
            setCurrentLevel(nextLvl);

            // Save progress
            gamesAPI.saveProgress("colour_magic", {
              maxUnlockedLevel: updatedMax,
            }).catch((err) => console.error("Failed to save progress:", err));
          }
        }, 3200);

      } else {
        // INCORRECT
        playMixerSound("failure", !soundOn);
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);

        setFeedback({
          text: `😬 That didn't make ${spec.targetName}! Try again! ${
            nextAttempts >= 2 ? "💡 Tip: Check the mix formula guide at the bottom!" : ""
          }`,
          type: "error",
        });
        setMixing(false);
      }
    }, 2500); // 2.5 seconds swirl animation
  };

  const toggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    localStorage.setItem("color_sound", nextVal ? "off" : "on");
    playMixerSound("click", false);
  };

  const handlePrevLevel = () => {
    if (currentLevel > 0 && !mixing) {
      setCurrentLevel((prev) => prev - 1);
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < maxUnlockedLevel && currentLevel < LEVELS.length - 1 && !mixing) {
      setCurrentLevel((prev) => prev + 1);
    }
  };

  const spec = LEVELS[currentLevel] || LEVELS[0];

  return (
    <div className="flex-1 min-h-[calc(100vh-6rem)] rounded-3xl p-6 relative overflow-hidden font-sans border-b-[6px] border-slate-950 shadow-2xl text-slate-800 bg-[#FFF6E8] flex flex-col gap-6">
      
      {/* Sound Controller Option */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={toggleSound}
          className="p-2.5 bg-white/95 border-2 border-slate-900 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
          title="Toggle Sound Effects"
        >
          {soundOn ? (
            <Volume2 className="w-5 h-5 text-[#FF9F43]" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Top Controls Layout */}
      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
        
        {/* Left Control Card Panel */}
        <div className="w-full lg:w-[320px] bg-white border-4 border-slate-900 rounded-3xl p-6 shrink-0 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-orange-100 border border-orange-200 text-orange-600 uppercase tracking-widest">
                Mindora Physics Lab
              </span>
              <h1 className="text-3xl font-black text-slate-950 mt-2 tracking-tight">COLOUR MAGIC</h1>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">
                Level {currentLevel + 1} of 10
              </p>
            </div>

            <div className="border-t-2 border-dashed border-slate-200 my-4" />

            {/* Instruction description box */}
            <div className="bg-[#EEF6FF] border-2 border-indigo-200 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" /> Mission Goal
              </h3>
              <p className="text-xs font-bold text-slate-700 leading-normal">
                Pick exactly <span className="text-indigo-600 font-extrabold">{spec.numSlots} colors</span> from the palette that mix together to match the target color: <span className="font-extrabold text-slate-900">{spec.targetName}</span>!
              </p>
            </div>

            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed">
              💡 Tap any of the number slots to select it, then choose a color from the palette to fill it.
            </div>
          </div>

          {/* Level Nav Actions */}
          <div className="space-y-3 mt-6">
            <div className="flex gap-2">
              <button
                onClick={handlePrevLevel}
                disabled={currentLevel === 0 || mixing}
                className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                ◀ PREV
              </button>
              <button
                onClick={handleNextLevel}
                disabled={currentLevel >= maxUnlockedLevel || currentLevel >= LEVELS.length - 1 || mixing}
                className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                NEXT ▶
              </button>
            </div>
            <Link
              to="/dashboard"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> BACK TO HUB
            </Link>
          </div>
        </div>

        {/* Right Play board / Swirl screen */}
        <div className="flex-1 bg-white border-4 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between items-center min-h-[50vh] relative">
          
          {/* Header Status Bar */}
          <div className="w-full flex justify-between items-center border-b-2 border-slate-100 pb-3">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#FF9F43]" /> Palette Lab Mixer Machine
            </div>
            {feedback && (
              <div
                className={`text-xs font-black px-3 py-1 rounded-full border ${
                  feedback.type === "success" || feedback.type === "complete"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : feedback.type === "info"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {feedback.text}
              </div>
            )}
          </div>

          {/* Mixing board central view */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 w-full my-6">
            
            {/* Left side: Slots layout (e.g. S1 + S2 = ) */}
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
              {selectedSlots.map((slotHex, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-3xl font-extrabold text-slate-400 px-1">+</span>}
                  
                  <button
                    onClick={() => handleSlotSelect(idx)}
                    className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                      activeSlotIdx === idx
                        ? "border-[#FF9F43] scale-110 shadow-lg ring-4 ring-[#FF9F43]/20"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                    style={{ backgroundColor: slotHex || "#FFFFFF" }}
                  >
                    {slotHex ? (
                      <span className={`text-[10px] font-black uppercase text-center ${getContrastColor(slotHex)}`}>
                        {getColorName(slotHex)}
                      </span>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-slate-300">{idx + 1}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Tap Slot</span>
                      </>
                    )}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <span className="text-4xl font-black text-slate-400 px-2">=</span>

            {/* Middle Mixer Circle swirl bowl */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              
              {/* Spinner animation outline ring overlay */}
              <div
                className={`absolute inset-0 rounded-full border-4 border-dashed border-[#FF9F43] ${
                  mixerAnimationActive ? "animate-[spin_2s_linear_infinite]" : ""
                }`}
              />

              {/* Mixing Bowl background */}
              <div
                className="w-28 h-28 rounded-full border-4 border-slate-900 flex flex-col items-center justify-center shadow-inner relative z-10 transition-colors duration-1000 overflow-hidden"
                style={{ backgroundColor: mixerColor }}
              >
                {mixerAnimationActive ? (
                  // Swirling visual elements inside bowl during mixing
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-[#FFE000] border-t-transparent animate-spin" />
                    <div className="absolute w-14 h-14 rounded-full border-4 border-[#FF2020] border-b-transparent animate-[spin_1s_linear_infinite_reverse]" />
                    <span className="text-[10px] font-black text-[#FF9F43] tracking-widest animate-pulse uppercase absolute">Mixing</span>
                  </div>
                ) : mixerColor !== "#EBEBEB" ? (
                  <span className={`text-xs font-black uppercase text-center ${getContrastColor(mixerColor)}`}>
                    {matchedRecipeResultName(mixerColor)}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider text-center px-2">
                    Mixer Ready
                  </span>
                )}
              </div>
            </div>

            <span className="text-4xl font-black text-slate-400 px-2">→</span>

            {/* Right side: Target color "Make this" */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest animate-pulse">Make This!</span>
              <div
                className="w-24 h-24 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg relative"
                style={{ backgroundColor: spec.targetHex }}
              >
                <span className="absolute -top-3 right-0 text-3xl animate-bounce">🎨</span>
                <span className={`text-xs font-black uppercase text-center px-2 ${getContrastColor(spec.targetHex)}`}>
                  {spec.targetName}
                </span>
              </div>
            </div>
          </div>

          {/* Palette selector & Control Buttons */}
          <div className="w-full bg-[#F5FAFF] border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-4">
            
            {/* Colors Grid */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {PALETTE.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => handlePaletteSelect(color.hex)}
                  disabled={mixing}
                  className="w-16 h-16 rounded-2xl border-4 border-slate-900 flex flex-col items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:scale-95 transition-all text-xs font-extrabold relative group"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className={`text-[9px] font-black uppercase select-none ${getContrastColor(color.hex)}`}>
                    {color.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Core Action buttons (Mix / Clear) */}
            <div className="flex gap-3 w-full max-w-sm">
              <button
                onClick={handleMix}
                disabled={mixing || selectedSlots.some((s) => s === null)}
                className="flex-1 bg-[#FF9F43] hover:bg-[#E07820] disabled:opacity-40 text-white text-sm font-black py-3 px-6 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-4 h-4 ${mixing ? "animate-spin" : ""}`} /> {mixing ? "Mixing..." : "✨ MIX COLORS"}
              </button>
              <button
                onClick={handleClear}
                disabled={mixing}
                className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-black py-3 px-5 rounded-xl border-2 border-red-200 flex items-center justify-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> CLEAR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Always visible Colour Mix Guide list */}
      <div className="bg-[#EAF4FF] border-4 border-slate-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-2">
          📖 COLOUR MIXING FORMULA GUIDE — MATCH THE ACTIVE GOLD CARD!
        </h3>

        {/* Horizontal grid rows of mixing recipe cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {MIX_RECIPES.map((recipe) => {
            const isMatch = recipe.resultHex === spec.targetHex;
            return (
              <div
                key={recipe.resultHex}
                className={`bg-white rounded-xl p-3 border-2 flex items-center justify-between shadow-xs transition-all ${
                  isMatch
                    ? "border-amber-400 bg-amber-50/40 ring-4 ring-amber-400/20 scale-[1.01]"
                    : "border-slate-200"
                }`}
              >
                {/* Ingredients chain */}
                <div className="flex items-center gap-1 flex-wrap">
                  {recipe.ingredients.map((ingHex, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="text-xs font-black text-slate-400">+</span>}
                      <span
                        className={`w-6 h-6 rounded-full border border-slate-400 inline-block text-[6px] font-black uppercase text-center leading-5 select-none ${getContrastColor(ingHex)}`}
                        style={{ backgroundColor: ingHex }}
                      >
                        {getColorName(ingHex).slice(0, 1)}
                      </span>
                    </React.Fragment>
                  ))}
                </div>

                <span className="text-xs font-black text-slate-400 px-1">→</span>

                {/* Result Block */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="w-7 h-7 rounded-md border border-slate-900 inline-block"
                    style={{ backgroundColor: recipe.resultHex }}
                  />
                  <span className="text-xs font-extrabold text-slate-800">
                    {recipe.resultName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Quick helper to read completed result name for showing in bowl
  function matchedRecipeResultName(colorHex: string) {
    if (colorHex === "#7A5C3A") return "Mud Brown (Try Again!)";
    const recipe = MIX_RECIPES.find((r) => r.resultHex === colorHex);
    return recipe ? recipe.resultName : "Result";
  }
}
