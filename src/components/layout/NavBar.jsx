import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="nav-bar">
      <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
        <span aria-hidden="true">🏠</span>
        <span>Home</span>
      </NavLink>
      <NavLink to="/saved" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
        <span aria-hidden="true">♥</span>
        <span>Saved</span>
      </NavLink>
    </nav>
  );
}
