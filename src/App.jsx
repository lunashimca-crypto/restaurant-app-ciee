import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import PageShell from "./components/layout/PageShell";
import Intro from "./pages/Intro";
import Home from "./pages/Home";
import ExplorePage from "./pages/ExplorePage";
import CollectionPage from "./pages/CollectionPage";
import RestaurantDetail from "./pages/RestaurantDetail";
import SavedPlaces from "./pages/SavedPlaces";
import NotFound from "./pages/NotFound";
import { IntroContext } from "./lib/introContext";

const INTRO_KEY = "introSeen";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem(INTRO_KEY);
    } catch {
      return true;
    }
  });

  function handleEnter() {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // ignore storage errors (private mode, etc.)
    }
    setShowIntro(false);
  }

  function handleShowIntro() {
    try {
      sessionStorage.removeItem(INTRO_KEY);
    } catch {
      // ignore storage errors (private mode, etc.)
    }
    setShowIntro(true);
  }

  if (showIntro) {
    return (
      <div className="app">
        <Intro onEnter={handleEnter} />
      </div>
    );
  }

  return (
    <IntroContext.Provider value={handleShowIntro}>
      <HashRouter>
        <Routes>
          <Route element={<PageShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore/:hood" element={<ExplorePage />} />
            <Route path="/collection/:slug" element={<CollectionPage />} />
            <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
            <Route path="/saved" element={<SavedPlaces />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </IntroContext.Provider>
  );
}
