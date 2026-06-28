// Layout.jsx — Buttercream app frame (sidebar/bottom-nav + content).
import NavBar from "./NavBar";
import { font } from "../theme/tokens";

export default function Layout({ page, onNavigate, user, onSignOut, children }) {
  return (
    <div className="cc-shell" style={{ fontFamily: font.family }}>
      <NavBar page={page} onNavigate={onNavigate} user={user} onSignOut={onSignOut} />
      <main className="cc-main">
        <div style={{ maxWidth: 960, margin: "0 auto", width: "100%" }}>{children}</div>
      </main>
    </div>
  );
}
