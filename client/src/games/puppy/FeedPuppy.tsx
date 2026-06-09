import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Star, HelpCircle } from "lucide-react";
import { gamesAPI } from "../../services/api";

// Web Audio API Sound Generator
const playPuppySound = (type: "eat" | "happy" | "sad" | "click" | "whistle", muted: boolean) => {
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
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case "eat": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
      case "happy": {
        // Play a cute rising scale of puppy yips
        [523, 659, 784, 1047].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.06, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.18);
        });
        break;
      }
      case "sad": {
        // Play a sliding sad tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.45);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.52);
        break;
      }
      case "whistle": {
        // Whistle tone to call puppy
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
        break;
      }
    }
  } catch (err) {
    console.warn("Audio Context playback failed:", err);
  }
};

// Data Pools
const DOG_FOODS = ["🍖", "🦴", "🍗", "🥕", "🍎", "🥚", "🧀", "🍓", "🫐", "🐟", "🍠", "🥦"];
const BAD_FOODS = ["🍫", "🍇", "🧅", "🥑", "🧃", "🍬", "☕", "🌰", "🍋", "🍷", "🧄", "🌿"];

interface LevelSpec {
  desired: string;
  goodExtrasCount: number;
  badCount: number;
}

const LEVEL_SPECS: LevelSpec[] = [
  { desired: "🦴", goodExtrasCount: 1, badCount: 1 }, // Lvl 1: 3 items
  { desired: "🍎", goodExtrasCount: 1, badCount: 2 }, // Lvl 2: 4 items
  { desired: "🥕", goodExtrasCount: 2, badCount: 2 }, // Lvl 3: 5 items
  { desired: "🍗", goodExtrasCount: 2, badCount: 3 }, // Lvl 4: 6 items
  { desired: "🥚", goodExtrasCount: 3, badCount: 3 }, // Lvl 5: 7 items
  { desired: "🧀", goodExtrasCount: 3, badCount: 4 }, // Lvl 6: 8 items
  { desired: "🍖", goodExtrasCount: 4, badCount: 4 }, // Lvl 7: 9 items
  { desired: "🐟", goodExtrasCount: 4, badCount: 5 }, // Lvl 8: 10 items
  { desired: "🍓", goodExtrasCount: 5, badCount: 5 }, // Lvl 9: 11 items
  { desired: "🫐", goodExtrasCount: 5, badCount: 6 }, // Lvl 10: 12 items
];

const HAPPY_MSGS = [
  "Yummy! That's exactly what I wanted! Thank you!",
  "Woof woof! You're my best friend!",
  "Mmm delicious! My tummy is happy now!",
  "That's my favorite! You're so smart!",
  "Great choice! That food is safe and good for me!",
];

const SAD_MSGS = [
  "Oh no! That food is bad for dogs! Check what I want!",
  "Woof... dogs can't eat that! It hurts my tummy!",
  "Oops! That is not safe for me. Can you find the right food?",
  "Ouch! That is harmful for dogs! Check my thought bubble!",
];

const WRONG_FOOD_MSGS = [
  "I like that too, but right now I want something else!",
  "Good food! But check my thought bubble — that's what I'm dreaming of!",
  "Yummy, but not what I dream about today. Try again!",
  "I don't want that right now — look at what I'm thinking of!",
];

const START_MSGS = [
  "I'm so hungry! Can you see what I'm dreaming of?",
  "Look at my thought bubble! Feed me that food!",
  "Woof! Not all food is safe for dogs. Find my favorite!",
  "My tummy is rumbling! Feed me what I'm thinking of!",
];

export default function FeedPuppy() {
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    return localStorage.getItem("puppy_sound") !== "off";
  });

  // Puppy States
  const [puppyEmotion, setPuppyEmotion] = useState<"idle" | "happy" | "sad" | "crying" | "excited">("idle");
  const [speechText, setSpeechText] = useState<string>("");
  const [animating, setAnimating] = useState<boolean>(false);
  const [feedbackPopup, setFeedbackPopup] = useState<{
    show: boolean;
    text: string;
    type: "success" | "warning" | "error" | "complete";
  } | null>(null);

  // Animation Refs
  const puppyContainerRef = useRef<HTMLDivElement>(null);
  const [slidingFood, setSlidingFood] = useState<{
    emoji: string;
    startX: number;
    startY: number;
    show: boolean;
  } | null>(null);

  // 1. Fetch initial progress from backend
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await gamesAPI.getProgress("feed_puppy");
        const progress = res.data.progress_data;
        if (progress && typeof progress.maxUnlockedLevel === "number") {
          setMaxUnlockedLevel(progress.maxUnlockedLevel);
          setCurrentLevel(progress.maxUnlockedLevel);
        }
      } catch (err) {
        console.error("Failed to load puppy progress:", err);
      }
    };
    loadProgress();
  }, []);

  // 2. Build items for the current level
  useEffect(() => {
    if (currentLevel >= LEVEL_SPECS.length) return;
    const spec = LEVEL_SPECS[currentLevel];
    
    // Seeded random-ish shuffle based on level index to make items reproducible per level
    const desired = spec.desired;
    const poolGood = DOG_FOODS.filter((f) => f !== desired);
    const poolBad = [...BAD_FOODS];

    // Pick random extra items
    const shuffledGood = [...poolGood].sort(() => 0.5 - Math.random());
    const shuffledBad = [...poolBad].sort(() => 0.5 - Math.random());

    const extras = shuffledGood.slice(0, Math.min(spec.goodExtrasCount, shuffledGood.length));
    const bads = shuffledBad.slice(0, Math.min(spec.badCount, shuffledBad.length));

    // Combine and shuffle
    const combined = [desired, ...extras, ...bads].sort(() => 0.5 - Math.random());
    setChoices(combined);

    // Initial greeting
    const greetMsg = START_MSGS[currentLevel % START_MSGS.length];
    setSpeechText(greetMsg);
    setPuppyEmotion("idle");
    setFeedbackPopup(null);
    setAnimating(false);
  }, [currentLevel]);

  // Feed food item click handler
  const handleFeed = (emoji: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (animating || feedbackPopup?.show) return;
    
    playPuppySound("click", !soundOn);
    setSpeechText("");
    setAnimating(true);

    // Get position coordinates for the slide animation
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    setSlidingFood({
      emoji,
      startX,
      startY,
      show: true,
    });

    // Animate item slide to the puppy character mouth (located near left side center)
    setTimeout(() => {
      // Complete slide
      setSlidingFood(null);
      playPuppySound("eat", !soundOn);
      evaluateChoice(emoji);
    }, 700);
  };

  // Evaluate the choice
  const evaluateChoice = (emoji: string) => {
    const spec = LEVEL_SPECS[currentLevel];
    if (emoji === spec.desired) {
      // CORRECT
      setPuppyEmotion("happy");
      playPuppySound("happy", !soundOn);
      const msg = HAPPY_MSGS[Math.floor(Math.random() * HAPPY_MSGS.length)];
      setSpeechText(msg);

      const isFinalLevel = currentLevel === LEVEL_SPECS.length - 1;
      
      setFeedbackPopup({
        show: true,
        text: isFinalLevel
          ? "🏆 Woohoo! You completed ALL 10 levels! You are a certified puppy care expert! 🐶❤️"
          : "🎉 " + msg,
        type: isFinalLevel ? "complete" : "success",
      });
    } else if (DOG_FOODS.includes(emoji)) {
      // SAFE but WRONG choice
      setPuppyEmotion("sad");
      playPuppySound("sad", !soundOn);
      const msg = WRONG_FOOD_MSGS[Math.floor(Math.random() * WRONG_FOOD_MSGS.length)];
      setSpeechText(msg);

      setFeedbackPopup({
        show: true,
        text: "🤔 " + msg,
        type: "warning",
      });
    } else {
      // HARMFUL / BAD food
      setPuppyEmotion("crying");
      playPuppySound("sad", !soundOn);
      const msg = SAD_MSGS[Math.floor(Math.random() * SAD_MSGS.length)];
      setSpeechText(msg);

      setFeedbackPopup({
        show: true,
        text: "😢 " + msg,
        type: "error",
      });
    }
  };

  // Close popup and advance / reset
  const handlePopupClose = () => {
    if (!feedbackPopup) return;
    
    setFeedbackPopup(null);
    setAnimating(false);

    if (feedbackPopup.type === "success") {
      const nextLvl = currentLevel + 1;
      const updatedMax = Math.max(maxUnlockedLevel, nextLvl);
      
      setMaxUnlockedLevel(updatedMax);
      setCurrentLevel(nextLvl);

      // Save progress to database
      gamesAPI.saveProgress("feed_puppy", {
        maxUnlockedLevel: updatedMax,
      }).catch((err) => console.error("Failed to save progress:", err));
    } else if (feedbackPopup.type === "complete") {
      // Stay on level 10 but show completed
      setPuppyEmotion("excited");
    } else {
      // Reset level choices
      setPuppyEmotion("idle");
      const greetMsg = START_MSGS[currentLevel % START_MSGS.length];
      setSpeechText(`Try again! ${greetMsg}`);
    }
  };

  const toggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    localStorage.setItem("puppy_sound", nextVal ? "on" : "off");
    playPuppySound(nextVal ? "whistle" : "click", false);
  };

  const handlePrevLevel = () => {
    if (currentLevel > 0 && !animating) {
      playPuppySound("whistle", !soundOn);
      setCurrentLevel((prev) => prev - 1);
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < maxUnlockedLevel && currentLevel < LEVEL_SPECS.length - 1 && !animating) {
      playPuppySound("whistle", !soundOn);
      setCurrentLevel((prev) => prev + 1);
    }
  };

  // Target food emoji
  const targetFood = LEVEL_SPECS[currentLevel]?.desired || "🦴";

  return (
    <div className="flex-1 min-h-[calc(100vh-6rem)] rounded-3xl p-6 relative overflow-hidden font-sans border-b-[6px] border-slate-950 shadow-2xl text-slate-800 bg-[#FFF9F0] flex flex-col lg:flex-row gap-6">
      
      {/* Sound Controller & Hub Button Header */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
        <button
          onClick={toggleSound}
          className="p-2.5 bg-white/95 border-2 border-slate-900 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
          title="Toggle Chime Sounds"
        >
          {soundOn ? (
            <Volume2 className="w-5 h-5 text-indigo-600" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Main Left Game Control Panel */}
      <div className="w-full lg:w-[320px] bg-white border-4 border-slate-900 rounded-3xl p-6 shrink-0 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative z-10">
        <div className="space-y-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-orange-100 border border-orange-200 text-orange-600 uppercase tracking-widest">
              Mindora Logical Matcher
            </span>
            <h1 className="text-3xl font-black text-slate-950 mt-2 tracking-tight">FEED PUPPY</h1>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">Level {currentLevel + 1} of 10</p>
          </div>

          <div className="border-t-2 border-dashed border-slate-200 my-4" />

          {/* Target Dream Bubble HUD */}
          <div className="bg-amber-50/50 border-4 border-slate-900 rounded-2xl p-4 text-center space-y-2 relative">
            <h3 className="text-xs font-black text-amber-700 uppercase tracking-wider">Puppy's Dream Food</h3>
            <div className="w-20 h-20 bg-white border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto shadow-md">
              <span className="text-5xl">{targetFood}</span>
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-1">Match this exact item to make the puppy happy!</p>
          </div>

          {/* Simple Guide Info */}
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs font-bold space-y-1">
            <p className="flex items-center gap-1.5">🟢 Dog Food = SAFE & YUMMY</p>
            <p className="flex items-center gap-1.5">❌ Chocolate/Grapes/Onions = HARMFUL</p>
          </div>
        </div>

        {/* Level Controls & Hub Jumps */}
        <div className="space-y-3 mt-6">
          <div className="flex gap-2">
            <button
              onClick={handlePrevLevel}
              disabled={currentLevel === 0 || animating}
              className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
            >
              ◀ PREV
            </button>
            <button
              onClick={handleNextLevel}
              disabled={currentLevel >= maxUnlockedLevel || currentLevel >= LEVEL_SPECS.length - 1 || animating}
              className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
            >
              NEXT ▶
            </button>
          </div>
          <Link
            to="/dashboard"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> BACK TO PLAYGROUND
          </Link>
        </div>
      </div>

      {/* Main Right Play Board */}
      <div className="flex-1 bg-gradient-to-br from-[#E3F2FD] to-[#E8F5E9] border-4 border-slate-900 rounded-3xl p-6 relative flex flex-col justify-between items-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        
        {/* Sky / Clouds Backdrop decoration */}
        <div className="absolute top-10 left-10 w-24 h-8 bg-white/80 rounded-full blur-[1px] pointer-events-none animate-pulse" />
        <div className="absolute top-24 right-16 w-32 h-10 bg-white/70 rounded-full blur-[1px] pointer-events-none" />

        {/* Level Banner */}
        <div className="w-full flex justify-between items-center bg-white/90 backdrop-blur-xs border-2 border-slate-900 py-3 px-6 rounded-2xl shadow-sm z-10">
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Mission: Feed the Hungry Puppy!
          </div>
          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Total items in pile: <span className="text-orange-600 font-extrabold">{choices.length}</span>
          </div>
        </div>

        {/* Center Scene: Puppy SVG Character & Food items */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 w-full relative z-10 my-6">
          
          {/* Animated Puppy Side */}
          <div ref={puppyContainerRef} className="flex flex-col items-center justify-center relative w-72 h-80 shrink-0">
            
            {/* Thought / Dream Bubble */}
            <div className="absolute -top-6 -right-6 bg-white border-4 border-slate-900 rounded-2xl p-2 shadow-md animate-bounce z-20 flex items-center justify-center">
              <span className="text-3xl">{targetFood}</span>
            </div>

            {/* Speech bubble */}
            {speechText && (
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 bg-white border-2 border-slate-900 rounded-xl p-3 shadow-md text-xs font-bold text-center text-slate-700 animate-in fade-in zoom-in duration-300">
                {speechText}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-900 rotate-45" />
              </div>
            )}

            {/* Interactive SVG Puppy */}
            <svg
              viewBox="0 0 200 200"
              className={`w-52 h-52 filter drop-shadow-md transition-all duration-300 ${
                puppyEmotion === "happy" || puppyEmotion === "excited"
                  ? "animate-bounce"
                  : puppyEmotion === "sad" || puppyEmotion === "crying"
                  ? "animate-pulse"
                  : ""
              }`}
            >
              {/* Ears */}
              <path
                d="M30,75 C15,90 10,130 25,145 C35,150 45,120 45,95 Z"
                fill="#8D6E63"
                stroke="#4E342E"
                strokeWidth="3"
                className={`transition-all duration-500 origin-top-right ${
                  puppyEmotion === "sad" || puppyEmotion === "crying" ? "rotate-12 translate-y-2" : ""
                }`}
              />
              <path
                d="M170,75 C185,90 190,130 175,145 C165,150 155,120 155,95 Z"
                fill="#8D6E63"
                stroke="#4E342E"
                strokeWidth="3"
                className={`transition-all duration-500 origin-top-left ${
                  puppyEmotion === "sad" || puppyEmotion === "crying" ? "-rotate-12 translate-y-2" : ""
                }`}
              />

              {/* Body */}
              <ellipse cx="100" cy="140" rx="60" ry="45" fill="#D7CCC8" stroke="#4E342E" strokeWidth="4" />
              
              {/* Back Tail */}
              <path
                d="M150,140 C175,130 190,100 180,85 C170,75 160,110 150,125 Z"
                fill="#8D6E63"
                stroke="#4E342E"
                strokeWidth="3"
                className={`origin-bottom-left transition-all ${
                  puppyEmotion === "happy" || puppyEmotion === "excited" ? "animate-[spin_0.8s_ease-in-out_infinite]" : ""
                }`}
              />

              {/* Head */}
              <ellipse cx="100" cy="95" rx="55" ry="45" fill="#E0F2F1" stroke="#4E342E" strokeWidth="4" className="fill-[#F5F5F5]" />

              {/* White face patch */}
              <ellipse cx="100" cy="100" rx="35" ry="25" fill="#FFFFFF" />

              {/* Eyes */}
              {puppyEmotion === "happy" || puppyEmotion === "excited" ? (
                <>
                  {/* Happy squint arcs */}
                  <path d="M70,95 Q80,85 90,95" fill="none" stroke="#4E342E" strokeWidth="4" strokeLinecap="round" />
                  <path d="M110,95 Q120,85 130,95" fill="none" stroke="#4E342E" strokeWidth="4" strokeLinecap="round" />
                </>
              ) : puppyEmotion === "crying" ? (
                <>
                  {/* Crying eyes */}
                  <circle cx="80" cy="95" r="5" fill="#263238" />
                  <circle cx="120" cy="95" r="5" fill="#263238" />
                  {/* Falling teardrops */}
                  <path d="M 80,105 C 75,115 85,115 80,105 Z" fill="#00E5FF" className="animate-bounce" />
                  <path d="M 120,105 C 115,115 125,115 120,105 Z" fill="#00E5FF" className="animate-bounce" />
                </>
              ) : (
                <>
                  {/* Normal open eyes */}
                  <circle cx="80" cy="93" r="8" fill="#4E342E" />
                  <circle cx="80" cy="91" r="3" fill="#FFFFFF" />
                  <circle cx="120" cy="93" r="8" fill="#4E342E" />
                  <circle cx="120" cy="91" r="3" fill="#FFFFFF" />
                </>
              )}

              {/* Eyebrows */}
              <path
                d="M 68,82 Q 80,77 88,85"
                fill="none"
                stroke="#4E342E"
                strokeWidth="3"
                className={`transition-all duration-300 ${
                  puppyEmotion === "sad" || puppyEmotion === "crying" ? "translate-y-1.5 rotate-6" : ""
                }`}
              />
              <path
                d="M 132,82 Q 120,77 112,85"
                fill="none"
                stroke="#4E342E"
                strokeWidth="3"
                className={`transition-all duration-300 ${
                  puppyEmotion === "sad" || puppyEmotion === "crying" ? "translate-y-1.5 -rotate-6" : ""
                }`}
              />

              {/* Snout & Nose */}
              <ellipse cx="100" cy="112" rx="15" ry="10" fill="#EEEEEE" stroke="#BDBDBD" strokeWidth="1" />
              <polygon points="92,108 108,108 100,117" fill="#3E2723" />

              {/* Mouth */}
              {puppyEmotion === "happy" || puppyEmotion === "excited" ? (
                <>
                  {/* Open smiling mouth */}
                  <path d="M88,118 Q100,132 112,118" fill="#FF8A80" stroke="#4E342E" strokeWidth="3" />
                  <ellipse cx="100" cy="123" rx="8" ry="4" fill="#FF3366" />
                </>
              ) : puppyEmotion === "sad" || puppyEmotion === "crying" ? (
                // Sad frown mouth
                <path d="M90,122 Q100,114 110,122" fill="none" stroke="#4E342E" strokeWidth="3" strokeLinecap="round" />
              ) : (
                // Idle small smile
                <path d="M92,118 Q100,125 108,118" fill="none" stroke="#4E342E" strokeWidth="3" strokeLinecap="round" />
              )}

              {/* Paws */}
              <ellipse cx="70" cy="178" rx="15" ry="12" fill="#8D6E63" stroke="#4E342E" strokeWidth="3" />
              <ellipse cx="130" cy="178" rx="15" ry="12" fill="#8D6E63" stroke="#4E342E" strokeWidth="3" />
            </svg>
          </div>

          {/* Grid of Food Items Pile */}
          <div className="flex-1 w-full max-w-lg bg-white/70 backdrop-blur-xs border-4 border-slate-900 rounded-3xl p-6 shadow-sm">
            <h3 className="text-center text-xs font-black text-slate-500 uppercase tracking-wider mb-4">
              Tap a food item to slide and feed it to the puppy!
            </h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {choices.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  disabled={animating || feedbackPopup?.show}
                  onClick={(e) => handleFeed(emoji, e)}
                  className="h-20 bg-white hover:bg-orange-50 disabled:opacity-40 rounded-2xl border-4 border-slate-900 flex flex-col items-center justify-center text-4xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 duration-150 relative group"
                >
                  {emoji}
                  {/* Subtle hover splash effect */}
                  <span className="absolute inset-0 bg-transparent group-hover:bg-slate-50/10 rounded-2xl transition-colors pointer-events-none" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sliding Food Item Overlay for Slide Animation */}
        {slidingFood?.show && (
          <div
            className="fixed text-5xl z-50 pointer-events-none transition-all duration-700 ease-out"
            style={{
              left: slidingFood.startX,
              top: slidingFood.startY,
              transform: "translate(-50%, -50%)",
              animation: "slide-mouth 0.7s forwards ease-in-out",
            }}
          >
            {slidingFood.emoji}
          </div>
        )}

        {/* Inline CSS for Slide Animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slide-mouth {
            to {
              left: 50vw;
              top: 50vh;
              opacity: 0.1;
              transform: translate(-50%, -50%) scale(0.2);
            }
          }
        ` }} />

        {/* Status Help Footer */}
        <div className="w-full text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> Can you unlock the legendary Level 10? Keep feeding safe foods to level up!
        </div>
      </div>

      {/* Global Interactive feedback popup modal */}
      {feedbackPopup?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border-4 border-slate-900 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transform scale-100 transition-all">
            
            {feedbackPopup.type === "success" && (
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-slate-900 text-4xl">
                🐶
              </div>
            )}
            {feedbackPopup.type === "warning" && (
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto border-4 border-slate-900 text-4xl">
                🤔
              </div>
            )}
            {feedbackPopup.type === "error" && (
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border-4 border-slate-900 text-4xl">
                🤢
              </div>
            )}
            {feedbackPopup.type === "complete" && (
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto border-4 border-slate-900 text-4xl animate-bounce">
                👑
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-950">
                {feedbackPopup.type === "success"
                  ? "Correct Match!"
                  : feedbackPopup.type === "warning"
                  ? "Wrong Food Choice"
                  : feedbackPopup.type === "error"
                  ? "Harmful Choice!"
                  : "Puppy Master Completed!"}
              </h2>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                {feedbackPopup.text}
              </p>
            </div>

            <button
              onClick={handlePopupClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 px-6 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-none transition-all"
            >
              {feedbackPopup.type === "success" ? "Go to Next Level" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
