import { motion } from "framer-motion";

export default function AnimatedBackground() {
  const clouds = [
    { top: "10%", size: 120, duration: 30 },
    { top: "25%", size: 180, duration: 40 },
    { top: "50%", size: 150, duration: 35 },
    { top: "70%", size: 130, duration: 45 },
  ];

  return (
    <>
      {clouds.map((cloud, index) => (
        <motion.div
          key={index}
          initial={{ x: "-20vw" }}
          animate={{ x: "120vw" }}
          transition={{
            repeat: Infinity,
            duration: cloud.duration,
            ease: "linear",
          }}
          style={{
            position: "fixed",
            top: cloud.top,
            left: 0,
            fontSize: `${cloud.size}px`,
            opacity: 0.75,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          ☁️
        </motion.div>
      ))}
    </>
  );
}