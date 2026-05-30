export default function Character({
  weather,
}) {
 const emojis = {
  sunny: "🧒",
  rainy: "🧒",
  snowy: "🧣",
  windy: "🪁",
  night: "😴",
};
  return (
    <div
      style={{
        position: "absolute",
        bottom: "130px",
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "90px",
      }}
    >
      {emojis[weather]}
    </div>
  );
}