import { useCallback, useState } from "react";

const KEY = "savedPlaces";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [ids, setIds] = useState(load);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors (private mode, quota, etc.)
      }
      return next;
    });
  }, []);

  const isSaved = useCallback((id) => ids.includes(id), [ids]);

  return { ids, isSaved, toggle };
}
