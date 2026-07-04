import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { NEIGHBORHOOD_LIST } from "../data/neighborhoods";
import { getByNeighborhood } from "../hooks/useRestaurants";
import LocationCard from "../components/home/LocationCard";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const HOOD_KEY = "selectedNeighborhood";

function rememberHood(id) {
  try {
    localStorage.setItem(HOOD_KEY, id);
  } catch {
    // ignore storage errors
  }
}

function loadSelectedHood() {
  try {
    return localStorage.getItem(HOOD_KEY);
  } catch {
    return null;
  }
}

export default function Home() {
  usePageTitle("");
  const [selectedHood] = useState(loadSelectedHood);

  return (
    <div className="picker">
      <div className="home-greeting">{greeting()}</div>
      <h1 className="picker-title">Where are you staying?</h1>

      <div className="location-cards">
        {NEIGHBORHOOD_LIST.map((n, i) => (
          <LocationCard
            key={n.id}
            neighborhood={n}
            count={getByNeighborhood(n.id).length}
            selected={n.id === selectedHood}
            accent={n.accent}
            delay={i * 80}
            onSelect={() => rememberHood(n.id)}
          />
        ))}
      </div>

      <Link to="/saved" className="saved-banner">
        <span className="saved-banner-icon">♥</span>
        <span className="saved-banner-label">Your Saved Places</span>
        <span className="saved-banner-arrow">→</span>
      </Link>
    </div>
  );
}
