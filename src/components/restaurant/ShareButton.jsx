import { useState } from "react";
import { shareRestaurant } from "../../lib/share";
import { logEvent } from "../../lib/analytics";
import { playShareSound } from "../../lib/sound";

export default function ShareButton({ restaurant }) {
  const [status, setStatus] = useState(null);

  async function handleClick() {
    const result = await shareRestaurant(restaurant);
    if (result === "shared" || result === "copied") {
      logEvent("Shared", restaurant);
      playShareSound();
    }
    if (result === "copied") {
      setStatus("Link copied");
      setTimeout(() => setStatus(null), 2000);
    }
  }

  return (
    <button type="button" className="action-btn" onClick={handleClick}>
      ⤴ {status || "Share"}
    </button>
  );
}
