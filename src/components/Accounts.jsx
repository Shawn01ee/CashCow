// Accounts.jsx — Buttercream accounts screen.
import { useState } from "react";
import AccountCard from "./AccountCard";
import { useToast } from "./Toast";
import { useLang } from "../i18n";
import { totalAudBalance, formatMoney } from "../utils/calculations";
import { colors as C, radius as R } from "../theme/tokens";

export default function Accounts({ accounts, onAddAccount, onSetMain, onEditAccount, onDeleteAccount, user, onSignOut }) {
  const toast = useToast();
  const { t, lang } = useLang();
  const ko = lang === "ko";
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [balance, setBalance] = useState("");

  const totalAud = totalAudBalance(accounts);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(ko ? "계좌 이름을 입력해주세요." : "Please give the account a name.");
      return;
    }
    onAddAccount({ id: `acc-${Date.now()}`, name: name.trim(), currency, balance: parseFloat(balance) || 0, isMain: false });
    setName("");
    setBalance("");
    setCurrency("AUD");
    setShowForm(false);
  }

  const field = {
    width: "100%",
    borderRadius: R.md,
    border: `1.5px solid ${C.border}`,
    background: "#fff",
    padding: "12px 14px",
    fontSize: 14,
    color: C.ink,
    outline: "none",
    fontFamily: "inherit",
  };
  const primaryBtn = {
    border: "none",
    cursor: "pointer",
    background: C.green,
    color: "#fff",
    fontWeight: 700,
    borderRadius: R.md,
    fontFamily: "inherit",
  };

  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>{t("Accounts")}</h1>
        <button onClick={() => setShowForm((v) => !v)} style={{ ...primaryBtn, fontSize: 14, padding: "10px 16px" }}>
          {showForm ? t("Close") : t("+ Add")}
        </button>
      </div>

      <p style={{ margin: 0, fontSize: 14, color: C.sub }}>
        {t("Total AUD across all accounts:")}{" "}
        <strong style={{ color: C.ink }}>{formatMoney(totalAud)}</strong>
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Account name (e.g. Wise)")} style={field} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={field}>
              <option value="AUD">AUD</option>
              <option value="KRW">KRW</option>
            </select>
            <input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder={t("Starting balance")} style={field} />
          </div>
          <button type="submit" style={{ ...primaryBtn, fontSize: 14, padding: "11px" }}>{t("Add account")}</button>
        </form>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {accounts.map((acc) => (
          <AccountCard key={acc.id} account={acc} onSetMain={onSetMain} onEditAccount={onEditAccount} onDeleteAccount={onDeleteAccount} />
        ))}
      </div>

      {/* Account / logout */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 18 }}>
        <div style={{ fontSize: 12, color: C.muted }}>{t("Signed in as")}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
        <button
          onClick={onSignOut}
          style={{ marginTop: 12, width: "100%", border: `1px solid ${C.border}`, background: "#fff", color: C.sub, borderRadius: R.md, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          ↪ {t("Log out")}
        </button>
      </div>
    </div>
  );
}
