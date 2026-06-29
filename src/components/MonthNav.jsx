// MonthNav.jsx — ‹ June 2026 › month selector, or ‹ 2026 › when granularity="year".
import { colors as C, radius as R } from "../theme/tokens";

export default function MonthNav({ monthDate, onChange, granularity = "month" }) {
  const isYear = granularity === "year";
  const label = isYear
    ? String(monthDate.getFullYear())
    : monthDate.toLocaleString("en", { month: "long", year: "numeric" });

  function shift(n) {
    const d = new Date(monthDate);
    if (isYear) d.setFullYear(d.getFullYear() + n, d.getMonth(), 1);
    else d.setMonth(d.getMonth() + n, 1); // 1st of month avoids day overflow
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
      <button onClick={() => shift(-1)} aria-label="Previous" style={arrow}>‹</button>
      <span style={{ fontSize: 14, fontWeight: 800, color: C.ink, minWidth: isYear ? 52 : 116, textAlign: "center" }}>
        📅 {label}
      </span>
      <button onClick={() => shift(1)} aria-label="Next" style={arrow}>›</button>
    </div>
  );
}
