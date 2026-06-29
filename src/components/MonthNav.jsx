// MonthNav.jsx — ‹ June 2026 › month selector.
// monthDate is a Date (any day in the month); onChange gets the new month.
import { colors as C, radius as R } from "../theme/tokens";

export default function MonthNav({ monthDate, onChange }) {
  const label = monthDate.toLocaleString("en", { month: "long", year: "numeric" });

  function shift(n) {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + n, 1); // 1st of the month avoids day overflow
    onChange(d);
  }

  const arrow = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
    color: C.sub,
    padding: "0 6px",
    fontFamily: "inherit",
    lineHeight: 1,
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff", border: `1px solid ${C.border}`, borderRadius: R.full, padding: "6px 8px" }}>
      <button onClick={() => shift(-1)} aria-label="Previous month" style={arrow}>‹</button>
      <span style={{ fontSize: 14, fontWeight: 800, color: C.ink, minWidth: 116, textAlign: "center" }}>
        📅 {label}
      </span>
      <button onClick={() => shift(1)} aria-label="Next month" style={arrow}>›</button>
    </div>
  );
}
