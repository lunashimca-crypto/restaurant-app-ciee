import { useLocation, useNavigate } from "react-router-dom";
import { useShowIntro } from "../../lib/introContext";

export default function Header({ title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const showIntro = useShowIntro();
  const isHome = location.pathname === "/";

  return (
    <header className="app-header">
      {isHome ? (
        <>
          <div className="app-wordmark">
            <div className="app-wordmark-label">Korea Food Guide</div>
            <div className="app-wordmark-sub">A CIEE Restaurant Guide</div>
          </div>
          <button type="button" className="intro-btn" onClick={showIntro}>
            Home
          </button>
        </>
      ) : (
        <>
          <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            ←
          </button>
          <div className="app-header-title">{title}</div>
          <button type="button" className="intro-btn" onClick={showIntro}>
            Home
          </button>
        </>
      )}
    </header>
  );
}
