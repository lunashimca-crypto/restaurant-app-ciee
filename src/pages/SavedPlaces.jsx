import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { useFavorites } from "../hooks/useFavorites";
import { getById } from "../hooks/useRestaurants";
import RestaurantCard from "../components/restaurant/RestaurantCard";

export default function SavedPlaces() {
  usePageTitle("Saved Places");
  const { ids } = useFavorites();
  const restaurants = ids.map(getById).filter(Boolean);

  return (
    <div className="browse-page">
      <h1 className="page-title">Saved Places</h1>
      {restaurants.length === 0 ? (
        <div className="empty-state">
          <p>No saved places yet.</p>
          <p>Explore and tap the heart on a restaurant to save it here.</p>
          <Link to="/" className="action-btn">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
}
