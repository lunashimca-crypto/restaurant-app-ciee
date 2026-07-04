const B = import.meta.env.BASE_URL;

export default function StampMotif({ size = 64, rotate = -8, opacity = 0.85 }) {
  return (
    <img
      src={`${B}stamp.png`}
      alt=""
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        transform: `rotate(${rotate}deg)`,
        opacity,
        filter: "drop-shadow(0 2px 8px rgba(168,79,51,.3))",
        pointerEvents: "none",
      }}
    />
  );
}
