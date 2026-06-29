// AccountCard.jsx — Buttercream account card: set main, edit (name/currency/
// balance), and delete.
import { useState } from "react";
import { formatMoney } from "../utils/calculations";
import { colors as C, radius as R } from "../theme/tokens";
import { useLang } from "../i18n";

export default function AccountCard({ account, onSetMain, onEditAccount, onDeleteAccount }) {
  const { t, lang } = useLang();
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [name, setName] = useState(account.name);
  const [currency, setCurrency] = useState(account.currency);
  const [balance, setBalance] = useState(String(account.balance));
  const [isProtected, setIsProtected] = useState(account.isProtected || false);
  const [purpose, setPurpose] = useState(account.purpose || "");

  function openEdit() {
    setName(account.name);
    setCurrency(account.currency);
    setBalance(String(account.balance));
    setIsProtected(account.isProtected || false);
    setPurpose(account.purpose || "");
    setConfirmDel(false);
    setEditing(true);
  }

  function save() {
    const num = parseFloat(balance);
    onEditAccount({
      id: account.id,
      name: name.trim() || account.name,
      currency,
      balance: Number.isNaN(num) ? account.balance : num,
      isProtected,
      purpose: purpose.trim(),
    });
    setEditing(false);
  }

  const field = {
    width: "100%", borderRadius: R.md, border: `1.5px solid ${C.border}`,
    background: "#fff", padding: "10px 12px", fontSize: 14, color: C.ink,
    outline: "none", fontFamily: "inherit",
  };
  const btn = (bg, color, border) => ({
    border: border || "none", borderRadius: R.md, padding: "8px",
    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
    background: bg, color,
  });

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 15, fontWeight: 700, color: C.ink }}>
            {account.name}
            {account.isMain && (
              <span style={{ background: C.greenSoft, color: C.greenDark, padding: "2px 8px", borderRadius: R.full, fontSize: 10, fontWeight: 800 }}>MAIN</span>
            )}
            {account.isProtected && (
              <span style={{ background: "#EAF0FF", color: "#4666CC", padding: "2px 8px", borderRadius: R.full, fontSize: 10, fontWeight: 800 }}>🔒 {t("PROTECTED")}</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            {account.currency} {t("account")}{account.purpose ? ` · ${account.purpose}` : ""}
          </div>
        </div>
        {!account.isMain && !editing && (
          <button onClick={() => onSetMain(account.id)} style={btn("#fff", C.sub, `1px solid ${C.border}`)}>
            {t("Set as main")}
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Account name")} style={field} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 8 }}>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={field}>
              <option value="AUD">AUD</option>
              <option value="KRW">KRW</option>
            </select>
            <input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder={t("Balance")} style={field} />
          </div>

          {/* Protected toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg, borderRadius: R.md, padding: "10px 12px" }}>
            <div>
              <div style={{ fontSize: 13, color: C.ink, fontWeight: 700 }}>🔒 {t("Protected money")}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{t("Set aside, excluded from safe to spend.")}</div>
            </div>
            <button type="button" onClick={() => setIsProtected((v) => !v)} style={{ position: "relative", height: 24, width: 42, borderRadius: 999, border: "none", cursor: "pointer", background: isProtected ? "#4666CC" : "#D9CFBE", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 3, left: 3, height: 18, width: 18, borderRadius: "50%", background: "#fff", transition: "transform .15s", transform: isProtected ? "translateX(18px)" : "translateX(0)" }} />
            </button>
          </div>
          {isProtected && (
            <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder={t("What's it for? e.g. Rent reserve")} style={field} />
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing(false)} style={{ ...btn("#fff", C.sub, `1px solid ${C.border}`), flex: 1 }}>{t("Cancel")}</button>
            <button onClick={save} style={{ ...btn(C.green, "#fff"), flex: 1 }}>{t("Save")}</button>
          </div>

          {confirmDel ? (
            <div style={{ marginTop: 4, background: "#FFE9E2", border: "1px solid #FFD2C5", borderRadius: R.md, padding: 10 }}>
              <div style={{ fontSize: 12, color: "#B23A1A", fontWeight: 700 }}>
                {lang === "ko"
                  ? `"${account.name}" 계좌를 삭제할까요? 거래는 남지만 이 계좌 연결은 사라져요.`
                  : `Delete "${account.name}"? Its transactions stay but lose this account link.`}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => setConfirmDel(false)} style={{ ...btn("#fff", C.sub, `1px solid ${C.border}`), flex: 1 }}>{t("Keep")}</button>
                <button onClick={() => onDeleteAccount(account.id)} style={{ ...btn(C.coral, "#fff"), flex: 1 }}>{t("Delete")}</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} style={{ ...btn("#fff", C.coral, `1px solid #FFD2C5`), marginTop: 2 }}>
              🗑️ {t("Delete account")}
            </button>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: "-.02em" }}>
            {formatMoney(account.balance, account.currency)}
          </div>
          <button onClick={openEdit} style={{ border: "none", background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ✏️ {t("Edit")}
          </button>
        </div>
      )}
    </div>
  );
}
