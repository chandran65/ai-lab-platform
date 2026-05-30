import { weatherTypes } from "../data/weatherData";
import { useWeather } from "../context/WeatherContext";
import { useState, useEffect } from "react";
import Snowman from "../components/Snowman";
import Frog from "../components/Frog";
import Rain from "../components/Rain";
import { motion, AnimatePresence } from "framer-motion";
import FloatingClouds from "../components/FloatingClouds";
import Sun from "../components/Sun";
import Snow from "../components/Snow";
import WeatherButton from "../components/WeatherButton";
import Mascot from "../components/Mascot";
import Character from "../components/Character";
import Stars from "../components/Stars";
import Leaves from "../components/Leaves";
import Butterflies from "../components/Butterflies";
import weatherMissions from "../data/weatherMissions";
import weatherRelics from "../data/weatherRelics";
import IceCave from "../islands/IceCave";
import MoonObservatory from "../islands/MoonObservatory";
import WindForest from "../islands/WindForest";
import SunTemple from "../islands/SunTemple";
import { playClick, playSuccess, playFailure, playCoin } from "../utils/audio";

export default function GameWorld({ onBack }) {
  const {
    weather,
    setWeather,
    addXp,
    setRelicsDiscovered,
    setLegendariesFound,
  } = useWeather();

  const [legendaryItems, setLegendaryItems] = useState([]);
  const [relics, setRelics] = useState([]);
  const [portalOpen, setPortalOpen] = useState(false);
  const [showRainbow, setShowRainbow] = useState(false);
  const [selectedIsland, setSelectedIsland] = useState(null);
  const [flowers, setFlowers] = useState([]);
  const [previousWeather, setPreviousWeather] = useState(weather);
  const [currentMission, setCurrentMission] = useState(0);
  const [secretIsland, setSecretIsland] = useState(false);
  const [score, setScore] = useState(0);
  const [weatherMaster, setWeatherMaster] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [collection, setCollection] = useState([]);

  const mission = weatherMissions[currentMission];

  const backgrounds = {
    sunny: "linear-gradient(135deg, #7dd3fc, #bae6fd, #e0f2fe, #fef08a)",
    rainy: "linear-gradient(135deg, #475569, #64748b, #94a3b8, #cbd5e1)",
    snowy: "linear-gradient(135deg, #bae6fd, #e0f2fe, #f1f5f9, #ffffff)",
    windy: "linear-gradient(135deg, #a7f3d0, #cbd5e1, #bae6fd, #86efac)",
    night: "linear-gradient(135deg, #0f172a, #1e1b4b, #312e81, #0f172a)",
  };

  useEffect(() => {
    if (
      legendaryItems.includes("Penguin Egg") &&
      legendaryItems.includes("Owl Feather") &&
      legendaryItems.includes("Wind Seed") &&
      legendaryItems.includes("Sun Fragment")
    ) {
      setPopupTitle("👑 WEATHER DEITY");
      setPopupMessage("Incredible! You united all atmospheric powers and unlocked the hidden master realm! Click the reload button to restart your adventure.");
      setWeatherMaster(true);
      setPopupOpen(true);
    }
  }, [legendaryItems]);

  useEffect(() => {
    if (relics.length === 5) {
      setPortalOpen(true);
    }
  }, [relics]);

  useEffect(() => {
    setFlowers([]);
  }, [weather]);

  useEffect(() => {
    if (previousWeather === "rainy" && weather === "sunny") {
      setShowRainbow(true);
      const timer = setTimeout(() => {
        setShowRainbow(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    setPreviousWeather(weather);
  }, [weather]);

  const growFlower = (event) => {
    // If clicking on control bar or hud buttons, don't grow flower
    if (event.target.closest("button") || event.target.closest(".hud-container")) {
      return;
    }
    const weatherObject = {
      sunny: "🌷",
      rainy: "🌻",
      snowy: "❄️",
      windy: "🍂",
      night: "🌱",
    };

    const newFlower = {
      x: event.clientX,
      y: event.clientY,
      emoji: weatherObject[weather] || "🌸",
      id: crypto.randomUUID(),
    };

    setFlowers((prev) => [...prev, newFlower]);
  };

  const handleMissionCheck = (selectedWeather) => {
    if (!mission) return;

    if (selectedWeather === mission.weather) {
      playSuccess();
      addXp(20);
      setScore((prev) => prev + 10);

      if (!collection.includes(mission.creature)) {
        setCollection((prev) => [...prev, mission.creature]);
      }

      const relic = weatherRelics[selectedWeather];
      if (relic) {
        if (!relics.find((r) => r.name === relic.name)) {
          setRelics((prev) => {
            const next = [...prev, relic];
            setRelicsDiscovered(next.length);
            return next;
          });
        }
      }

      setPopupTitle("🎉 Outstanding Science!");
      setPopupMessage(
        `${mission.fact}\n\n🎁 New Relic Discovered:\n${relic.emoji} ${relic.name}\n\n⭐ +20 Global XP Rewarded!`
      );
      setPopupOpen(true);

      if (currentMission < weatherMissions.length - 1) {
        setCurrentMission((prev) => prev + 1);
      } else {
        setPopupTitle("🏆 All Relics Assembled!");
        setPopupMessage("You've assembled all five relics! The magical weather portal is swirling open at the center of the world!");
        setPopupOpen(true);
      }
    } else {
      playFailure();
      setPopupTitle("❌ Keep Exploring!");
      setPopupMessage(`That weather doesn't match the needs of the ${mission.creature}. Take a look at the clues and try another atmospheric setting!`);
      setPopupOpen(true);
    }
  };

  // Island callbacks
  const completeIceCave = (weatherChoice) => {
    if (weatherChoice === "snowy") {
      playCoin();
      addXp(50);
      if (!legendaryItems.includes("Penguin Egg")) {
        setLegendaryItems((prev) => {
          const next = [...prev, "Penguin Egg"];
          setLegendariesFound(next.length);
          return next;
        });
      }
      setPopupTitle("🥚 Penguin Egg Rescued!");
      setPopupMessage("Splendid! You safely protected the frozen penguin egg with the cold snowy weather it loves!\n\n⭐ +50 Global XP!");
      setPopupOpen(true);
    } else {
      playFailure();
      setPopupTitle("❌ Cave Warming Up!");
      setPopupMessage("The Ice Cave must stay snowy! Try using a colder climate.");
      setPopupOpen(true);
    }
  };

  const completeMoonObservatory = (weatherChoice) => {
    if (weatherChoice === "night") {
      playCoin();
      addXp(50);
      if (!legendaryItems.includes("Owl Feather")) {
        setLegendaryItems((prev) => {
          const next = [...prev, "Owl Feather"];
          setLegendariesFound(next.length);
          return next;
        });
      }
      setPopupTitle("🪶 Owl Feather Recovered!");
      setPopupMessage("Brilliant! The nighttime stars have guided the lost owl home safely.\n\n⭐ +50 Global XP!");
      setPopupOpen(true);
    } else {
      playFailure();
      setPopupTitle("❌ Owl is Confused");
      setPopupMessage("Owls navigate best at night when the stars are high. Set the sky to night!");
      setPopupOpen(true);
    }
  };

  const completeWindForest = (weatherChoice) => {
    if (weatherChoice === "windy") {
      playCoin();
      addXp(50);
      if (!legendaryItems.includes("Wind Seed")) {
        setLegendaryItems((prev) => {
          const next = [...prev, "Wind Seed"];
          setLegendariesFound(next.length);
          return next;
        });
      }
      setPopupTitle("🌱 Wind Seed Recovered!");
      setPopupMessage("Magnificent! A swirling gust of windy air carried the magical seed safely back to the canopy.\n\n⭐ +50 Global XP!");
      setPopupOpen(true);
    } else {
      playFailure();
      setPopupTitle("❌ Wind is Silent");
      setPopupMessage("The Wind Forest seeds require breezy wind to float across the canopy!");
      setPopupOpen(true);
    }
  };

  const completeSunTemple = (weatherChoice) => {
    if (weatherChoice === "sunny") {
      playCoin();
      addXp(50);
      if (!legendaryItems.includes("Sun Fragment")) {
        setLegendaryItems((prev) => {
          const next = [...prev, "Sun Fragment"];
          setLegendariesFound(next.length);
          return next;
        });
      }
      setPopupTitle("☀️ Sun Temple Restored!");
      setPopupMessage("Amazing! Radiant solar rays reactivated the ancient temple obelisk crystals!\n\n⭐ +50 Global XP!");
      setPopupOpen(true);
    } else {
      playFailure();
      setPopupTitle("❌ Temple Dormant");
      setPopupMessage("The ancient solar crystals in the temple need sunny skies to recharge!");
      setPopupOpen(true);
    }
  };

  const islandCard = {
    height: "170px",
    width: "240px",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    fontSize: "22px",
    fontWeight: "bold",
    cursor: "pointer",
    background: "rgba(255, 255, 255, 0.85)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    backdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    fontFamily: "var(--font-heading)",
  };

  if (selectedIsland === "ice") {
    return (
      <IceCave
        completeIceCave={completeIceCave}
        popupOpen={popupOpen}
        popupTitle={popupTitle}
        popupMessage={popupMessage}
        setPopupOpen={setPopupOpen}
        setSelectedIsland={setSelectedIsland}
      />
    );
  }
  if (selectedIsland === "moon") {
    return (
      <MoonObservatory
        completeMoonObservatory={completeMoonObservatory}
        popupOpen={popupOpen}
        popupTitle={popupTitle}
        popupMessage={popupMessage}
        setPopupOpen={setPopupOpen}
        setSelectedIsland={setSelectedIsland}
      />
    );
  }
  if (selectedIsland === "wind") {
    return (
      <WindForest
        completeWindForest={completeWindForest}
        popupOpen={popupOpen}
        popupTitle={popupTitle}
        popupMessage={popupMessage}
        setPopupOpen={setPopupOpen}
        setSelectedIsland={setSelectedIsland}
      />
    );
  }
  if (selectedIsland === "sun") {
    return (
      <SunTemple
        completeSunTemple={completeSunTemple}
        popupOpen={popupOpen}
        popupTitle={popupTitle}
        popupMessage={popupMessage}
        setPopupOpen={setPopupOpen}
        setSelectedIsland={setSelectedIsland}
      />
    );
  }

  if (weatherMaster) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "radial-gradient(circle at center, #8b5cf6, #3b82f6, #0f172a)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "30px",
          color: "white",
          padding: "20px",
        }}
      >
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: "4.5rem",
            background: "linear-gradient(to right, #ffd700, #ff8c00, #ff00ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            margin: 0,
            textShadow: "0 0 40px rgba(255, 215, 0, 0.3)",
          }}
        >
          👑 WEATHER MASTER
        </motion.h1>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: "2rem", fontWeight: "normal", textAlign: "center", margin: 0 }}
        >
          You successfully united all atmospheric powers!
        </motion.h2>

        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          style={{ fontSize: "80px", letterSpacing: "15px", display: "flex", gap: "10px", margin: "20px 0" }}
        >
          ☀️ 🌧️ ❄️ 🍃 🌙
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playClick();
            window.location.reload();
          }}
          className="btn-premium"
          style={{
            fontSize: "1.3rem",
            padding: "16px 40px",
            background: "linear-gradient(to right, #ffd700, #ff8c00)",
            color: "#1e1b4b",
            boxShadow: "0 10px 30px rgba(255, 215, 0, 0.4)",
            border: "none",
          }}
        >
          🔄 Play Again
        </motion.button>
      </div>
    );
  }

  if (secretIsland) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(185deg, #0f172a, #1e1b4b, #111827)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "24px",
          color: "white",
        }}
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: "3rem", margin: 0, textAlign: "center" }}
        >
          🏝️ Secret Weather Island
        </motion.h1>

        <p style={{ color: "#94a3b8", fontSize: "1.2rem", margin: 0 }}>
          Harness local currents to unlock all four legendary artifacts
        </p>

        <div
          className="glass-panel"
          style={{
            padding: "20px 40px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "rgba(255,255,255,0.07)",
          }}
        >
          <h3 style={{ margin: 0, color: "#cbd5e1" }}>👑 Legendary Collection</h3>
          <div style={{ fontSize: "50px", display: "flex", gap: "20px", justifyContent: "center" }}>
            <span>{legendaryItems.includes("Penguin Egg") ? "🥚" : "❔"}</span>
            <span>{legendaryItems.includes("Owl Feather") ? "🪶" : "❔"}</span>
            <span>{legendaryItems.includes("Wind Seed") ? "🌱" : "❔"}</span>
            <span>{legendaryItems.includes("Sun Fragment") ? "☀️" : "❔"}</span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 240px)",
            gap: "25px",
            marginTop: "10px",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.08, y: -6, boxShadow: "0 10px 25px rgba(186, 230, 253, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            style={{ ...islandCard, color: "#0369a1" }}
            onClick={() => {
              playClick();
              setSelectedIsland("ice");
            }}
          >
            <span style={{ fontSize: "40px" }}>❄️</span> Ice Cave
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08, y: -6, boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            style={{ ...islandCard, color: "#1e1b4b" }}
            onClick={() => {
              playClick();
              setSelectedIsland("moon");
            }}
          >
            <span style={{ fontSize: "40px" }}>🌙</span> Moon Observatory
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08, y: -6, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            style={{ ...islandCard, color: "#15803d" }}
            onClick={() => {
              playClick();
              setSelectedIsland("wind");
            }}
          >
            <span style={{ fontSize: "40px" }}>🍃</span> Wind Forest
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08, y: -6, boxShadow: "0 10px 25px rgba(234, 179, 8, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            style={{ ...islandCard, color: "#a16207" }}
            onClick={() => {
              playClick();
              setSelectedIsland("sun");
            }}
          >
            <span style={{ fontSize: "40px" }}>☀️</span> Sun Temple
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playClick();
            setSecretIsland(false);
          }}
          className="btn-glass"
          style={{
            marginTop: "20px",
            background: "rgba(255, 255, 255, 0.1)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          ⬅ Back to Island Overview
        </motion.button>
      </div>
    );
  }

  return (
    <div
      onClick={growFlower}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: backgrounds[weather] || backgrounds.sunny,
        transition: "background 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Mascot weather={weather} />
      
      {/* Absolute floating Back to Hub button */}
      {onBack && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            playClick();
            onBack();
          }}
          className="btn-glass"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          ⬅ Back to Menu
        </button>
      )}

      {/* Floating HUD Side Panel */}
      <div
        className="hud-container"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          pointerEvents: "auto",
        }}
      >
        {/* Mission Card */}
        {mission && (
          <div
            className="glass-panel"
            style={{
              padding: "18px 24px",
              minWidth: "290px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: "1.4rem", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              🌦️ Weather Mission
            </h2>
            <p style={{ margin: "0 0 8px 0", color: "var(--text-secondary)", fontWeight: 500 }}>
              Help {mission.creature}
            </p>
            <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.85 }}>
              Choose the correct weather.
            </p>
          </div>
        )}

        {/* Score and Progress Card */}
        <div
          className="glass-panel"
          style={{
            padding: "18px 24px",
            minWidth: "290px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-secondary)" }}>⭐ Game Score</h3>
            <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#3b82f6" }}>{score}</span>
          </div>

          <div style={{ marginTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.85rem", fontWeight: "bold" }}>
              <span>🔮 Relic Progress:</span>
              <span>{relics.length}/5</span>
            </div>
            <div
              style={{
                height: "12px",
                background: "rgba(0, 0, 0, 0.08)",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(relics.length / 5) * 100}%` }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                  borderRadius: "20px",
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Relics Deck */}
        <div
          className="glass-panel"
          style={{
            padding: "16px 24px",
            minWidth: "290px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", fontSize: "1.1rem", color: "var(--text-secondary)" }}>🏺 Collected Relics</h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", minHeight: "45px", alignItems: "center" }}>
            {relics.length === 0 ? (
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic" }}>No relics discovered yet.</span>
            ) : (
              relics.map((relic, idx) => (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={idx}
                  style={{
                    fontSize: "36px",
                    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
                  }}
                  title={relic.name}
                >
                  {relic.emoji}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <FloatingClouds />
      <Character weather={weather} />

      {/* Flower Bed */}
      {flowers.map((flower) => (
        <div
          key={flower.id}
          style={{
            position: "absolute",
            left: flower.x - 20,
            top: flower.y - 20,
            fontSize: "44px",
            pointerEvents: "none",
            filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.15))",
          }}
        >
          <motion.div
            initial={{ scale: 0, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {flower.emoji}
          </motion.div>
        </div>
      ))}

      {/* Rainbow Backdrop */}
      {showRainbow && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.95 }}
          transition={{ duration: 0.6, type: "spring" }}
          style={{
            position: "absolute",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "140px",
            zIndex: 10,
            pointerEvents: "none",
            filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.1))",
          }}
        >
          🌈
        </motion.div>
      )}

      {/* Dialog Popups */}
      <AnimatePresence>
        {popupOpen && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{
                width: "460px",
                padding: "30px",
                position: "relative",
                textAlign: "center",
                background: "white",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playClick();
                  setPopupOpen(false);
                }}
                style={{
                  position: "absolute",
                  top: 15,
                  right: 15,
                  border: "none",
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                ✖
              </button>
              <h2 style={{ fontSize: "1.7rem", marginBottom: "12px", color: "hsl(var(--text-primary))" }}>{popupTitle}</h2>
              <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                {popupMessage}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Weather Objects */}
      {weather === "sunny" && (
        <>
          <Butterflies />
          <Sun />
        </>
      )}

      {weather === "rainy" && (
        <>
          <Rain />
          <Frog />
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 240,
              transform: "translateX(-50%)",
              fontSize: "90px",
            }}
          >
            ☂️
          </div>
        </>
      )}

      {weather === "snowy" && (
        <>
          <Snow />
          <Snowman />
        </>
      )}

      {weather === "windy" && (
        <>
          <Leaves />
          <div
            style={{
              position: "absolute",
              top: 120,
              right: 120,
              fontSize: "90px",
            }}
          >
            🪁
          </div>
        </>
      )}

      {weather === "night" && (
        <>
          <Stars />
          <div
            style={{
              position: "absolute",
              top: 120,
              right: 80,
              fontSize: "90px",
            }}
          >
            🌙
          </div>
        </>
      )}

      {/* Secret Swirling Portal */}
      {portalOpen && (
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.15, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "130px",
            cursor: "pointer",
            zIndex: 500,
            filter: "drop-shadow(0 0 35px rgba(59, 130, 246, 0.6))",
          }}
          title="Enter Secret Weather Portal"
          onClick={(e) => {
            e.stopPropagation();
            playClick();
            setSecretIsland(true);
          }}
        >
          🌀
        </motion.div>
      )}

      {/* Bottom Weather Controls */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "120px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "24px",
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.4)",
          zIndex: 80,
        }}
      >
        {weatherTypes.map((item) => (
          <WeatherButton
            key={item.id}
            icon={item.emoji}
            active={weather === item.id}
            onClick={() => {
              playClick();
              setWeather(item.id);
              handleMissionCheck(item.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}