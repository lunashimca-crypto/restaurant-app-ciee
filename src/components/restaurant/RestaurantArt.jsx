import KoreanPattern from "../decoration/KoreanPattern";
import { CUISINES } from "../../data/cuisines";

const PALETTES = [
  ["#F2E0D6", "#E0A858"],
  ["#F3E7CF", "#BD8A3C"],
  ["#F0DED4", "#B05E40"],
  ["#EFE3D0", "#8A6020"],
  ["#F4E6D8", "#A84F33"],
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

const ASPECT = { thumb: "1 / 1", hero: "21 / 9" };
const ICON_SIZE = { thumb: 24, hero: 40 };

export default function RestaurantArt({ cuisine, seed, variant = "thumb", emoji }) {
  const hash = hashString(seed || "restaurant");
  const [from, to] = PALETTES[hash % PALETTES.length];
  const rotate = (hash % 7) - 3;
  const icon = emoji || CUISINES[cuisine]?.icon || "🍽️";
  const isHero = variant === "hero";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ASPECT[variant] || ASPECT.thumb,
        borderRadius: isHero ? 14 : 10,
        overflow: "hidden",
        background: `linear-gradient(155deg, ${from}, ${to})`,
        flexShrink: 0,
      }}
    >
      <KoreanPattern opacity={0.22} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: ICON_SIZE[variant] || ICON_SIZE.thumb,
            transform: `rotate(${rotate}deg)`,
            filter: "drop-shadow(0 2px 6px rgba(61,36,23,.25))",
          }}
        >
          {icon}
        </span>
      </div>
      {isHero && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            background: "linear-gradient(90deg, transparent, #A84F33 20%, #BD8A3C 50%, #A84F33 80%, transparent)",
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
}
