import { useState, useEffect } from "react";
import { plants } from "../data/plantsData";
import { weatherFacts } from "../data/weatherFacts";
import AnimatedBackground from "../components/AnimatedBackground";
import { motion, AnimatePresence } from "framer-motion";
import { useWeather } from "../context/WeatherContext";
import { playClick, playSuccess, playCoin, playPlant } from "../utils/audio";

export default function GardenBuilder({ onBack }) {
  const {
    coins,
    setCoins,
    plantsGrown,
    setPlantsGrown,
    addXp,
  } = useWeather();

  const [selectedSeed, setSelectedSeed] = useState(null);
  const [weather, setWeather] = useState("");
  const [grownPlant, setGrownPlant] = useState(null);
  const [currentFact, setCurrentFact] = useState("");
  const [missionProgress, setMissionProgress] = useState(0);
  const [collection, setCollection] = useState([]);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState([]);
  const [ownedSeeds, setOwnedSeeds] = useState([]);

  useEffect(() => {
    const save = localStorage.getItem("garden-save");
    if (!save) return;
    const data = JSON.parse(save);
    setLevel(data.level || 1);
    setCollection(data.collection || []);
    setAchievements(data.achievements || []);
    setOwnedSeeds(data.ownedSeeds || []);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "garden-save",
      JSON.stringify({
        level,
        collection,
        achievements,
        ownedSeeds,
      })
    );
  }, [level, collection, achievements, ownedSeeds]);

  const shopSeeds = [
    {
      id: 101,
      name: "Sunflower Seed",
      icon: "🌻",
      price: 20,
    },
    {
      id: 102,
      name: "Mushroom Spawn",
      icon: "🍄",
      price: 50,
    },
    {
      id: 103,
      name: "Snow Blossom",
      icon: "❄️🌼",
      price: 100,
    },
  ];

  const missionGoals = {
    1: 3,
    2: 5,
    3: 8,
    4: 10,
    5: 15,
  };

  const missionGoal = missionGoals[level] || 20;

  const getSeedCount = (seedName) => {
    return ownedSeeds.filter((s) => s === seedName).length;
  };

  const hasSeed = (plantName) => {
    if (plantName === "Flower") return true; // Base seed is free & infinite
    const seedMap = {
      Sunflower: "Sunflower Seed",
      Mushroom: "Mushroom Spawn",
      "Snow Flower": "Snow Blossom",
    };
    const neededSeed = seedMap[plantName];
    return ownedSeeds.includes(neededSeed);
  };

  const plantSeed = (plant) => {
    playClick();
    if (!hasSeed(plant.name)) {
      alert(`⚠️ You don't own any seeds for ${plant.name}! Please purchase them from the Seed Shop first.`);
      return;
    }

    // Play planting sound
    playPlant();

    // Deduct seed from inventory if it's a paid seed
    const seedMap = {
      Sunflower: "Sunflower Seed",
      Mushroom: "Mushroom Spawn",
      "Snow Flower": "Snow Blossom",
    };
    const neededSeed = seedMap[plant.name];
    if (neededSeed) {
      const index = ownedSeeds.indexOf(neededSeed);
      if (index > -1) {
        const updated = [...ownedSeeds];
        updated.splice(index, 1);
        setOwnedSeeds(updated);
      }
    }

    setSelectedSeed(plant);
    setWeather("");
    setGrownPlant(null);
  };

  const applyWeather = (chosenWeather) => {
    playClick();
    setWeather(chosenWeather);

    if (selectedSeed && selectedSeed.weather === chosenWeather) {
      playSuccess();
      setGrownPlant(selectedSeed);
      setCurrentFact(weatherFacts[selectedSeed.name] || "This plant loves the current weather!");
    } else {
      setGrownPlant(null);
      setCurrentFact("");
    }
  };

  const harvestPlant = () => {
    if (!grownPlant) return;

    playCoin();
    addXp(15);
    setCoins(coins + grownPlant.reward);
    setPlantsGrown(plantsGrown + 1);

    if (!collection.includes(grownPlant.id)) {
      setCollection((prev) => [...prev, grownPlant.id]);
    }

    const newProgress = missionProgress + 1;
    if (missionProgress === 0) {
      unlockAchievement("🏆 First Harvest");
    }

    if (coins + grownPlant.reward >= 100) {
      unlockAchievement("💰 100 Coins Collected");
    }

    if (grownPlant.name === "Sunflower") {
      unlockAchievement("🌻 Sunflower Grower");
    }

    if (grownPlant.name === "Mushroom") {
      unlockAchievement("🍄 Mushroom Master");
    }

    if (newProgress >= missionGoal) {
      playSuccess();
      setCoins(coins + grownPlant.reward + 50);
      alert(`🎉 Level ${level} Complete! +50 Coins`);
      setLevel((prev) => prev + 1);
      setMissionProgress(0);
    } else {
      setMissionProgress(newProgress);
    }

    setSelectedSeed(null);
    setGrownPlant(null);
    setWeather("");
  };

  const getRank = () => {
    if (level >= 10) return "👑 Master Gardener";
    if (level >= 7) return "🌷 Flower Expert";
    if (level >= 4) return "🌿 Garden Helper";
    return "🌱 Seed Planter";
  };

  const buySeed = (seed) => {
    if (coins < seed.price) {
      alert("⚠️ Not enough coins to purchase this seed!");
      return;
    }

    playCoin();
    addXp(5);
    setCoins(coins - seed.price);
    setOwnedSeeds((prev) => [...prev, seed.name]);
  };

  const unlockAchievement = (achievement) => {
    setAchievements((prev) => {
      if (prev.includes(achievement)) return prev;
      return [...prev, achievement];
    });
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px",
        background: "linear-gradient(to bottom, #7dd3fc, #bae6fd, #e0f2fe, #f0fdf4)",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <AnimatedBackground />

      {/* Title Header */}
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "1100px",
          padding: "16px 30px",
          marginBottom: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>🌱</span>
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "hsl(var(--text-primary))" }}>Garden Builder</h1>
        </div>
        {onBack && (
          <button onClick={() => { playClick(); onBack(); }} className="btn-glass">
            ⬅ Back to Menu
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr 340px",
          gap: "24px",
          width: "100%",
          maxWidth: "1100px",
          zIndex: 1,
          alignItems: "stretch",
        }}
      >
        {/* Left Column: Inventory and achievements */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Seeds Inventory */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", borderBottom: "2px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
              🌰 Seeds Bag
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.03)", padding: "8px 12px", borderRadius: "10px" }}>
                <span>🌷 Free Flower Seed</span>
                <span style={{ fontWeight: "bold", color: "#16a34a" }}>∞</span>
              </div>
              {shopSeeds.map((seed) => (
                <div
                  key={seed.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: getSeedCount(seed.name) > 0 ? "rgba(34, 197, 94, 0.08)" : "rgba(0,0,0,0.03)",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: getSeedCount(seed.name) > 0 ? "1px dashed rgba(34, 197, 94, 0.4)" : "1px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <span>{seed.icon} {seed.name}</span>
                  <span style={{ fontWeight: "bold", color: getSeedCount(seed.name) > 0 ? "#16a34a" : "var(--text-secondary)" }}>
                    x{getSeedCount(seed.name)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Plant Collection */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", borderBottom: "2px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
              📖 Collection
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "6px 10px",
                    background: collection.includes(plant.id) ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.02)",
                    borderRadius: "10px",
                    fontSize: "0.95rem",
                  }}
                >
                  <span>{collection.includes(plant.id) ? plant.plant : "❓"}</span>
                  <span style={{ color: collection.includes(plant.id) ? "hsl(var(--text-primary))" : "var(--text-secondary)", fontStyle: collection.includes(plant.id) ? "normal" : "italic" }}>
                    {collection.includes(plant.id) ? plant.name : "Locked Flower"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", borderBottom: "2px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
              🏆 Achievements
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "190px", overflowY: "auto" }}>
              {achievements.length === 0 ? (
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic" }}>Grow crops to earn awards.</span>
              ) : (
                achievements.map((achievement, index) => (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={index}
                    style={{
                      background: "linear-gradient(135deg, #fef08a, #fde047)",
                      color: "#854d0e",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      boxShadow: "0 2px 6px rgba(254, 240, 138, 0.4)",
                    }}
                  >
                    {achievement}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Garden Bed & Active Plot */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Main Garden Plot Card */}
          <div
            className="glass-panel"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              minHeight: "450px",
            }}
          >
            {!selectedSeed ? (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 20px" }}>
                <span style={{ fontSize: "64px" }}>🏡</span>
                <h3 style={{ fontSize: "1.4rem", margin: "16px 0 8px 0" }}>Your Garden Plot is Empty</h3>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>Select a seed from the shop inventory and plant it above!</p>
              </div>
            ) : (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "1.3rem" }}>
                  Active Crop: <span style={{ color: "#2563eb" }}>{selectedSeed.name}</span>
                </h3>

                {/* Interactive Growth Visual Box */}
                <div
                  className="glass-card"
                  style={{
                    width: "220px",
                    height: "220px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "radial-gradient(circle at center, #f0fdf4, #dcfce7)",
                    boxShadow: "0 10px 40px rgba(74, 222, 128, 0.15)",
                    border: "4px solid rgba(255,255,255,0.8)",
                    position: "relative",
                    marginBottom: "20px",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {!weather ? (
                      <motion.div
                        key="seed"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        style={{ fontSize: "60px" }}
                      >
                        {selectedSeed.seed}
                      </motion.div>
                    ) : grownPlant ? (
                      <motion.div
                        key="plant"
                        initial={{ scale: 0.3, y: 30 }}
                        animate={{ scale: 1.1, y: 0 }}
                        transition={{ type: "spring", stiffness: 120 }}
                        style={{ fontSize: "110px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }}
                      >
                        {grownPlant.plant}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="withered"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: "center" }}
                      >
                        <div style={{ fontSize: "50px" }}>🍂</div>
                        <span style={{ fontSize: "0.85rem", color: "#b91c1c", fontWeight: "bold" }}>Needs {selectedSeed.weather}!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Weather Nurturing Controls */}
                {!grownPlant && (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: "0 0 12px 0", fontWeight: 500, color: "var(--text-secondary)" }}>
                      Nurture the crop! Apply the correct weather element:
                    </p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                      {[
                        { type: "sunny", icon: "☀️", color: "#fef08a", border: "#facc15" },
                        { type: "rainy", icon: "🌧️", color: "#bae6fd", border: "#38bdf8" },
                        { type: "snowy", icon: "❄️", color: "#e2e8f0", border: "#cbd5e1" },
                      ].map((el) => (
                        <motion.button
                          key={el.type}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => applyWeather(el.type)}
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            border: weather === el.type ? `3px solid ${el.border}` : "2px solid rgba(0,0,0,0.05)",
                            fontSize: "24px",
                            cursor: "pointer",
                            background: el.color,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                          }}
                        >
                          {el.icon}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Harvest interaction */}
                {grownPlant && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={harvestPlant}
                    className="btn-premium"
                    style={{
                      fontSize: "1.1rem",
                      padding: "14px 32px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)",
                      border: "none",
                    }}
                  >
                    Harvest 🧺 (+🪙{grownPlant.reward})
                  </motion.button>
                )}
              </div>
            )}

            {/* Fact Banner */}
            {currentFact && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: "20px",
                  background: "rgba(254, 243, 199, 0.7)",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  padding: "14px 20px",
                  borderRadius: "15px",
                  textAlign: "center",
                  maxWidth: "420px",
                }}
              >
                <h4 style={{ margin: "0 0 4px 0", color: "#b45309", fontSize: "0.95rem" }}>📚 Weather Fact</h4>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#78350f", lineHeight: "1.4" }}>{currentFact}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Dashboard and Shop */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* User Status Card */}
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#eab308", marginBottom: "8px" }}>
              🪙 {coins} Coins
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, margin: "4px 0" }}>🌟 Level {level}</div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "600" }}>{getRank()}</div>

            {/* Mission Progress */}
            <div style={{ marginTop: "16px", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "6px" }}>
                <span>🌱 Grow {missionGoal} Plants</span>
                <span>{missionProgress}/{missionGoal}</span>
              </div>
              <div style={{ height: "10px", background: "rgba(0,0,0,0.06)", borderRadius: "10px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(missionProgress / missionGoal) * 100}%`,
                    height: "100%",
                    background: "#22c55e",
                    borderRadius: "10px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Crops Catalog (Seeds Selector to Plant) */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.2rem", borderBottom: "2px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
              🌱 Plant Crops
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {plants.map((plant) => {
                const owned = hasSeed(plant.name);
                return (
                  <button
                    key={plant.id}
                    onClick={() => plantSeed(plant)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "14px",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      background: owned ? "white" : "rgba(0,0,0,0.03)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: owned ? "pointer" : "not-allowed",
                      boxShadow: owned ? "0 2px 6px rgba(0, 0, 0, 0.03)" : "none",
                      opacity: owned ? 1 : 0.6,
                      textAlign: "left",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "28px" }}>{plant.plant}</span>
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{plant.name}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Needs {plant.weather} skies</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold", color: "#16a34a", fontSize: "0.9rem" }}>+🪙{plant.reward}</div>
                      {!owned && <div style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: "600" }}>No Seed</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seed Shop section */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.2rem", borderBottom: "2px solid rgba(0,0,0,0.05)", paddingBottom: "8px" }}>
              🛒 Seed Shop
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {shopSeeds.map((seed) => {
                const canBuy = coins >= seed.price;
                return (
                  <div
                    key={seed.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "white",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      border: "1px solid rgba(0,0,0,0.04)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "24px" }}>{seed.icon}</span>
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{seed.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "#eab308", fontWeight: "600" }}>🪙 {seed.price}</div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={canBuy ? { scale: 1.08 } : {}}
                      whileTap={canBuy ? { scale: 0.95 } : {}}
                      onClick={() => buySeed(seed)}
                      disabled={!canBuy}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                        cursor: canBuy ? "pointer" : "not-allowed",
                        background: canBuy ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#e2e8f0",
                        color: canBuy ? "white" : "#94a3b8",
                      }}
                    >
                      Buy 🛒
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}