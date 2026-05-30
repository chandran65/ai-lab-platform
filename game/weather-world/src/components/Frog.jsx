import { motion } from "framer-motion";
import { useState } from "react";

export default function Frog() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);

    setTimeout(() => {
      setClicked(false);
    }, 700);
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 130,
        left: 120,
      }}
    >

      {/* PASTE THE RIBBIT BUBBLE HERE */}

      {clicked && (
        <div
          style={{
            position: "absolute",
            top: -50,
            left: 30,
            background: "white",
            padding: "5px 10px",
            borderRadius: "20px",
            fontWeight: "bold",
          }}
        >
          Ribbit!
        </div>
      )}

      <motion.div
        onClick={handleClick}
        animate={{
          y: clicked
            ? [-20, -120, 0]
            : [0, -10, 0],
        }}
        transition={{
          duration: clicked ? 0.6 : 2,
          repeat: clicked ? 0 : Infinity,
        }}
        style={{
          fontSize: "90px",
          cursor: "pointer",
        }}
      >
        🐸
      </motion.div>

    </div>
  );
}