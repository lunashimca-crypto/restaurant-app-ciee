// Paste your deployed Google Apps Script Web App URL here (see setup instructions).
// Leave empty to disable analytics entirely — logEvent becomes a no-op.
export const ANALYTICS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyBK-pRz215NuTMOskDmVuYDqO5oR7oavtWJmvIF4Bl2v6iEIspYxuvRYJ5_Pj8u_f-/exec";

const DEVICE_KEY = "deviceId";

function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export function logEvent(event, restaurant) {
  if (!ANALYTICS_ENDPOINT) return;

  const payload = {
    deviceId: getDeviceId(),
    event,
    restaurantName: restaurant?.name || "",
    neighborhood: restaurant?.neighborhood || "",
    cuisine: restaurant?.cuisine || "",
    timestamp: new Date().toISOString(),
  };

  try {
    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch {
    // analytics must never break the app
  }
}
