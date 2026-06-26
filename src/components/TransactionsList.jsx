// TransactionsList.jsx
// Shows all transactions grouped by date, with filter chips on top.
import { useState } from "react";
import { formatMoney } from "../utils/calculations";

const FILTERS = ["All", "Income", "Expense", "Fixed", "Variable"];

export default function TransactionsList({
  transactions,
  accounts,
  categories,
  onEdit,
  onDelete,
}) {
  const [filter, setFilter] = useState("All");

  // Ask before permanently removing a transaction.
  function handleDelete(tx) {
    const ok = window.confirm(
      `Delete "${tx.memo || tx.category}" (${tx.type === "income" ? "+" : "-"}${
        tx.amount
      })? This also adjusts the account balance back.`
    );
    if (ok) onDelete(tx.id);
  }

  // Helper lookups so each row can show icon + account name.
  const iconFor = (name) => categories.find((c) => c.name === name)?.icon || "💵";
  const accountName = (id) => accounts.find((a) => a.id === id)?.name || "Unknown";

  // Apply the active filter.
  const filtered = transactions.filter((t) => {
    if (filter === "Income") return t.type === "income";
    if (filter === "Expense") return t.type === "expense";
    if (filter === "Fixed") return t.isFixed;
    if (filter === "Variable") return !t.isFixed;
    return true; // "All"
  });

  // Group the filtered list by date into an object: { "2026-06-26": [tx, tx] }
  const groups = {};
  for (const tx of filtered) {
    (groups[tx.date] ||= []).push(tx);
  }
  // Sort dates newest-first.
  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Activity</h1>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition-colors ${
              filter === f
                ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/40"
                : "bg-neutral-800 text-neutral-400 ring-neutral-700 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {sortedDates.length === 0 ? (
        <p className="text-sm text-neutral-500">No transactions match this filter.</p>
      ) : (
        sortedDates.map((date) => (
          <section key={date}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {date}
            </h2>
            <ul className="space-y-2">
              {groups[date].map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center gap-3 rounded-2xl bg-neutral-900 p-3 ring-1 ring-neutral-800"
                >
                  <span className="text-2xl">{iconFor(tx.category)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {tx.memo || tx.category}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {tx.category} · {accountName(tx.accountId)} ·{" "}
                      {tx.isFixed ? "Fixed" : "Variable"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold ${
                      tx.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatMoney(tx.amount, tx.currency)}
                  </span>

                  {/* Edit + delete actions */}
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => onEdit(tx)}
                      aria-label="Edit"
                      className="rounded-lg px-2 py-1 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(tx)}
                      aria-label="Delete"
                      className="rounded-lg px-2 py-1 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-red-400"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
