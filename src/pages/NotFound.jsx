import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="empty-state">
      <p>This page wandered off the map.</p>
      <Link to="/" className="action-btn">
        Back to Home
      </Link>
    </div>
  );
}
