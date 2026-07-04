import { createContext, useContext } from "react";

export const IntroContext = createContext(() => {});

export function useShowIntro() {
  return useContext(IntroContext);
}
