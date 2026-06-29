// TransactionsList.jsx — Buttercream activity list, grouped by date.
import { useState } from "react";
import { formatMoney } from "../utils/calculations";
import { colors as C, radius as R } from "../theme/tokens";

const FILTERS = ["All", "Income", "Expense", "Transfer", "Fixed", "Variable"];
const RATING_CHIPS = [
  { key: "good", icon: "✅", bg: "#E4F6EC", border: "#1A9D63" },
  { key: "warn", icon: "⚠️", bg: "#FFF3D6", border: "#B26A00" },
  { key: "bad", icon: "❌", bg: "#FFE9E2", border: "#FF7A59" },
];

export default function TransactionsList({ transactions, accounts, categories, onEdit, onDelete, onRate }) {
  const [filter, setFilter] = useState("All");
  const [accountFilter, setAccountFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);

  const iconFor = (name) => categories.find((c) => c.name === name)?.icon || "💵";
  const accountName = (id) => accounts.find((a) => a.id === id)?.name || "Unknown";

  function confirmDelete() {
    if (pendingDelete) onDelete(pendingDelete.id);
    setPendingDelete(null);
  }

  const filtered = transactions.filter((t) => {
    // type / fixed filter
    if (filter === "Income" && t.type !== "income") return false;
    if (filter === "Expense" && t.type !== "expense") return false;
    if (filter === "Transfer" && t.type !== "transfer") return false;
    if (filter === "Fixed" && !t.isFixed) return false;
    if (filter === "Variable" && (t.type === "transfer" || t.isFixed)) return false;
    // per-account filter (matches the from OR to account of a transfer)
    if (accountFilter !== "all" && t.accountId !== accountFilter && t.toAccountId !== accountFilter) {
      return false;
    }
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

      {/* Per-account filter */}
      {accounts.length > 1 && (
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          style={{ alignSelf: "flex-start", borderRadius: R.full, border: `1px solid ${C.border}`, background: "#fff", padding: "8px 14px", fontSize: 13, fontWeight: 700, color: C.ink, fontFamily: "inherit", cursor: "pointer" }}
        >
          <option value="all">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      )}

      {sortedDates.length === 0 ? (
        <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>No transactions match this filter.</p>
      ) : (
        sortedDates.map((date) => (
          <section key={date}>
            <h2 style={{ margin: "0 2px 8px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: C.muted }}>{date}</h2>
            <div style={{ ...card, padding: "4px 16px" }}>
              {groups[date].map((tx) => {
                const isTransfer = tx.type === "transfer";
                const isExpense = tx.type === "expense";
                return (
                  <div key={tx.id} style={{ borderBottom: `1px solid ${C.divider}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12, paddingBottom: isExpense ? 4 : 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: R.md, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>
                        {isTransfer ? "🔄" : iconFor(tx.category)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {tx.memo || (isTransfer ? "Transfer" : tx.category)}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {isTransfer
                            ? `${accountName(tx.accountId)} → ${accountName(tx.toAccountId)}`
                            : `${tx.category} · ${accountName(tx.accountId)} · ${tx.isFixed ? "Fixed" : "Variable"}`}
                        </div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: "nowrap", color: isTransfer ? "#4666CC" : tx.type === "income" ? C.greenDark : C.ink }}>
                        {isTransfer ? "" : tx.type === "income" ? "+" : "−"}{formatMoney(tx.amount, tx.currency)}
                      </div>
                      <div style={{ display: "flex", gap: 2 }}>
                        <button onClick={() => onEdit(tx)} aria-label="Edit" style={iconBtn}>✏️</button>
                        <button onClick={() => setPendingDelete(tx)} aria-label="Delete" style={iconBtn}>🗑️</button>
                      </div>
                    </div>

                    {/* Inline quick-rating for expenses */}
                    {isExpense && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 56, paddingBottom: 12 }}>
                        {!tx.rating && <span style={{ fontSize: 11, color: C.muted, marginRight: 2 }}>Worth it?</span>}
                        {RATING_CHIPS.map((r) => {
                          const active = tx.rating === r.key;
                          return (
                            <button
                              key={r.key}
                              onClick={() => onRate(tx.id, r.key)}
                              aria-label={r.key}
                              style={{ border: `1px solid ${active ? r.border : C.border}`, background: active ? r.bg : "#fff", borderRadius: 999, padding: "3px 11px", fontSize: 14, cursor: "pointer", fontFamily: "inherit", opacity: active ? 1 : 0.45, transition: "all .15s" }}
                            >
                              {r.icon}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
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
