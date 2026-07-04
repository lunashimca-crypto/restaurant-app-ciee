import RestaurantArt from "./RestaurantArt";

export default function RestaurantHero({ restaurant }) {
  return <RestaurantArt cuisine={restaurant.cuisine} seed={restaurant.id} emoji={restaurant.emoji} variant="hero" />;
}
