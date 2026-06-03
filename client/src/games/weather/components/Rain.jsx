export default function Rain() {
  const drops = Array.from(
    { length: 120 },
    (_, i) => i
  );

  return (
    <>
      {drops.map((drop) => (
        <div
          key={drop}
          className="rain-drop"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random()}s`,
          }}
        />
      ))}
    </>
  );
}