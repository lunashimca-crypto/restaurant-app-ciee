import { RESTAURANTS, RESTAURANT_BY_ID } from "../data/restaurants";
import { CUISINE_LIST } from "../data/cuisines";

export function getById(id) {
  return RESTAURANT_BY_ID[id] || null;
}

export function getByNeighborhood(neighborhoodId) {
  return RESTAURANTS.filter((r) => r.neighborhood === neighborhoodId);
}

export function getByNeighborhoodAndCategory(neighborhoodId, categoryId) {
  const inNeighborhood = getByNeighborhood(neighborhoodId);
  if (!categoryId || categoryId === "all") return inNeighborhood;
  return inNeighborhood.filter((r) => r.cuisine === categoryId);
}

export function getCategoriesForNeighborhood(neighborhoodId) {
  const inNeighborhood = getByNeighborhood(neighborhoodId);
  return CUISINE_LIST.filter((c) => inNeighborhood.some((r) => r.cuisine === c.id));
}

export function getByCollection(collection) {
  return collection ? RESTAURANTS.filter(collection.filter) : [];
}
