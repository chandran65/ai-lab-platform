export default function Snow() {
  const flakes = Array.from(
    { length: 80 },
    (_, i) => i
  );

  return (
    <>
      {flakes.map((flake) => (
        <div
          key={flake}
          className="snow-flake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${
              5 + Math.random() * 5
            }s`,
          }}
        >
          ❄️
        </div>
      ))}
    </>
  );
}