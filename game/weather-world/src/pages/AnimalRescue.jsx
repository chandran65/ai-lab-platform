import { useState } from "react";
import { animals } from "../data/animalRescueData";
import { motion, AnimatePresence } from "framer-motion";
import { useWeather } from "../context/WeatherContext";
import { playClick, playSuccess, playFailure } from "../utils/audio";

export default function AnimalRescue({ onBack }) {
  const {
    animalsSaved,
    setAnimalsSaved,
    addXp,
  } = useWeather();

  const [currentAnimal, setCurrentAnimal] = useState(
    animals[Math.floor(Math.random() * animals.length)]
  );
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" or "error"

  const getBadge = () => {
    if (score >= 20) return "🏆 Animal Hero";
    if (score >= 10) return "🥇 Animal Protector";
    if (score >= 5) return "🥈 Animal Helper";
    return "🥉 Beginner Ranger";
  };

  const availableAnimals = score < 5 ? animals.slice(0, 5) : animals;

  const weatherButtons = [
    { id: "sunny", emoji: "☀️", color: "#fef08a", border: "#facc15" },
    { id: "rainy", emoji: "🌧️", color: "#bae6fd", border: "#38bdf8" },
    { id: "snowy", emoji: "❄️", color: "#e2e8f0", border: "#cbd5e1" },
    { id: "windy", emoji: "🍃", color: "#d1fae5", border: "#34d399" },
    { id: "night", emoji: "🌙", color: "#c084fc", border: "#a855f7" },
  ];

  const checkAnswer = (weather) => {
    if (weather === currentAnimal.correct) {
      playSuccess();
      addXp(10);
      setScore((prev) => prev + 1);
      setAnimalsSaved(animalsSaved + 1);
      setStatus("🎉 Outstanding! You chose the correct atmosphere and saved the animal!");
      setStatusType("success");

      setTimeout(() => {
        const nextIdx = Math.floor(Math.random() * availableAnimals.length);
        setCurrentAnimal(availableAnimals[nextIdx]);
        setStatus("");
        setStatusType("");
      }, 2500);
    } else {
      playFailure();
      setStatus("😢 The climate isn't quite right for this creature. Try another option!");
      setStatusType("error");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #bae6fd, #e0f2fe, #dcfce7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px",
        position: "relative",
      }}
    >
      {/* Title Header */}
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "850px",
          padding: "16px 30px",
          marginBottom: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "36px" }}>🐾</span>
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "hsl(var(--text-primary))" }}>Animal Rescue</h1>
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
          gridTemplateColumns: "280px 1fr",
          gap: "24px",
          width: "100%",
          maxWidth: "850px",
          zIndex: 1,
        }}
      >
        {/* Left Stats Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Rescue Stats */}
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "var(--text-secondary)" }}>Ranger Stats</h3>
            
            <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "#2563eb", marginBottom: "4px" }}>
              {score}
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Animals Saved (Session)
            </div>

            {/* Medallion Display */}
            <div
              style={{
                background: "linear-gradient(135deg, #fef08a, #fde047)",
                border: "2px solid #eab308",
                padding: "10px 14px",
                borderRadius: "14px",
                fontWeight: "bold",
                color: "#854d0e",
                fontSize: "0.95rem",
                boxShadow: "0 4px 12px rgba(234, 179, 8, 0.2)",
              }}
            >
              {getBadge()}
            </div>
          </div>

          {/* Unlocks Alert */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "1rem" }}>🦄 Rare Creatures</h4>
            {score < 5 ? (
              <div>
                <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  Rescue {5 - score} more animals to unlock exotic species in the sanctuary!
                </p>
                <div style={{ height: "8px", background: "rgba(0,0,0,0.06)", borderRadius: "8px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${(score / 5) * 100}%`,
                      height: "100%",
                      background: "#3b82f6",
                      borderRadius: "8px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ color: "#16a34a", fontWeight: "bold", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
                ✨ Rare Animals Unlocked!
              </div>
            )}
          </div>
        </div>

        {/* Right Active Game Column */}
        <div
          className="glass-panel"
          style={{
            padding: "30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "420px",
            textAlign: "center",
          }}
        >
          {/* Main Animal Rescue Card */}
          <motion.div
            key={currentAnimal.name}
            initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
            className="glass-card"
            style={{
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "110px",
              background: "radial-gradient(circle at center, #ffffff, #f0fdf4)",
              boxShadow: "0 15px 40px rgba(0, 0, 0, 0.08)",
              border: "5px solid rgba(255,255,255,0.8)",
              marginBottom: "20px",
              position: "relative",
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {currentAnimal.animal}
            </motion.div>
          </motion.div>

          <h2 style={{ fontSize: "1.4rem", margin: "0 0 10px 0", color: "hsl(var(--text-primary))" }}>
            The {currentAnimal.name} is stranded!
          </h2>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#dc2626", margin: "0 0 24px 0" }}>
            "{currentAnimal.message}"
          </p>

          {/* Interactive buttons */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            {weatherButtons.map((btn) => (
              <motion.button
                key={btn.id}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => checkAnswer(btn.id)}
                style={{
                  fontSize: "30px",
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  background: btn.color,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={btn.id}
              >
                {btn.emoji}
              </motion.button>
            ))}
          </div>

          {/* Action response panel */}
          <div style={{ height: "60px", marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimatePresence mode="wait">
              {status && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "12px",
                    fontSize: "0.95rem",
                    fontWeight: "bold",
                    background: statusType === "success" ? "#dcfce7" : "#fee2e2",
                    color: statusType === "success" ? "#15803d" : "#b91c1c",
                    border: statusType === "success" ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  {status}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}