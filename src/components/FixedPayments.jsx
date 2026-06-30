// FixedPayments.jsx — Buttercream recurring bills management.
import { useState } from "react";
import { formatMoney, daysUntil } from "../utils/calculations";
import { colors as C, radius as R } from "../theme/tokens";
import { useLang } from "../i18n";

const FREQUENCIES = ["weekly", "fortnightly", "monthly", "8-weekly", "yearly"];

const FREQ_LABEL_EN = {
  weekly: "Weekly (every week)",
  fortnightly: "Fortnightly (every 2 weeks)",
  "8-weekly": "Every 8 weeks",
  monthly: "Monthly",
  yearly: "Yearly",
};
const FREQ_LABEL_KO = {
  weekly: "매주",
  fortnightly: "격주 · 2주마다",
  "8-weekly": "8주마다",
  monthly: "매월",
  yearly: "연간",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

// How much a payment costs per month (AUD only; one-off payments don't recur).
function monthlyEquivalent(fp) {
  if (fp.currency !== "AUD") return 0;
  if (fp.frequency === "weekly")      return (fp.amount * 52) / 12;
  if (fp.frequency === "fortnightly") return (fp.amount * 26) / 12;
  if (fp.frequency === "4-weekly")    return (fp.amount * 13) / 12;
  if (fp.frequency === "8-weekly")    return (fp.amount * 6.5) / 12;
  if (fp.frequency === "monthly")     return fp.amount;
  if (fp.frequency === "yearly")      return fp.amount / 12;
  return 0; // once
}

export default function FixedPayments({ fixedPayments, accounts, categories, onAdd, onUpdate, onDelete, onMarkPaid, onNavigate }) {
  const { t, lang } = useLang();
  const ko = lang === "ko";
  const FREQ_LABEL = ko ? FREQ_LABEL_KO : FREQ_LABEL_EN;
  const [tab, setTab] = useState("expense"); // "expense" | "income"
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDueDate, setNextDueDate] = useState(today());

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  if (accounts.length === 0) {
    return (
      <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>{t("Fixed payments")}</h1>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 30 }}>🏦</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 8 }}>{t("Add an account first")}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{t("Fixed payments come out of an account, so you'll need one first.")}</div>
          <button onClick={() => onNavigate("accounts")} style={{ marginTop: 16, border: "none", background: C.green, color: "#fff", borderRadius: R.md, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{t("Go to Accounts")}</button>
        </div>
      </div>
    );
  }

  function resetForm() {
    setEditing(null); setShowForm(false); setKind(tab); setName(""); setAmount(""); setCurrency("AUD");
    setAccountId(accounts[0]?.id || ""); setCategory(""); setFrequency("monthly"); setNextDueDate(today());
  }
  function openAdd() { resetForm(); setKind(tab); setShowForm(true); }
  function openEdit(fp) {
    setEditing(fp); setKind(fp.kind || "expense"); setName(fp.name); setAmount(String(fp.amount)); setCurrency(fp.currency);
    setAccountId(fp.accountId || accounts[0]?.id || ""); setCategory(fp.category || "");
    setFrequency(fp.frequency); setNextDueDate(fp.nextDueDate); setShowForm(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim() || !amt || amt <= 0) return;
    const payload = { name: name.trim(), amount: amt, currency, accountId, category, frequency, nextDueDate, kind };
    if (editing) onUpdate({ ...editing, ...payload });
    else onAdd(payload);
    resetForm();
  }

  const field = { width: "100%", borderRadius: R.md, border: `1.5px solid ${C.border}`, background: "#fff", padding: "12px 14px", fontSize: 14, color: C.ink, outline: "none", fontFamily: "inherit" };
  const labelCls = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: C.sub };

  const allExpenses = fixedPayments.filter((fp) => (fp.kind || "expense") === "expense");
  const allIncomes = fixedPayments.filter((fp) => fp.kind === "income");
  const sorted = [...(tab === "income" ? allIncomes : allExpenses)].sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

  // Subscription-style summary (AUD recurring expenses only).
  const recurringExpenses = allExpenses.filter((fp) => fp.frequency !== "once" && fp.currency === "AUD");
  const monthlyExpTotal = recurringExpenses.reduce((s, fp) => s + monthlyEquivalent(fp), 0);
  const yearlyExpTotal = monthlyExpTotal * 12;
  const soonCount = allExpenses.filter((fp) => daysUntil(fp.nextDueDate) <= 7).length;

  const recurringIncomes = allIncomes.filter((fp) => fp.frequency !== "once" && fp.currency === "AUD");
  const monthlyIncTotal = recurringIncomes.reduce((s, fp) => s + monthlyEquivalent(fp), 0);

  const INCOME_SOURCES = [
    { key: "Scholarship", icon: "🎓", label: ko ? "장학금" : "Scholarship" },
    { key: "Part-time Job", icon: "💼", label: ko ? "알바" : "Part-time Job" },
    { key: "Family Support", icon: "👨‍👩‍👧", label: ko ? "가족 지원" : "Family Support" },
    { key: "Other Income", icon: "💰", label: ko ? "기타 수입" : "Other Income" },
  ];

  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>{ko ? "고정 내역" : "Fixed"}</h1>
        <button onClick={() => (showForm ? resetForm() : openAdd())} style={{ border: "none", background: C.green, color: "#fff", borderRadius: R.md, padding: "10px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {showForm ? t("Close") : t("+ Add")}
        </button>
      </div>

      {/* Expense / Income tab */}
      <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 11, padding: 4, alignSelf: "flex-start" }}>
        {[
          { key: "expense", label: ko ? "지출" : "Bills", color: C.coral, activeBg: "#FFE9E2" },
          { key: "income", label: ko ? "수입" : "Income", color: C.greenDark, activeBg: C.greenSoft },
        ].map(({ key, label, color, activeBg }) => (
          <button
            key={key}
            onClick={() => { setTab(key); if (showForm) resetForm(); }}
            style={{ padding: "7px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: tab === key ? activeBg : "transparent", color: tab === key ? color : C.sub, transition: "all .15s" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bills summary card */}
      {tab === "expense" && monthlyExpTotal > 0 && (
        <div style={{ background: C.ink, borderRadius: R["2xl"], padding: "22px 24px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: "#D9CFBE", fontWeight: 600 }}>{t("Recurring per month")}</div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em", margin: "4px 0" }}>{formatMoney(monthlyExpTotal)}</div>
            <div style={{ fontSize: 13, color: C.butter, fontWeight: 700 }}>
              {ko ? `반복 ${recurringExpenses.length}개 · 연 약 ${formatMoney(yearlyExpTotal)}` : `${recurringExpenses.length} recurring · ~${formatMoney(yearlyExpTotal)}/year`}
            </div>
          </div>
          {soonCount > 0 && (
            <div style={{ background: C.butter, color: "#5A4000", padding: "8px 14px", borderRadius: R.md, fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
              {ko ? `${soonCount}건 곧 결제` : `${soonCount} due soon`}
            </div>
          )}
        </div>
      )}

      {/* Income summary card */}
      {tab === "income" && monthlyIncTotal > 0 && (
        <div style={{ background: "#1A9D63", borderRadius: R["2xl"], padding: "22px 24px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: "#B8F0D8", fontWeight: 600 }}>{ko ? "매월 예정 수입" : "Expected per month"}</div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em", margin: "4px 0" }}>{formatMoney(monthlyIncTotal)}</div>
            <div style={{ fontSize: 13, color: "#E4F6EC", fontWeight: 700 }}>
              {ko ? `${recurringIncomes.length}개 항목` : `${recurringIncomes.length} source${recurringIncomes.length === 1 ? "" : "s"}`}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelCls}>{t("Name")}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder={kind === "income" ? (ko ? "예: 장학금" : "e.g. Scholarship") : t("e.g. Next Rent")}
              style={field} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
            <div><label style={labelCls}>{t("How much?")}</label><input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={field} /></div>
            <div><label style={labelCls}>{t("Currency")}</label><select value={currency} onChange={(e) => setCurrency(e.target.value)} style={field}><option value="AUD">AUD</option><option value="KRW">KRW</option></select></div>
          </div>
          <div><label style={labelCls}>{t("Account")}</label><select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={field}>{accounts.map((a) => (<option key={a.id} value={a.id}>{a.name} ({a.currency})</option>))}</select></div>
          {kind === "income" ? (
            <div><label style={labelCls}>{ko ? "수입 종류" : "Income source"}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={field}>
                <option value="">{t("Select…")}</option>
                {INCOME_SOURCES.map((s) => (<option key={s.key} value={s.key}>{s.icon} {s.label}</option>))}
              </select>
            </div>
          ) : (
            <div><label style={labelCls}>{t("Category")}</label><select value={category} onChange={(e) => setCategory(e.target.value)} style={field}><option value="">{t("Select…")}</option>{expenseCategories.map((c) => (<option key={c.id} value={c.name}>{c.icon} {t(c.name)}</option>))}</select></div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><label style={labelCls}>{ko ? "주기" : "Frequency"}</label><select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={field}>{FREQUENCIES.map((f) => (<option key={f} value={f}>{FREQ_LABEL[f]}</option>))}</select></div>
            <div><label style={labelCls}>{kind === "income" ? (ko ? "다음 수입일" : "Next pay date") : t("Next due date")}</label><input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} style={field} /></div>
          </div>
          <button type="submit" style={{ border: "none", background: kind === "income" ? C.green : C.ink, color: "#fff", borderRadius: R.md, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {editing ? t("Save changes") : kind === "income" ? (ko ? "수입 추가" : "Add income") : (ko ? "지출 추가" : "Add bill")}
          </button>
        </form>
      )}

      {sorted.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 28 }}>{tab === "income" ? "💰" : "🏠"}</div>
          <div style={{ fontSize: 14, color: C.ink, marginTop: 8 }}>
            {tab === "income"
              ? (ko ? "아직 고정 수입이 없어요." : "No fixed income yet.")
              : t("No fixed payments yet.")}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {tab === "income"
              ? (ko ? "장학금, 알바비, 가족 지원 등 주기적인 수입을 등록해보세요." : "Add scholarship, part-time pay, or family support.")
              : t("Add your rent or phone bill so CashCow knows what's coming up.")}
          </div>
        </div>
      ) : (
        sorted.map((fp) => {
          const days = daysUntil(fp.nextDueDate);
          const acc = accounts.find((a) => a.id === fp.accountId);
          const isIncome = fp.kind === "income";
          return (
            <div key={fp.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fp.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {fp.category ? t(fp.category) : (isIncome ? (ko ? "수입" : "Income") : t("No category"))} · {acc ? acc.name : t("no account")} · {t(fp.frequency)}
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
                    {ko
                      ? `${fp.nextDueDate} ${isIncome ? "수입" : "결제"} · ${days}일 후`
                      : `${isIncome ? "Expected" : "Due"} ${fp.nextDueDate} · in ${days} day${days === 1 ? "" : "s"}`}
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: isIncome ? C.greenDark : C.coral, whiteSpace: "nowrap" }}>
                  {isIncome ? "+" : ""}{formatMoney(fp.amount, fp.currency)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {!isIncome && <button onClick={() => onMarkPaid(fp)} style={{ flex: 1, border: `1px solid #BFE9D2`, background: C.greenSoft, color: C.greenDark, borderRadius: R.md, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✓ {t("Paid")}</button>}
                {isIncome && <button onClick={() => onMarkPaid(fp)} style={{ flex: 1, border: `1px solid #BFE9D2`, background: C.greenSoft, color: C.greenDark, borderRadius: R.md, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ {ko ? "받음" : "Received"}</button>}
                <button onClick={() => openEdit(fp)} style={{ border: `1px solid ${C.border}`, background: "#fff", color: C.sub, borderRadius: R.md, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{t("Edit")}</button>
                <button onClick={() => onDelete(fp.id)} style={{ border: `1px solid ${C.border}`, background: "#fff", color: C.muted, borderRadius: R.md, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{t("Delete")}</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
