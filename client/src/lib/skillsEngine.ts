export interface SkillRating {
  id: string;
  name: string;
  score: number;
  level: string;
  color: string;
  bgLight: string;
  emoji: string;
  description: string;
  improvementTip: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  skill: string;
  stage: number;
  criteria: string;
  unlocked: boolean;
}

// Function to calculate skill ratings
export function evaluateSkills(allProgress: Record<string, any>): Record<string, number> {
  const bee = allProgress["bee_flower_path"] || {};
  const color = allProgress["colour_magic"] || {};
  const puppy = allProgress["feed_puppy"] || {};
  const train = allProgress["train_builder"] || {};
  const turtle = allProgress["turtle_path"] || {};
  const weather = allProgress["weather_adventure"] || {};
  const classifier = allProgress["image_classifier"] || {};
  const kaggle = allProgress["kaggle_arena"] || {};

  const beeLvl = bee.maxUnlockedLevel || 0;
  const colorLvl = color.maxUnlockedLevel || 0;
  const puppyLvl = puppy.maxUnlockedLevel || 0;
  const trainLvl = train.maxUnlockedLevel || 0;
  const turtleLvl = turtle.maxUnlockedLevel || 0;
  const weatherLvl = weather.level || 1;
  const classifierBestAcc = classifier.bestAccuracy || 0;
  const classifierTrained = classifier.modelsTrained || 0;
  const classifierRuns = classifier.experimentsRun || 0;
  const kaggleAttempts = kaggle.attempts || 0;

  // 1. SHARP (Precision & Accuracy)
  const sharpScores: number[] = [];
  if (train.stars > 0 && trainLvl > 0) {
    sharpScores.push(Math.min(100, (train.stars / (trainLvl * 3)) * 100));
  }
  if (colorLvl > 0) {
    sharpScores.push(Math.min(100, (colorLvl / 10) * 100));
  }
  if (puppyLvl > 0) {
    sharpScores.push(Math.min(100, (puppyLvl / 10) * 100));
  }
  if (bee.history && bee.history.length > 0) {
    const avgEff = bee.history.reduce((sum: number, r: any) => sum + (r.efficiency || 0), 0) / bee.history.length;
    sharpScores.push(avgEff);
  }
  if (classifierBestAcc > 0) {
    sharpScores.push(classifierBestAcc);
  }
  const sharp = sharpScores.length > 0 ? Math.round(sharpScores.reduce((a, b) => a + b, 0) / sharpScores.length) : 0;

  // 2. THINKER (Logic & Planning)
  const thinkerScores: number[] = [];
  if (turtleLvl > 0) {
    thinkerScores.push(Math.min(100, (turtleLvl / 5) * 100));
  }
  if (bee.history && bee.history.length > 0) {
    const avgEff = bee.history.reduce((sum: number, r: any) => sum + (r.efficiency || 0), 0) / bee.history.length;
    thinkerScores.push(avgEff);
  }
  if (trainLvl > 0) {
    thinkerScores.push(Math.min(100, (trainLvl / 8) * 100));
  }
  if (kaggleAttempts > 0) {
    thinkerScores.push(Math.min(100, kaggleAttempts * 20));
  }
  const thinker = thinkerScores.length > 0 ? Math.round(thinkerScores.reduce((a, b) => a + b, 0) / thinkerScores.length) : 0;

  // 3. PATIENT (Care & Deliberation)
  const patientScores: number[] = [];
  if (weather.plantsGrown !== undefined) {
    patientScores.push(Math.min(100, (weather.plantsGrown / 10) * 100));
  }
  if (bee.history && bee.history.length > 0) {
    const avgTime = bee.history.reduce((sum: number, r: any) => sum + (r.time || 0), 0) / bee.history.length;
    patientScores.push(Math.min(100, (avgTime / 30) * 100));
  }
  if (weather.relicsDiscovered !== undefined) {
    patientScores.push(Math.min(100, (weather.relicsDiscovered / 5) * 100));
  }
  if (classifierTrained > 0) {
    patientScores.push(Math.min(100, (classifierTrained / 8) * 100));
  }
  const patient = patientScores.length > 0 ? Math.round(patientScores.reduce((a, b) => a + b, 0) / patientScores.length) : 0;

  // 4. CONSISTENT (Steadiness & Work Ethic)
  const totalCompleted = beeLvl + colorLvl + puppyLvl + trainLvl + turtleLvl + (weatherLvl - 1) + (classifierTrained > 0 ? 5 : 0) + (kaggleAttempts > 0 ? 5 : 0);
  const maxPossible = 10 + 10 + 10 + 8 + 5 + 5 + 5 + 5;
  const consistent = Math.min(100, Math.round((totalCompleted / maxPossible) * 100));

  // 5. PERSEVERANCE (Resilience & Grit)
  const perseveranceScores: number[] = [];
  if (bee.totalAttempts > 0) {
    perseveranceScores.push(Math.min(100, (bee.totalAttempts / 10) * 100));
  }
  if (weather.animalsSaved !== undefined) {
    perseveranceScores.push(Math.min(100, (weather.animalsSaved / 6) * 100));
  }
  if (totalCompleted > 0) {
    perseveranceScores.push(Math.min(100, (totalCompleted / 10) * 100));
  }
  if (classifierRuns > 0) {
    perseveranceScores.push(Math.min(100, (classifierRuns / 5) * 100));
  }
  if (kaggleAttempts > 0) {
    perseveranceScores.push(Math.min(100, (kaggleAttempts / 5) * 100));
  }
  const perseverance = perseveranceScores.length > 0 ? Math.round(perseveranceScores.reduce((a, b) => a + b, 0) / perseveranceScores.length) : 0;

  return { sharp, thinker, patient, consistent, perseverance };
}

// Function to resolve the visual rating objects
export function getSkillRatings(scores: Record<string, number>): SkillRating[] {
  const getLvl = (s: number) => {
    if (s >= 80) return "Master Coach";
    if (s >= 50) return "Capable Specialist";
    if (s >= 20) return "Growing Explorer";
    return "Curious Rookie";
  };

  return [
    {
      id: "sharp",
      name: "Sharpness",
      score: scores.sharp || 0,
      level: getLvl(scores.sharp || 0),
      color: "text-red-500 border-red-500/20 bg-red-500/10",
      bgLight: "bg-red-50",
      emoji: "⚡",
      description: "How accurately and cleanly you solve puzzles with the fewest mistakes.",
      improvementTip: "To improve: Slow down and check your blueprints in Choo Choo Train or match dreaming puppy food without clicking toxic hazards!"
    },
    {
      id: "thinker",
      name: "Critical Thinking",
      score: scores.thinker || 0,
      level: getLvl(scores.thinker || 0),
      color: "text-indigo-500 border-indigo-500/20 bg-indigo-500/10",
      bgLight: "bg-indigo-50",
      emoji: "🧠",
      description: "Your ability to sequence instructions, build code commands, and optimize paths.",
      improvementTip: "To improve: Try to guide the bee in Bee Flower Path using the absolute minimum moves, matching the optimal BFS solver path!"
    },
    {
      id: "patient",
      name: "Patience",
      score: scores.patient || 0,
      level: getLvl(scores.patient || 0),
      color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
      bgLight: "bg-emerald-50",
      emoji: "🌱",
      description: "Deliberation, reading hints, looking up mixtures, and caring for greenhouse habitats.",
      improvementTip: "To improve: Nurture plants in Weather Adventure, read formula guides in Colour Magic, and check level hints when stuck."
    },
    {
      id: "consistent",
      name: "Consistency",
      score: scores.consistent || 0,
      level: getLvl(scores.consistent || 0),
      color: "text-amber-500 border-amber-500/20 bg-amber-500/10",
      bgLight: "bg-amber-50",
      emoji: "🛡️",
      description: "Your steady work ethic and completion of levels across all missions.",
      improvementTip: "To improve: Don't stop at level 1! Try starting and unlocking higher levels in every available game in the hub."
    },
    {
      id: "perseverance",
      name: "Perseverance",
      score: scores.perseverance || 0,
      level: getLvl(scores.perseverance || 0),
      color: "text-purple-500 border-purple-500/20 bg-purple-500/10",
      bgLight: "bg-purple-50",
      emoji: "🏆",
      description: "Your ability to persist through crashes, errors, and out-of-energy situations.",
      improvementTip: "To improve: Keep retrying levels after hitting rocks in Turtle Path or experiencing a flight crash in Bee Flower Path!"
    }
  ];
}

// Function to get badges list
export function getBadges(scores: Record<string, number>, allProgress: Record<string, any>): Badge[] {
  const bee = allProgress["bee_flower_path"] || {};
  const color = allProgress["colour_magic"] || {};
  const puppy = allProgress["feed_puppy"] || {};
  const train = allProgress["train_builder"] || {};
  const turtle = allProgress["turtle_path"] || {};
  const weather = allProgress["weather_adventure"] || {};
  const classifier = allProgress["image_classifier"] || {};
  const kaggle = allProgress["kaggle_arena"] || {};

  const beeLvl = bee.maxUnlockedLevel || 0;
  const colorLvl = color.maxUnlockedLevel || 0;
  const puppyLvl = puppy.maxUnlockedLevel || 0;
  const trainLvl = train.maxUnlockedLevel || 0;
  const turtleLvl = turtle.maxUnlockedLevel || 0;
  const weatherLvl = weather.level || 1;
  const classifierBestAcc = classifier.bestAccuracy || 0;
  const classifierTrained = classifier.modelsTrained || 0;
  const classifierRuns = classifier.experimentsRun || 0;
  const kaggleAttempts = kaggle.attempts || 0;

  const totalCompleted = beeLvl + colorLvl + puppyLvl + trainLvl + turtleLvl + (weatherLvl - 1) + (classifierTrained > 0 ? 5 : 0) + (kaggleAttempts > 0 ? 5 : 0);

  return [
    // --- SHARP BADGES ---
    {
      id: "sharp_1",
      name: "Quick Spark",
      description: "Started your journey to high precision.",
      icon: "✨",
      skill: "Sharpness",
      stage: 1,
      criteria: "Unlock Level 2 in Choo Choo Train or Colour Magic",
      unlocked: trainLvl >= 2 || colorLvl >= 2
    },
    {
      id: "sharp_2",
      name: "Precision Cadet",
      description: "Maintained great accuracy under difficulty.",
      icon: "⚡",
      skill: "Sharpness",
      stage: 2,
      criteria: "Score at least 15 stars in Choo Choo Train or reach Level 5 in Colour Magic",
      unlocked: (train.stars >= 15) || colorLvl >= 5
    },
    {
      id: "sharp_3",
      name: "Laser Focused",
      description: "Flawless color mixing and dog feeding.",
      icon: "💎",
      skill: "Sharpness",
      stage: 3,
      criteria: "Reach Level 8 in both Colour Magic and Feed the Puppy",
      unlocked: colorLvl >= 8 && puppyLvl >= 8
    },

    // --- THINKER BADGES ---
    {
      id: "thinker_1",
      name: "Puzzle Solver",
      description: "Mapped out your first logic commands.",
      icon: "🧩",
      skill: "Thinking",
      stage: 1,
      criteria: "Reach Level 2 in Turtle Path 3D or Bee Flower Path",
      unlocked: turtleLvl >= 2 || beeLvl >= 2
    },
    {
      id: "thinker_2",
      name: "Algorithm Architect",
      description: "Optimized plans with clean logic flows.",
      icon: "🧠",
      skill: "Thinking",
      stage: 2,
      criteria: "Reach Level 4 in Turtle Path 3D or solve 5 levels in Bee Flower Path",
      unlocked: turtleLvl >= 4 || (bee.history && bee.history.length >= 5)
    },
    {
      id: "thinker_3",
      name: "Grand Architect",
      description: "Ultimate code planning specialist.",
      icon: "🌌",
      skill: "Thinking",
      stage: 3,
      criteria: "Unlock level 5 in Turtle Path and reach level 8 in Bee Flower Path",
      unlocked: turtleLvl >= 5 && beeLvl >= 8
    },

    // --- PATIENT BADGES ---
    {
      id: "patient_1",
      name: "Green Thumb",
      description: "Successfully nurtured a seedling.",
      icon: "🌱",
      skill: "Patience",
      stage: 1,
      criteria: "Grow at least 1 plant in Weather Adventure",
      unlocked: (weather.plantsGrown && weather.plantsGrown >= 1) || false
    },
    {
      id: "patient_2",
      name: "Careful Planner",
      description: "Used hints and deliberated on paths.",
      icon: "🕰️",
      skill: "Patience",
      stage: 2,
      criteria: "Grow 5 plants in Weather Adventure or average 20+ seconds of flight planning",
      unlocked: (weather.plantsGrown && weather.plantsGrown >= 5) || (bee.history && bee.history.some((r: any) => r.time >= 20))
    },
    {
      id: "patient_3",
      name: "Zen Coder",
      description: "Extreme deliberation, care, and greenhouse nurture.",
      icon: "🧘",
      skill: "Patience",
      stage: 3,
      criteria: "Grow 10 plants in Weather Adventure and discover all 5 relics",
      unlocked: (weather.plantsGrown && weather.plantsGrown >= 10 && weather.relicsDiscovered >= 5) || false
    },

    // --- CONSISTENT BADGES ---
    {
      id: "consistent_1",
      name: "Steady Starter",
      description: "Familiarized yourself with different game rules.",
      icon: "🛡️",
      skill: "Consistency",
      stage: 1,
      criteria: "Unlock levels in at least 3 separate games",
      unlocked: [beeLvl > 0, colorLvl > 0, puppyLvl > 0, trainLvl > 0, turtleLvl > 0, weatherLvl > 1].filter(Boolean).length >= 3
    },
    {
      id: "consistent_2",
      name: "Daily Cruiser",
      description: "High progress breadth across the playground.",
      icon: "🎖️",
      skill: "Consistency",
      stage: 2,
      criteria: "Unlock levels in at least 5 separate games",
      unlocked: [beeLvl > 0, colorLvl > 0, puppyLvl > 0, trainLvl > 0, turtleLvl > 0, weatherLvl > 1].filter(Boolean).length >= 5
    },
    {
      id: "consistent_3",
      name: "Legendary Scholar",
      description: "Mastered levels in multiple disciplines.",
      icon: "👑",
      skill: "Consistency",
      stage: 3,
      criteria: "Unlock level 7+ in 4 separate games",
      unlocked: [beeLvl >= 7, colorLvl >= 7, puppyLvl >= 7, trainLvl >= 7, turtleLvl >= 5, weatherLvl >= 5].filter(Boolean).length >= 4
    },

    // --- PERSEVERANCE BADGES ---
    {
      id: "perseverance_1",
      name: "Determined Flyer",
      description: "Survived and completed levels after crashes.",
      icon: "💪",
      skill: "Perseverance",
      stage: 1,
      criteria: "Play 3 attempts in Bee Flower Path or rescue 1 weather animal",
      unlocked: (bee.totalAttempts && bee.totalAttempts >= 3) || (weather.animalsSaved && weather.animalsSaved >= 1)
    },
    {
      id: "perseverance_2",
      name: "Storm Chaser",
      description: "Passed levels with active wind and rain.",
      icon: "🌪️",
      skill: "Perseverance",
      stage: 2,
      criteria: "Complete Level 6 (Windy Meadow) or Level 9 (Jumping Frogs) in Bee Flower Path",
      unlocked: beeLvl >= 7 || beeLvl >= 10
    },
    {
      id: "perseverance_3",
      name: "Unstoppable",
      description: "Incredible resilience and high game completion.",
      icon: "🏆",
      skill: "Perseverance",
      stage: 3,
      criteria: "Complete 25 total levels across all games",
      unlocked: totalCompleted >= 25
    },
    // --- DEEP LEARNING BADGES ---
    {
      id: "dl_1",
      name: "Data Alchemist",
      description: "Trained your first deep learning models.",
      icon: "🧪",
      skill: "Patience",
      stage: 1,
      criteria: "Train at least 2 models in AI Learning Lab Pro",
      unlocked: classifierTrained >= 2
    },
    {
      id: "dl_2",
      name: "Model Validator",
      description: "Achieved excellent model generalizability.",
      icon: "📊",
      skill: "Sharpness",
      stage: 2,
      criteria: "Achieve at least 80% accuracy in AI Learning Lab Pro",
      unlocked: classifierBestAcc >= 80
    },
    {
      id: "dl_3",
      name: "Deep Guru",
      description: "Ran multiple thorough training experimentation cycles.",
      icon: "🔮",
      skill: "Perseverance",
      stage: 3,
      criteria: "Execute at least 4 training experiments in AI Learning Lab Pro",
      unlocked: classifierRuns >= 4
    },
    // --- KAGGLE ARENA BADGES ---
    {
      id: "kaggle_1",
      name: "Arena Competitor",
      description: "Made your first submission to the Kaggle Leaderboard.",
      icon: "🎯",
      skill: "Perseverance",
      stage: 1,
      criteria: "Submit at least 1 model in Kaggle Competition Arena",
      unlocked: kaggleAttempts >= 1
    },
    {
      id: "kaggle_2",
      name: "Tabular Wizard",
      description: "Optimized features and pipelines to beat the baseline.",
      icon: "🥇",
      skill: "Thinker",
      stage: 2,
      criteria: "Submit at least 3 model evaluations in Kaggle Competition Arena",
      unlocked: kaggleAttempts >= 3
    }
  ];
}
