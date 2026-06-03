import { motion } from "framer-motion";

export default function IceCave({
  completeIceCave,
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
          "linear-gradient(180deg,#D6F3FF,#9ED8FF,#B8E6FF)",

        display: "flex",
        flexDirection: "column",

        justifyContent: "center",
        alignItems: "center",

        gap: "25px",
      }}
    >
      <div
        style={{
          background:
            "rgba(255,255,255,0.9)",

          padding: "30px",

          borderRadius: "25px",

          width: "500px",

          textAlign: "center",
        }}
      >
        <h1>❄️ Ice Cave</h1>

        <h2>
          🐧 Save the Penguin Egg
        </h2>

        <p>
          Choose the correct weather
          to rescue the frozen egg.
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
              completeIceCave(weather)
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
            justifyContent:
              "center",
            alignItems:
              "center",
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