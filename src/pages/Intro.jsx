import DanChungBorder from "../components/decoration/DanChungBorder";
import StampMotif from "../components/decoration/StampMotif";
import DishIllustration from "../components/decoration/DishIllustration";

export default function Intro({ onEnter }) {
  return (
    <div className="intro">
      <div className="intro-content">
        <div className="intro-hero">
          <span className="intro-hero-badge">
            <StampMotif size={46} rotate={10} opacity={1} />
          </span>
          <p className="intro-hero-kicker">Seoul, Korea · 2026</p>
          <h1 className="intro-hero-title">
            Korea
            <br />
            Food
            <br />
            Guide
          </h1>
          <div className="intro-hero-art">
            <DishIllustration />
          </div>
        </div>
        <button type="button" className="intro-cta" onClick={onEnter}>
          Begin Exploring
        </button>
      </div>
      <div className="intro-border">
        <DanChungBorder />
      </div>
    </div>
  );
}
