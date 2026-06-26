// StatCard.jsx
// A small reusable card that shows one number with a label and an optional
// one-line explanation underneath. Used all over the dashboard and insights.
//
// Props:
//   label   - small grey title, e.g. "This month income"
//   value   - the big number/text, e.g. "$500.00"
//   hint    - optional friendly explanation line
//   tone    - "default" | "positive" | "negative" — colours the value

export default function StatCard({ label, value, hint, tone = "default" }) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
      ? "text-red-400"
      : "text-white";

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
      <p className="text-xs font-medium text-neutral-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs leading-snug text-neutral-500">{hint}</p>}
    </div>
  );
}
