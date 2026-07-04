export default function DishIllustration() {
  return (
    <svg viewBox="0 0 220 220" width="100%" height="100%" role="img" aria-label="Illustration of a Korean stew">
      <ellipse cx="110" cy="196" rx="72" ry="10" fill="#3D2417" opacity=".12" />

      {/* bowl */}
      <path d="M40 118 Q40 108 50 108 H170 Q180 108 180 118 Q180 168 110 174 Q40 168 40 118Z" fill="#FBF3EA" stroke="#3D2417" strokeWidth="3" />
      <path d="M46 122 Q110 138 174 122" fill="none" stroke="#D6B89C" strokeWidth="2.5" opacity=".7" />
      <rect x="34" y="102" width="152" height="16" rx="8" fill="#F2E0D6" stroke="#3D2417" strokeWidth="3" />

      {/* broth + toppings */}
      <path d="M52 116 Q110 128 168 116 Q168 118 168 120 Q110 132 52 120 Z" fill="#A84F33" />

      {/* napa cabbage */}
      <path d="M70 100 Q66 82 78 70 Q86 84 82 100Z" fill="#BFD4A0" stroke="#3D2417" strokeWidth="2.5" />
      <path d="M88 100 Q86 78 100 64 Q110 82 100 100Z" fill="#A9C98C" stroke="#3D2417" strokeWidth="2.5" />

      {/* mushroom */}
      <circle cx="140" cy="92" r="15" fill="#7A3622" stroke="#3D2417" strokeWidth="2.5" />
      <path d="M132 90 L136 96 M140 88 L140 96 M148 90 L144 96" stroke="#F2E0D6" strokeWidth="2" strokeLinecap="round" />

      {/* tofu cube */}
      <rect x="118" y="96" width="20" height="20" rx="3" fill="#FBF3EA" stroke="#3D2417" strokeWidth="2.5" />

      {/* fish cake swirl */}
      <circle cx="96" cy="108" r="11" fill="#F2A6A0" stroke="#3D2417" strokeWidth="2.5" />
      <path d="M96 101 a7 7 0 1 1 -0.1 0" fill="none" stroke="#A84F33" strokeWidth="1.6" />

      {/* scallion */}
      <path d="M112 90 L108 104 M118 86 L116 102 M124 90 L126 104" stroke="#7C9473" strokeWidth="3" strokeLinecap="round" />

      {/* chopsticks */}
      <rect x="150" y="40" width="6" height="90" rx="3" fill="#BD8A3C" stroke="#3D2417" strokeWidth="2" transform="rotate(18 153 85)" />
      <rect x="162" y="40" width="6" height="90" rx="3" fill="#BD8A3C" stroke="#3D2417" strokeWidth="2" transform="rotate(14 165 85)" />

      {/* steam */}
      <path d="M80 56 Q76 46 82 38 Q88 30 82 20" fill="none" stroke="#D6B89C" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      <path d="M104 50 Q100 40 106 32 Q112 24 106 14" fill="none" stroke="#D6B89C" strokeWidth="3" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}
