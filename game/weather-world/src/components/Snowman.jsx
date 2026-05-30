import { useState } from "react";

export default function Snowman() {
  const [level, setLevel] = useState(0);

  const snowmanStages = [
    "⛄",
    "⛄🎩",
    "⛄🎩🧣",
    "⛄🎩🧣✨",
    "⛄🎩🧣✨🎉",
  ];

  const handleClick = () => {
    setLevel((prev) => {
      if (prev >= snowmanStages.length - 1) {
        return 0;
      }

      return prev + 1;
    });
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "absolute",
        top: 140,
        left: 80,
        fontSize: "90px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {snowmanStages[level]}
    </div>
  );
}