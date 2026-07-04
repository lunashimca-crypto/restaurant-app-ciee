export async function shareRestaurant(restaurant) {
  const url = `${location.origin}${location.pathname}#/restaurant/${restaurant.id}`;
  const data = { title: restaurant.name, text: restaurant.whyRecommended, url };

  if (navigator.share) {
    try {
      await navigator.share(data);
      return "shared";
    } catch {
      return "cancelled";
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}
