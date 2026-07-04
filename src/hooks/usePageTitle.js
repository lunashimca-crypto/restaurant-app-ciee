import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export function usePageTitle(title) {
  const setTitle = useOutletContext();
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
}
