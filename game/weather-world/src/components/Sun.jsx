import { motion } from "framer-motion";

export default function Sun() {
  return (
    <motion.div
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        position: "absolute",
        top: 120,
        right: 80,
        fontSize: "120px",
      }}
    >
      ☀️
    </motion.div>
  );
}