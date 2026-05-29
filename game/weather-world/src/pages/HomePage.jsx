import { motion } from "framer-motion";
import { useWeather } from "../context/WeatherContext";
import { playClick } from "../utils/audio";

export default function HomePage({ onSelectMode }) {
  const {
    xp,
    level,
    xpNeeded,
    coins,
    animalsSaved,
    plantsGrown,
    relicsDiscovered,
    legendariesFound,
    rankTitle,
  } = useWeather();

  const modes = [
    {
      id: "weather",
      emoji: "🌦️",
      title: "Weather Guardian",
      description: "Match climates, rescue creatures, assemble 5 relics, and open the secret portal to the 4 legendary temples!",
      badge: "Adventure Mode",
      color: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    },
    {
      id: "animals",
      emoji: "🐾",
      title: "Animal Rescue",
      description: "Safeguard stranded animals in the wild by selecting their ideal atmospheric climates inside the reserve.",
      badge: "Puzzle Mode",
      color: "linear-gradient(135deg, #10b981, #34d399)",
    },
    {
      id: "garden",
      emoji: "🌱",
      title: "Garden Builder",
      description: "Shop for unique seeds, plant sprouts, and nurture a magical greenhouse under dynamic weather elements.",
      badge: "Simulation Mode",
      color: "linear-gradient(135deg, #eab308, #facc15)",
    },
  ];

  const handleSelectMode = (modeId) => {
    playClick();
    onSelectMode(modeId);
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e1b4b, #111827)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Soft Ambient Glow Elements */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "15%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(45px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(55px)",
          pointerEvents: "none",
        }}
      />

      {/* Main Title Header */}
      <div style={{ textAlign: "center", marginBottom: "35px", zIndex: 1 }}>
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          style={{
            fontSize: "4.2rem",
            margin: "0 0 10px 0",
            background: "linear-gradient(to right, #60a5fa, #38bdf8, #34d399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            textShadow: "0 10px 30px rgba(56, 189, 248, 0.1)",
          }}
        >
          ☁️ Weather Adventure
        </motion.h1>
      </div>

      {/* Global Progression HUD Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "1020px",
          padding: "24px 30px",
          marginBottom: "40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          zIndex: 2,
        }}
      >
        {/* Level and XP row */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontSize: "1.7rem", fontWeight: 800, color: "#ffd700", fontFamily: "var(--font-heading)" }}>
                Level {level}
              </span>
              <span style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#e2e8f0" }}>
                — {rankTitle}
              </span>
            </div>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
              Global Meteorological Ranking
            </span>
          </div>

          <div style={{ flexGrow: 1, maxWidth: "450px", minWidth: "260px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "bold", color: "#cbd5e1", marginBottom: "6px" }}>
              <span>XP Progress</span>
              <span>{xp} / {xpNeeded} XP</span>
            </div>
            <div style={{ height: "12px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "20px", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(xp / xpNeeded) * 100}%` }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #3b82f6, #38bdf8)",
                  borderRadius: "20px",
                }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "16px",
          }}
        >
          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px 16px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.03)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#38bdf8" }}>{animalsSaved}</div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>Stranded Animals Saved</div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px 16px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.03)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981" }}>{plantsGrown}</div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>Crops Cultivated</div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px 16px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.03)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#eab308" }}>🪙 {coins}</div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>Garden Coins Bag</div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px 16px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.03)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#a855f7" }}>{relicsDiscovered} / 5</div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>Artifacts Assembled</div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px 16px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.03)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ec4899" }}>{legendariesFound} / 4</div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>Legendary Relics Found</div>
          </div>
        </div>
      </motion.div>

      {/* Grid of Choices */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          width: "100%",
          maxWidth: "1020px",
          flexWrap: "wrap",
          zIndex: 1,
        }}
      >
        {modes.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, delay: index * 0.1 + 0.2 }}
            whileHover={{ scale: 1.04, y: -8 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelectMode(mode.id)}
            style={{
              width: "310px",
              minHeight: "360px",
              cursor: "pointer",
              borderRadius: "24px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(16px)",
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Glowing Edge Hover */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "6px",
                background: mode.color,
              }}
            />

            {/* Mode Category Tag */}
            <span
              style={{
                alignSelf: "flex-start",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.08)",
                color: "#cbd5e1",
                marginBottom: "20px",
              }}
            >
              {mode.badge}
            </span>

            {/* Giant Graphic Emoji */}
            <div
              style={{
                fontSize: "72px",
                marginBottom: "18px",
                filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.2))",
                display: "inline-block",
              }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: index * 0.5 }}
              >
                {mode.emoji}
              </motion.div>
            </div>

            {/* Card Titles */}
            <h2
              style={{
                fontSize: "1.5rem",
                color: "white",
                margin: "0 0 10px 0",
                fontFamily: "var(--font-heading)",
              }}
            >
              {mode.title}
            </h2>

            {/* Custom Descriptions */}
            <p
              style={{
                fontSize: "0.9rem",
                color: "#94a3b8",
                lineHeight: "1.6",
                margin: 0,
                flexGrow: 1,
              }}
            >
              {mode.description}
            </p>

            {/* Sleek Forward Indicator */}
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "bold",
                color: "#60a5fa",
                fontSize: "0.95rem",
              }}
            >
              Enter World ➔
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}