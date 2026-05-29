import { createContext, useContext, useState, useEffect } from "react";
import { playLevelUp } from "../utils/audio";

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  // Weather state (backwards compatible)
  const [weather, setWeather] = useState("sunny");

  // Core Progression stats (Shared Game State)
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(0);

  // Synced stats across mini-games for the global dashboard
  const [animalsSaved, setAnimalsSaved] = useState(0);
  const [plantsGrown, setPlantsGrown] = useState(0);
  const [relicsDiscovered, setRelicsDiscovered] = useState(0);
  const [legendariesFound, setLegendariesFound] = useState(0);

  // Load stats from localStorage on initial mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("weather-adventure-progress");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.xp !== undefined) setXp(parsed.xp);
        if (parsed.level !== undefined) setLevel(parsed.level);
        if (parsed.coins !== undefined) setCoins(parsed.coins);
        if (parsed.animalsSaved !== undefined) setAnimalsSaved(parsed.animalsSaved);
        if (parsed.plantsGrown !== undefined) setPlantsGrown(parsed.plantsGrown);
        if (parsed.relicsDiscovered !== undefined) setRelicsDiscovered(parsed.relicsDiscovered);
        if (parsed.legendariesFound !== undefined) setLegendariesFound(parsed.legendariesFound);
      }
    } catch (e) {
      console.warn("Failed to load local storage save:", e);
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    try {
      const dataToSave = {
        xp,
        level,
        coins,
        animalsSaved,
        plantsGrown,
        relicsDiscovered,
        legendariesFound,
      };
      localStorage.setItem("weather-adventure-progress", JSON.stringify(dataToSave));
    } catch (e) {
      console.warn("Failed to write to local storage save:", e);
    }
  }, [xp, level, coins, animalsSaved, plantsGrown, relicsDiscovered, legendariesFound]);

  // XP progression engine
  const xpNeeded = level * 100;

  const addXp = (amount) => {
    setXp((prevXp) => {
      let newXp = prevXp + amount;
      let currentLevel = level;
      let currentXpNeeded = currentLevel * 100;

      let leveledUp = false;
      while (newXp >= currentXpNeeded) {
        newXp -= currentXpNeeded;
        currentLevel += 1;
        currentXpNeeded = currentLevel * 100;
        leveledUp = true;
      }

      if (leveledUp) {
        setLevel(currentLevel);
        setTimeout(() => {
          playLevelUp();
          alert(`🌟 LEVEL UP! You reached Explorer Level ${currentLevel}! 🌟`);
        }, 100);
      }

      return newXp;
    });
  };

  // Get dynamic age-appropriate scientist rank based on explorer level
  const getGlobalRank = () => {
    if (level >= 10) return "👑 Climatological Deity";
    if (level >= 7) return "🛰️ Satellite Expert";
    if (level >= 5) return "⛈️ Storm Tracker Pro";
    if (level >= 3) return "🧪 Meteorological Analyst";
    if (level >= 2) return "🌍 Atmospheric Apprentice";
    return "🌱 Novice Explorer";
  };

  return (
    <WeatherContext.Provider
      value={{
        weather,
        setWeather,
        xp,
        setXp,
        level,
        setLevel,
        xpNeeded,
        addXp,
        coins,
        setCoins,
        animalsSaved,
        setAnimalsSaved,
        plantsGrown,
        setPlantsGrown,
        relicsDiscovered,
        setRelicsDiscovered,
        legendariesFound,
        setLegendariesFound,
        rankTitle: getGlobalRank(),
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext);