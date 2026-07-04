import { Link } from "react-router-dom";
import RestaurantArt from "./RestaurantArt";
import { CUISINES } from "../../data/cuisines";

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="r-card">
      <div className="r-card-thumb">
        <RestaurantArt cuisine={restaurant.cuisine} seed={restaurant.id} emoji={restaurant.emoji} variant="thumb" />
      </div>
      <div className="r-card-meta">
        <div className="r-card-name">{restaurant.name}</div>
        <div className="r-card-sub">{CUISINES[restaurant.cuisine]?.label}</div>
        <div className="r-card-tags">
          {restaurant.price} · {restaurant.distanceMin} min walk
        </div>
      </div>
    </Link>
  );
}
