import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import NavBar from "./NavBar";

export default function PageShell() {
  const [title, setTitle] = useState("");

  return (
    <div className="app">
      <Header title={title} />
      <main className="app-main">
        <Outlet context={setTitle} />
      </main>
      <NavBar />
    </div>
  );
}
