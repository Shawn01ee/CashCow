// FixedPayments.jsx — Buttercream recurring bills management.
import { useState } from "react";
import { formatMoney, daysUntil } from "../utils/calculations";
import { colors as C, radius as R } from "../theme/tokens";

const FREQUENCIES = ["weekly", "fortnightly", "monthly", "once"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

// How much a payment costs per month (AUD only; one-off payments don't recur).
function monthlyEquivalent(fp) {
  if (fp.currency !== "AUD") return 0;
  if (fp.frequency === "weekly") return (fp.amount * 52) / 12;
  if (fp.frequency === "fortnightly") return (fp.amount * 26) / 12;
  if (fp.frequency === "monthly") return fp.amount;
  return 0; // once
}

export default function FixedPayments({ fixedPayments, accounts, categories, onAdd, onUpdate, onDelete, onMarkPaid, onNavigate }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDueDate, setNextDueDate] = useState(today());

  const expenseCategories = categories.filter((c) => c.type === "expense");

  if (accounts.length === 0) {
    return (
      <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>Fixed payments</h1>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 30 }}>🏦</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 8 }}>Add an account first</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Fixed payments come out of an account, so you'll need one first.</div>
          <button onClick={() => onNavigate("accounts")} style={{ marginTop: 16, border: "none", background: C.green, color: "#fff", borderRadius: R.md, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Go to Accounts</button>
        </div>
      </div>
    );
  }

  function resetForm() {
    setEditing(null); setShowForm(false); setName(""); setAmount(""); setCurrency("AUD");
    setAccountId(accounts[0]?.id || ""); setCategory(""); setFrequency("monthly"); setNextDueDate(today());
  }
  function openAdd() { resetForm(); setShowForm(true); }
  function openEdit(fp) {
    setEditing(fp); setName(fp.name); setAmount(String(fp.amount)); setCurrency(fp.currency);
    setAccountId(fp.accountId || accounts[0]?.id || ""); setCategory(fp.category || "");
    setFrequency(fp.frequency); setNextDueDate(fp.nextDueDate); setShowForm(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim() || !amt || amt <= 0) return;
    const payload = { name: name.trim(), amount: amt, currency, accountId, category, frequency, nextDueDate };
    if (editing) onUpdate({ ...editing, ...payload });
    else onAdd(payload);
    resetForm();
  }

  const field = { width: "100%", borderRadius: R.md, border: `1.5px solid ${C.border}`, background: "#fff", padding: "12px 14px", fontSize: 14, color: C.ink, outline: "none", fontFamily: "inherit" };
  const labelCls = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.sub };

  const sorted = [...fixedPayments].sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

  // Subscription-style summary (AUD recurring only).
  const recurring = fixedPayments.filter((fp) => fp.frequency !== "once" && fp.currency === "AUD");
  const monthlyTotal = recurring.reduce((s, fp) => s + monthlyEquivalent(fp), 0);
  const yearlyTotal = monthlyTotal * 12;
  const soonCount = fixedPayments.filter((fp) => daysUntil(fp.nextDueDate) <= 7).length;

  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>Fixed payments</h1>
        <button onClick={() => (showForm ? resetForm() : openAdd())} style={{ border: "none", background: C.green, color: "#fff", borderRadius: R.md, padding: "10px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {showForm ? "Close" : "+ Add"}
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 14, color: C.sub, lineHeight: 1.5 }}>
        Rent, phone, subscriptions: the bills you can't skip. Tap "Paid" when one goes out and CashCow logs it and moves the date forward.
      </p>

      {/* Subscription-style summary */}
      {monthlyTotal > 0 && (
        <div style={{ background: C.ink, borderRadius: R["2xl"], padding: "22px 24px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: "#D9CFBE", fontWeight: 600 }}>Recurring per month</div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em", margin: "4px 0" }}>{formatMoney(monthlyTotal)}</div>
            <div style={{ fontSize: 13, color: C.butter, fontWeight: 700 }}>
              {recurring.length} recurring · ~{formatMoney(yearlyTotal)}/year
            </div>
          </div>
          {soonCount > 0 && (
            <div style={{ background: C.butter, color: "#5A4000", padding: "8px 14px", borderRadius: R.md, fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
              {soonCount} due soon
            </div>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelCls}>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Next Rent" style={field} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
            <div><label style={labelCls}>Amount</label><input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={field} /></div>
            <div><label style={labelCls}>Currency</label><select value={currency} onChange={(e) => setCurrency(e.target.value)} style={field}><option value="AUD">AUD</option><option value="KRW">KRW</option></select></div>
          </div>
          <div><label style={labelCls}>Account</label><select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={field}>{accounts.map((a) => (<option key={a.id} value={a.id}>{a.name} ({a.currency})</option>))}</select></div>
          <div><label style={labelCls}>Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} style={field}><option value="">Select…</option>{expenseCategories.map((c) => (<option key={c.id} value={c.name}>{c.icon} {c.name}</option>))}</select></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><label style={labelCls}>Frequency</label><select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={field}>{FREQUENCIES.map((f) => (<option key={f} value={f}>{f}</option>))}</select></div>
            <div><label style={labelCls}>Next due date</label><input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} style={field} /></div>
          </div>
          <button type="submit" style={{ border: "none", background: C.green, color: "#fff", borderRadius: R.md, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {editing ? "Save changes" : "Add fixed payment"}
          </button>
        </form>
      )}

      {sorted.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 28 }}>🏠</div>
          <div style={{ fontSize: 14, color: C.ink, marginTop: 8 }}>No fixed payments yet.</div>
          <div style={{ fontSize: 12, color: C.muted }}>Add your rent or phone bill so CashCow knows what's coming up.</div>
        </div>
      ) : (
        sorted.map((fp) => {
          const days = daysUntil(fp.nextDueDate);
          const acc = accounts.find((a) => a.id === fp.accountId);
          return (
            <div key={fp.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fp.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fp.category || "No category"} · {acc ? acc.name : "no account"} · <span style={{ textTransform: "capitalize" }}>{fp.frequency}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>Due {fp.nextDueDate} · in {days} day{days === 1 ? "" : "s"}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.coral, whiteSpace: "nowrap" }}>{formatMoney(fp.amount, fp.currency)}</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => onMarkPaid(fp)} style={{ flex: 1, border: `1px solid #BFE9D2`, background: C.greenSoft, color: C.greenDark, borderRadius: R.md, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✓ Paid</button>
                <button onClick={() => openEdit(fp)} style={{ border: `1px solid ${C.border}`, background: "#fff", color: C.sub, borderRadius: R.md, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                <button onClick={() => onDelete(fp.id)} style={{ border: `1px solid ${C.border}`, background: "#fff", color: C.muted, borderRadius: R.md, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
