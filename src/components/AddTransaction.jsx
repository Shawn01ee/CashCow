// AddTransaction.jsx — Buttercream add/edit form with quick-add chips.
import { useState } from "react";
import { quickAdds } from "../data/sampleData";
import { useToast } from "./Toast";
import { colors as C, radius as R, shadow as S } from "../theme/tokens";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTransaction({ categories, accounts, editingTx, onAdd, onUpdate, onCancel, onNavigate }) {
  const toast = useToast();
  const isEditing = Boolean(editingTx);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState(editingTx?.type || "expense");
  const [amount, setAmount] = useState(editingTx ? String(editingTx.amount) : "");
  const [currency, setCurrency] = useState(editingTx?.currency || "AUD");
  const [category, setCategory] = useState(editingTx?.category || "");
  const [accountId, setAccountId] = useState(editingTx?.accountId || accounts[0]?.id || "");
  const [memo, setMemo] = useState(editingTx?.memo || "");
  const [date, setDate] = useState(editingTx?.date || today());
  const [isFixed, setIsFixed] = useState(editingTx?.isFixed || false);

  const field = {
    width: "100%", borderRadius: R.md, border: `1.5px solid ${C.border}`,
    background: "#fff", padding: "12px 14px", fontSize: 14, color: C.ink,
    outline: "none", fontFamily: "inherit",
  };
  const labelCls = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.sub };

  if (accounts.length === 0) {
    return (
      <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>Add transaction</h1>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 30 }}>🏦</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 8 }}>Add an account first</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Transactions go in and out of an account, so let's create one.</div>
          <button onClick={() => onNavigate("accounts")} style={{ marginTop: 16, border: "none", background: C.green, color: "#fff", borderRadius: R.md, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Go to Accounts
          </button>
        </div>
      </div>
    );
  }

  const visibleCategories = categories.filter((c) => c.type === type);

  function applyQuickAdd(q) {
    setType(q.type);
    setCategory(q.category);
    setAmount(String(q.amount));
    setCurrency("AUD");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) { toast.error("Please enter an amount greater than 0."); return; }
    if (!category) { toast.error("Please pick a category."); return; }

    const tx = {
      id: isEditing ? editingTx.id : `tx-${Date.now()}`,
      type, amount: numericAmount, currency, category, accountId,
      memo: memo.trim(), date, isFixed,
    };
    setSubmitting(true);
    try {
      if (isEditing) await onUpdate(tx);
      else await onAdd(tx);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 18 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>
        {isEditing ? "Edit transaction" : "Add transaction"}
      </h1>

      {!isEditing && (
        <div>
          <p style={labelCls}>Quick add</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {quickAdds.map((q) => (
              <button key={q.label} type="button" onClick={() => applyQuickAdd(q)} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, background: "#fff", borderRadius: R.full, padding: "8px 14px", fontSize: 13, color: C.ink, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                <span>{q.icon}</span> {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* type toggle */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["expense", "income"].map((t) => {
            const active = type === t;
            const activeBg = t === "income" ? C.greenSoft : "#FFE9E2";
            const activeColor = t === "income" ? C.greenDark : C.coral;
            return (
              <button key={t} type="button" onClick={() => { setType(t); setCategory(""); }} style={{ textTransform: "capitalize", borderRadius: R.md, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${active ? activeColor + "55" : C.border}`, background: active ? activeBg : "#fff", color: active ? activeColor : C.sub }}>
                {t}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
          <div>
            <label style={labelCls}>Amount</label>
            <input type="number" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={field} />
          </div>
          <div>
            <label style={labelCls}>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={field}>
              <option value="AUD">AUD</option>
              <option value="KRW">KRW</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelCls}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={field}>
            <option value="">Select a category…</option>
            {visibleCategories.map((c) => (<option key={c.id} value={c.name}>{c.icon} {c.name}</option>))}
          </select>
        </div>

        <div>
          <label style={labelCls}>Account</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={field}>
            {accounts.map((a) => (<option key={a.id} value={a.id}>{a.name} ({a.currency})</option>))}
          </select>
        </div>

        <div>
          <label style={labelCls}>Memo</label>
          <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="e.g. Iced latte" style={field} />
        </div>
        <div>
          <label style={labelCls}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={field} />
        </div>

        {/* fixed toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.card, border: `1px solid ${C.border}`, borderRadius: R.md, padding: "12px 14px" }}>
          <div>
            <div style={{ fontSize: 14, color: C.ink, fontWeight: 700 }}>Fixed payment?</div>
            <div style={{ fontSize: 12, color: C.muted }}>Rent, phone, subscriptions — things you can't easily skip.</div>
          </div>
          <button type="button" onClick={() => setIsFixed((v) => !v)} style={{ position: "relative", height: 26, width: 46, borderRadius: 999, border: "none", cursor: "pointer", background: isFixed ? C.green : "#D9CFBE", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: 3, height: 20, width: 20, borderRadius: "50%", background: "#fff", transition: "transform .15s", transform: isFixed ? "translateX(20px)" : "translateX(0)" }} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {isEditing && (
            <button type="button" onClick={onCancel} style={{ flex: 1, border: `1px solid ${C.border}`, background: "#fff", color: C.sub, borderRadius: R.md, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          )}
          <button type="submit" disabled={submitting} style={{ flex: 1, border: "none", background: C.green, color: "#fff", borderRadius: R.md, padding: "14px", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: submitting ? "none" : S.card, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Saving…" : isEditing ? "Save changes" : "Save transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
