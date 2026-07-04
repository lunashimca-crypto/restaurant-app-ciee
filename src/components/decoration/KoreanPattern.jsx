export default function KoreanPattern({ opacity = 1 }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 80"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", opacity }}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={i * 40 - 20} y1="0" x2={i * 40 + 60} y2="80" stroke="#C49A3C" strokeWidth=".7" opacity=".18" />
      ))}
      {[[0, 0], [400, 0], [0, 80], [400, 80]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <polygon points="0,-18 10,-8 0,2 -10,-8" fill="#C49A3C" opacity=".22" />
        </g>
      ))}
      {[60, 140, 200, 260, 340].map((x, i) => (
        <g key={i} transform={`translate(${x},40)`}>
          <circle cx="0" cy="0" r="3" fill="none" stroke="#C49A3C" strokeWidth="1.2" opacity=".35" />
          <circle cx="0" cy="0" r="1" fill="#C49A3C" opacity=".45" />
          <line x1="-12" y1="0" x2="-6" y2="0" stroke="#C49A3C" strokeWidth=".8" opacity=".25" />
          <line x1="6" y1="0" x2="12" y2="0" stroke="#C49A3C" strokeWidth=".8" opacity=".25" />
        </g>
      ))}
      <line x1="0" y1="2" x2="400" y2="2" stroke="#C49A3C" strokeWidth=".6" opacity=".3" />
      <line x1="0" y1="78" x2="400" y2="78" stroke="#C49A3C" strokeWidth=".6" opacity=".3" />
    </svg>
  );
}
