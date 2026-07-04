import { Link } from "react-router-dom";
import RestaurantArt from "./RestaurantArt";

export default function RestaurantTile({ restaurant }) {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="r-tile">
      <div className="r-tile-art">
        <RestaurantArt cuisine={restaurant.cuisine} seed={restaurant.id} emoji={restaurant.emoji} variant="thumb" />
      </div>
      <div className="r-tile-name">{restaurant.name}</div>
      <div className="r-tile-sub">
        {restaurant.price} · {restaurant.distanceMin} min
      </div>
    </Link>
  );
}
