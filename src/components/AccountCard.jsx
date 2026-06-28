// AccountCard.jsx — Buttercream account card with inline balance editor.
import { useState } from "react";
import { formatMoney } from "../utils/calculations";
import { colors as C, radius as R } from "../theme/tokens";

export default function AccountCard({ account, onSetMain, onEditBalance }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(account.balance));

  function save() {
    const num = parseFloat(value);
    if (!Number.isNaN(num)) onEditBalance(account.id, num);
    setEditing(false);
  }

  const input = {
    width: "100%",
    borderRadius: R.md,
    border: `1.5px solid ${C.border}`,
    background: "#fff",
    padding: "10px 12px",
    fontSize: 18,
    fontWeight: 800,
    color: C.ink,
    outline: "none",
    fontFamily: "inherit",
  };
  const smallBtn = (bg, color, border) => ({
    flex: 1,
    border: border || "none",
    borderRadius: R.md,
    padding: "8px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    background: bg,
    color,
  });

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: C.ink }}>
            {account.name}
            {account.isMain && (
              <span style={{ background: C.greenSoft, color: C.greenDark, padding: "2px 8px", borderRadius: R.full, fontSize: 10, fontWeight: 800 }}>
                MAIN
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{account.currency} account</div>
        </div>
        {!account.isMain && (
          <button
            onClick={() => onSetMain(account.id)}
            style={{ border: `1px solid ${C.border}`, background: "#fff", color: C.sub, borderRadius: R.md, padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            Set as main
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} autoFocus style={input} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setValue(String(account.balance)); setEditing(false); }} style={smallBtn("#fff", C.sub, `1px solid ${C.border}`)}>
              Cancel
            </button>
            <button onClick={save} style={smallBtn(C.green, "#fff")}>Save balance</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: "-.02em" }}>
            {formatMoney(account.balance, account.currency)}
          </div>
          <button onClick={() => { setValue(String(account.balance)); setEditing(true); }} style={{ border: "none", background: "transparent", color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ✏️ Edit
          </button>
        </div>
      )}
    </div>
  );
}
