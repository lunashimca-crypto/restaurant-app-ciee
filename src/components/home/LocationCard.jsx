import { Link } from "react-router-dom";

function BuildingIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 21V5.5a1 1 0 0 1 .55-.9l5.5-2.75a1 1 0 0 1 .9 0l5.5 2.75a1 1 0 0 1 .55.9V21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 21h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M9 8.5h1M14 8.5h1M9 12h1M14 12h1M9 15.5h1M14 15.5h1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M10 21v-3.5a2 2 0 0 1 4 0V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function LocationCard({ neighborhood, count, selected, accent = "red", delay = 0, onSelect }) {
  return (
    <Link
      to={`/explore/${neighborhood.id}`}
      className={`location-card accent-${accent}${selected ? " selected" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onSelect}
    >
      <span className="location-card-icon">
        <BuildingIcon />
      </span>
      <span className="location-card-name">{neighborhood.name}</span>
      <span className="location-card-count">{count} restaurants</span>
    </Link>
  );
}
