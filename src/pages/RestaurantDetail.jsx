import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { getById } from "../hooks/useRestaurants";
import { useFavorites } from "../hooks/useFavorites";
import { NEIGHBORHOODS } from "../data/neighborhoods";
import { CUISINES } from "../data/cuisines";
import { logEvent } from "../lib/analytics";
import { playSaveSound } from "../lib/sound";
import RestaurantHero from "../components/restaurant/RestaurantHero";
import SignatureDishList from "../components/restaurant/SignatureDishList";
import SaveButton from "../components/restaurant/SaveButton";
import ShareButton from "../components/restaurant/ShareButton";
import NaverMapLink from "../components/restaurant/NaverMapLink";
import StampMotif from "../components/decoration/StampMotif";
import NotFound from "./NotFound";

export default function RestaurantDetail() {
  const { slug } = useParams();
  const restaurant = getById(slug);
  const { isSaved, toggle } = useFavorites();
  usePageTitle(restaurant?.name || "Restaurant");

  useEffect(() => {
    if (restaurant) logEvent("Viewed", restaurant);
  }, [restaurant]);

  if (!restaurant) return <NotFound />;

  function handleToggleSave() {
    if (!isSaved(restaurant.id)) {
      logEvent("Saved", restaurant);
      playSaveSound();
    }
    toggle(restaurant.id);
  }

  const neighborhood = NEIGHBORHOODS[restaurant.neighborhood];
  const cuisine = CUISINES[restaurant.cuisine];

  return (
    <div className="detail-page">
      <RestaurantHero restaurant={restaurant} />
      <div className="detail-breadcrumb">
        <Link to={`/explore/${neighborhood.id}`}>{neighborhood.name}</Link>
        <span> · </span>
        <Link to={`/explore/${neighborhood.id}?cat=${cuisine.id}`}>{cuisine.label}</Link>
      </div>
      <h1 className="detail-title">{restaurant.name}</h1>
      <p className="detail-description">{restaurant.description}</p>

      <div className="detail-callout">
        <StampMotif size={36} rotate={-6} opacity={0.7} />
        <div>
          <div className="detail-callout-label">Why CIEE recommends it</div>
          <div className="detail-callout-text">{restaurant.whyRecommended}</div>
        </div>
      </div>

      <h2 className="detail-section-label">Signature Dishes</h2>
      <SignatureDishList dishes={restaurant.signatureDishes} />

      <div className="detail-meta-row">
        <div>
          <div className="detail-meta-label">Price</div>
          <div className="detail-meta-value">{restaurant.price}</div>
        </div>
        <div>
          <div className="detail-meta-label">Walking Distance</div>
          <div className="detail-meta-value">{restaurant.distanceMin} min</div>
        </div>
        <div>
          <div className="detail-meta-label">Hours</div>
          <div className="detail-meta-value">{restaurant.hours}</div>
        </div>
      </div>

      <div className="detail-actions">
        <SaveButton saved={isSaved(restaurant.id)} onToggle={handleToggleSave} />
        <ShareButton restaurant={restaurant} />
        <NaverMapLink url={restaurant.naverUrl} />
      </div>
    </div>
  );
}
