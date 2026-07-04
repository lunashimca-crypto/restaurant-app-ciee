export default function DanChungBorder() {
  return (
    <svg width="100%" height="12" viewBox="0 0 400 12" preserveAspectRatio="none" style={{ display: "block" }}>
      <rect width="400" height="12" fill="#A84F33" />
      <rect width="400" height="1.5" y="0" fill="#C0694A" opacity=".7" />
      <rect width="400" height="1.5" y="10.5" fill="#7A3622" opacity=".8" />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} transform={`translate(${i * 40 + 20},6)`}>
          <circle cx="0" cy="0" r="2.6" fill="none" stroke="#F2DCC4" strokeWidth="1.1" />
          <circle cx="0" cy="0" r="1" fill="#E8B98A" />
          <line x1="-16" y1="0" x2="-7" y2="0" stroke="#F2DCC4" strokeWidth="1" opacity=".5" />
          <line x1="7" y1="0" x2="16" y2="0" stroke="#F2DCC4" strokeWidth="1" opacity=".5" />
        </g>
      ))}
    </svg>
  );
}
