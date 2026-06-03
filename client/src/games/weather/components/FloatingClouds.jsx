import { motion } from "framer-motion";

const clouds = [
  { top: 100, size: 70, duration: 18 },
  { top: 200, size: 90, duration: 22 },
  { top: 300, size: 60, duration: 16 },
];

export default function FloatingClouds() {
  return (
    <>
      {clouds.map((cloud, index) => (
        <motion.div
          key={index}
          initial={{ x: -200 }}
          animate={{ x: 1800 }}
          transition={{
            repeat: Infinity,
            duration: cloud.duration,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: cloud.top,
            fontSize: cloud.size,
            zIndex: 1,
          }}
        >
          ☁️
        </motion.div>
      ))}
    </>
  );
}