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
  const [pendingDelete, setPendingDelete] = useState(null); // tx awaiting confirm

  function confirmDelete() {
    if (pendingDelete) onDelete(pendingDelete.id);
    setPendingDelete(null);
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
                      onClick={() => setPendingDelete(tx)}
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

      {/* In-app delete confirmation (replaces window.confirm) */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-neutral-900 p-5 ring-1 ring-neutral-700"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-white">Delete this transaction?</p>
            <p className="mt-1 text-xs text-neutral-400">
              “{pendingDelete.memo || pendingDelete.category}” ·{" "}
              {pendingDelete.type === "income" ? "+" : "-"}
              {formatMoney(pendingDelete.amount, pendingDelete.currency)}. The account
              balance will be adjusted back.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-sm font-medium text-neutral-300 ring-1 ring-neutral-700 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
