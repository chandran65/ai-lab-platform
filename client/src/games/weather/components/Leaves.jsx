export default function Leaves() {
  const leaves = Array.from(
    { length: 15 },
    (_, i) => i
  );

  return (
    <>
      {leaves.map((leaf) => (
        <div
          key={leaf}
          className="leaf"
          style={{
            top: `${Math.random() * 80}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${
              6 + Math.random() * 4
            }s`,
          }}
        >
          🍃
        </div>
      ))}
    </>
  );
}