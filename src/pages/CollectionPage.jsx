import { useParams, useSearchParams } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { COLLECTION_BY_SLUG } from "../data/collections";
import { NEIGHBORHOODS } from "../data/neighborhoods";
import { getByCollection } from "../hooks/useRestaurants";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import NotFound from "./NotFound";

export default function CollectionPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const collection = COLLECTION_BY_SLUG[slug];
  usePageTitle(collection?.title || "Collection");

  if (!collection) return <NotFound />;

  const hoodId = searchParams.get("hood");
  const neighborhood = NEIGHBORHOODS[hoodId];
  const restaurants = getByCollection(collection).filter((r) => !neighborhood || r.neighborhood === neighborhood.id);

  return (
    <div className="browse-page">
      <h1 className="page-title">{collection.title}</h1>
      <p className="page-blurb">
        {collection.blurb}
        {neighborhood ? ` Showing results in ${neighborhood.name}.` : ""}
      </p>
      <div className="card-grid">
        {restaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
    </div>
  );
}
