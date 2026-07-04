import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { getByNeighborhoodAndCategory, getCategoriesForNeighborhood, getByCollection } from "../hooks/useRestaurants";
import { NEIGHBORHOODS, NEIGHBORHOOD_LIST } from "../data/neighborhoods";
import { COLLECTIONS } from "../data/collections";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import RestaurantTile from "../components/restaurant/RestaurantTile";
import SectionRow from "../components/browse/SectionRow";
import CategoryChips from "../components/browse/CategoryChips";
import NotFound from "./NotFound";

const HOOD_KEY = "selectedNeighborhood";
const PREVIEW_LIMIT = 6;

export default function ExplorePage() {
  const { hood: hoodId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const neighborhood = NEIGHBORHOODS[hoodId];
  usePageTitle(neighborhood?.name || "Explore");

  useEffect(() => {
    if (!neighborhood) return;
    try {
      localStorage.setItem(HOOD_KEY, neighborhood.id);
    } catch {
      // ignore storage errors
    }
  }, [neighborhood]);

  if (!neighborhood) return <NotFound />;

  const catId = searchParams.get("cat") || "all";

  function selectCategory(id) {
    setSearchParams(id === "all" ? {} : { cat: id });
  }

  const categories = [{ id: "all", label: "All Restaurants" }, ...getCategoriesForNeighborhood(neighborhood.id)];
  const restaurants = getByNeighborhoodAndCategory(neighborhood.id, catId);

  const previewSections = COLLECTIONS.map((c) => ({
    ...c,
    items: getByCollection(c)
      .filter((r) => r.neighborhood === neighborhood.id)
      .slice(0, PREVIEW_LIMIT),
  })).filter((c) => c.items.length > 0);

  return (
    <div className={`explore-page accent-${neighborhood.accent}`}>
      <div className="hood-tabs">
        {NEIGHBORHOOD_LIST.map((n) => (
          <Link key={n.id} to={`/explore/${n.id}`} className={`hood-tab accent-${n.accent}${n.id === neighborhood.id ? " active" : ""}`}>
            {n.name}
          </Link>
        ))}
      </div>
      <p className="hood-blurb">{neighborhood.blurb}</p>

      {previewSections.map((c) => (
        <SectionRow
          key={c.slug}
          title={c.title}
          action={
            <Link to={`/collection/${c.slug}?hood=${neighborhood.id}`} className="section-see-all">
              See all →
            </Link>
          }
        >
          {c.items.map((r) => (
            <RestaurantTile key={r.id} restaurant={r} />
          ))}
        </SectionRow>
      ))}

      <section className="section-row">
        <h2 className="section-title-standalone">All Restaurants in {neighborhood.name}</h2>
        <CategoryChips items={categories} activeId={catId} onSelect={selectCategory} />
        <div className="card-grid">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </section>

      <Link to="/" className="all-neighborhoods-link">
        ← Choose a different neighborhood
      </Link>
    </div>
  );
}
