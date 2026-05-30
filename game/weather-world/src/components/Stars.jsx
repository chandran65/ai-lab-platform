export default function Stars() {
  const stars = Array.from(
    { length: 40 },
    (_, i) => i
  );

  return (
    <>
      {stars.map((star) => (
        <div
          key={star}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          ⭐
        </div>
      ))}
    </>
  );
}