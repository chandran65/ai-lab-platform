export default function Butterflies() {
  const butterflies = Array.from(
    { length: 8 },
    (_, i) => i
  );

  return (
    <>
      {butterflies.map((butterfly) => (
        <div
          key={butterfly}
          className="butterfly"
          style={{
            top: `${Math.random() * 70}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${
              8 + Math.random() * 4
            }s`,
          }}
        >
          🦋
        </div>
      ))}
    </>
  );
}