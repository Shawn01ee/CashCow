// StatCard.jsx — small white card with a number, label, and optional hint.
import { colors as C, radius as R } from "../theme/tokens";

export default function StatCard({ label, value, hint, tone = "default" }) {
  const valueColor =
    tone === "positive" ? C.greenDark : tone === "negative" ? C.coral : C.ink;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 18 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.muted }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 800, color: valueColor, letterSpacing: "-.02em" }}>
        {value}
      </p>
      {hint && <p style={{ margin: "6px 0 0", fontSize: 12, lineHeight: 1.4, color: C.muted }}>{hint}</p>}
    </div>
  );
}
