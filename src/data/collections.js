export const COLLECTIONS = [
  {
    slug: "student-favorites",
    title: "Student Favorites",
    blurb: "What the students living here actually keep going back to.",
    filter: (r) => r.tags.includes("student-favorite"),
  },
  {
    slug: "hidden-gems",
    title: "Hidden Gems",
    blurb: "The places locals go that rarely make a tourist itinerary.",
    filter: (r) => r.tags.includes("hidden-local-favorite"),
  },
  {
    slug: "budget-friendly",
    title: "Budget-Friendly Eats",
    blurb: "Full, satisfying meals that won't strain a student budget.",
    filter: (r) => r.price === "$",
  },
];

export const COLLECTION_BY_SLUG = Object.fromEntries(COLLECTIONS.map((c) => [c.slug, c]));
