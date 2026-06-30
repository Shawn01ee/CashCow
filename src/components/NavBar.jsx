// NavBar.jsx — Buttercream sidebar (desktop) + bottom nav (mobile).
import { colors as C, radius as R, font } from "../theme/tokens";
import { useLang } from "../i18n";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "add", label: "Add", icon: "➕" },
  { key: "transactions", label: "Activity", icon: "📒" },
  { key: "insights", label: "Insights", icon: "📊" },
  { key: "guide", label: "Guide", icon: "📖" },
];

const DESKTOP_ITEMS = [
  ...NAV_ITEMS.slice(0, 4),
  { key: "fixed", label: "Fixed payments", icon: "🔁" },
  { key: "accounts", label: "Accounts", icon: "🏦" },
  { key: "guide", label: "Guide", icon: "📖" },
];

export default function NavBar({ page, onNavigate, user, onSignOut }) {
  const { t } = useLang();
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="cc-sidebar"
        style={{
          width: 236,
          flexShrink: 0,
          background: C.card,
          borderRight: `1px solid ${C.border}`,
          flexDirection: "column",
          padding: "26px 18px",
          fontFamily: font.family,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 26px" }}>
          <img src="/mascot.png" alt="CashCow" style={{ width: 38, height: 38, borderRadius: R.md, objectFit: "cover" }} />
          <span style={{ fontSize: 19, fontWeight: 800, color: C.ink, letterSpacing: "-.02em" }}>CashCow</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {DESKTOP_ITEMS.map((item) => {
            const active = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 14, cursor: "pointer",
                  fontSize: 15, border: "none", textAlign: "left",
                  fontFamily: "inherit",
                  background: active ? C.greenSoft : "transparent",
                  color: active ? C.greenDark : C.sub,
                  fontWeight: active ? 700 : 600,
                }}
              >
                <span style={{ fontSize: 17 }}>{item.icon}</span>
                {t(item.label)}
              </button>
            );
          })}
        </div>
        {/* user + logout */}
        <div style={{ marginTop: "auto", background: C.bg, borderRadius: R.lg, padding: 14 }}>
          <div style={{ fontSize: 12, color: C.muted }}>{t("Signed in as")}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email}
          </div>
          <button
            onClick={onSignOut}
            style={{
              marginTop: 10, width: "100%", border: `1px solid ${C.border}`,
              background: "#fff", color: C.sub, borderRadius: R.md,
              padding: "8px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            ↪ {t("Log out")}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="cc-bottomnav" style={{ fontFamily: font.family }}>
        {NAV_ITEMS.map((item) => {
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                gap: 2, padding: "6px 0", border: "none", background: "transparent",
                cursor: "pointer", fontFamily: "inherit",
                fontSize: 11, fontWeight: 600,
                color: active ? C.greenDark : C.sub,
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {t(item.label)}
            </button>
          );
        })}
      </nav>
    </>
  );
}
