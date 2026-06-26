// NavBar.jsx
// Two navigations in one component:
//   - a vertical sidebar on desktop (md and up)
//   - a fixed bottom bar on mobile
// We render both and use Tailwind's responsive classes to show/hide them.

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "add", label: "Add", icon: "➕" },
  { key: "transactions", label: "Activity", icon: "📒" },
  { key: "insights", label: "Insights", icon: "📊" },
  { key: "accounts", label: "Accounts", icon: "🏦" },
];

export default function NavBar({ page, onNavigate }) {
  return (
    <>
      {/* ---------- Desktop sidebar ---------- */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:h-screen md:sticky md:top-0 border-r border-neutral-800 bg-neutral-950 p-4">
        <div className="flex items-center gap-2 px-2 py-4 text-2xl font-bold">
          <span>🐮</span>
          <span className="text-white">CashCow</span>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                page === item.key
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <p className="mt-auto px-3 py-2 text-xs text-neutral-600">
          v0.1 · your money, made simple
        </p>
      </aside>

      {/* ---------- Mobile bottom bar ---------- */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur flex justify-around px-1 py-1.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
              page === item.key ? "text-emerald-400" : "text-neutral-500"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
