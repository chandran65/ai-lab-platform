export default function Mascot({ weather }) {
  const messages = {
    sunny: "Yay Sunshine!",
    rainy: "Splash Splash!",
    snowy: "Snow Time!",
    windy: "Whooooosh!",
    night: "Twinkle Stars!",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "70px",
        }}
      >
        ☁️
      </div>

      <div
        style={{
          background: "white",
          padding: "8px 14px",
          borderRadius: "20px",
          fontWeight: "bold",
        }}
      >
        {messages[weather]}
      </div>
    </div>
  );
}