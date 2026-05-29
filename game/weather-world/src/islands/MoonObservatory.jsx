import { motion } from "framer-motion";

export default function MoonObservatory({
  completeMoonObservatory,
  popupOpen,
  popupTitle,
  popupMessage,
  setPopupOpen,
  setSelectedIsland,
}) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background:
          "linear-gradient(180deg,#0F172A,#312E81,#1E1B4B)",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "25px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          padding: "30px",
          borderRadius: "25px",
          width: "500px",
          textAlign: "center",
        }}
      >
        <h1>🌙 Moon Observatory</h1>

        <h2>🦉 Help the Lost Owl</h2>

        <p>
          Which weather helps the owl
          navigate home safely?
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
      >
        {[
          ["☀️", "sunny"],
          ["🌧️", "rainy"],
          ["❄️", "snowy"],
          ["🍃", "windy"],
          ["🌙", "night"],
        ].map(([emoji, weather]) => (
          <motion.button
            key={weather}
            whileHover={{
              scale: 1.15,
              y: -6,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={() =>
              completeMoonObservatory(
                weather
              )
            }
            style={{
              width: "80px",
              height: "80px",
              fontSize: "40px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {popupOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
              width: "450px",
            }}
          >
            <button
              onClick={() =>
                setPopupOpen(false)
              }
            >
              ✖
            </button>

            <h2>{popupTitle}</h2>

            <p>{popupMessage}</p>
          </div>
        </div>
      )}

      <button
        onClick={() =>
          setSelectedIsland(null)
        }
      >
        ⬅ Back to Island
      </button>
    </div>
  );
}