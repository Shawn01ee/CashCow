// TransactionsList.jsx — Buttercream activity list, grouped by date.
import { useState } from "react";
import { formatMoney } from "../utils/calculations";
import { colors as C, radius as R } from "../theme/tokens";

const FILTERS = ["All", "Income", "Expense", "Fixed", "Variable"];

export default function TransactionsList({ transactions, accounts, categories, onEdit, onDelete }) {
  const [filter, setFilter] = useState("All");
  const [pendingDelete, setPendingDelete] = useState(null);

  const iconFor = (name) => categories.find((c) => c.name === name)?.icon || "💵";
  const accountName = (id) => accounts.find((a) => a.id === id)?.name || "Unknown";

  function confirmDelete() {
    if (pendingDelete) onDelete(pendingDelete.id);
    setPendingDelete(null);
  }

  const filtered = transactions.filter((t) => {
    if (filter === "Income") return t.type === "income";
    if (filter === "Expense") return t.type === "expense";
    if (filter === "Fixed") return t.isFixed;
    if (filter === "Variable") return !t.isFixed;
    return true;
  });

  const groups = {};
  for (const tx of filtered) (groups[tx.date] ||= []).push(tx);
  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

  const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl };
  const iconBtn = { border: "none", background: "transparent", cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 8, fontFamily: "inherit" };

  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>Activity</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: "8px 16px", borderRadius: R.full, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${active ? "transparent" : C.border}`, background: active ? C.ink : "#fff", color: active ? "#fff" : C.sub }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {sortedDates.length === 0 ? (
        <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>No transactions match this filter.</p>
      ) : (
        sortedDates.map((date) => (
          <section key={date}>
            <h2 style={{ margin: "0 2px 8px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: C.muted }}>{date}</h2>
            <div style={{ ...card, padding: "4px 16px" }}>
              {groups[date].map((tx) => (
                <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.divider}` }}>
                  <div style={{ width: 44, height: 44, borderRadius: R.md, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{iconFor(tx.category)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.memo || tx.category}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{tx.category} · {accountName(tx.accountId)} · {tx.isFixed ? "Fixed" : "Variable"}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: tx.type === "income" ? C.greenDark : C.ink, whiteSpace: "nowrap" }}>
                    {tx.type === "income" ? "+" : "−"}{formatMoney(tx.amount, tx.currency)}
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    <button onClick={() => onEdit(tx)} aria-label="Edit" style={iconBtn}>✏️</button>
                    <button onClick={() => setPendingDelete(tx)} aria-label="Delete" style={iconBtn}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {pendingDelete && (
        <div
          onClick={() => setPendingDelete(null)}
          style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(42,37,32,.45)", padding: 16 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: C.card, borderRadius: R.xl, padding: 20, boxShadow: "0 20px 60px rgba(70,55,25,.25)" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>Delete this transaction?</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
              "{pendingDelete.memo || pendingDelete.category}" · {pendingDelete.type === "income" ? "+" : "−"}{formatMoney(pendingDelete.amount, pendingDelete.currency)}. The account balance will be adjusted back.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => setPendingDelete(null)} style={{ flex: 1, border: `1px solid ${C.border}`, background: "#fff", color: C.sub, borderRadius: R.md, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, border: "none", background: C.coral, color: "#fff", borderRadius: R.md, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
