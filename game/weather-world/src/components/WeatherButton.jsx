export default function WeatherButton({
  icon,
  active,
  onClick,
}) {
  return (
    <button
      onClick={(e) => {
  e.stopPropagation();
  onClick();
}}
      style={{
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        border: active
          ? "4px solid gold"
          : "none",
        fontSize: "32px",
        cursor: "pointer",
        background: "white",
        boxShadow:
          "0 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      {icon}
    </button>
  );
}