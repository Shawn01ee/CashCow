// Dashboard.jsx — Home screen in the Buttercream theme.
import StatCard from "./StatCard";
import MoneyFeed from "./MoneyFeed";
import {
  totalAudBalance,
  mainAccount,
  monthlyIncome,
  monthlyExpense,
  monthlyNet,
  nextFixedPayment,
  safeToSpend,
  daysUntil,
  formatMoney,
} from "../utils/calculations";
import { colors as C, radius as R, shadow as S } from "../theme/tokens";

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 20 };

export default function Dashboard({
  accounts,
  transactions,
  fixedPayments,
  categories,
  hasAccounts,
  onNavigate,
}) {
  if (!hasAccounts) return <Onboarding onNavigate={onNavigate} />;

  const totalAud = totalAudBalance(accounts);
  const main = mainAccount(accounts);
  const income = monthlyIncome(transactions);
  const expense = monthlyExpense(transactions);
  const net = monthlyNet(transactions);
  const nextFP = nextFixedPayment(fixedPayments);
  const safe = safeToSpend(accounts, fixedPayments);

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  const iconFor = (name) => categories.find((c) => c.name === name)?.icon || "💵";

  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero: total balance */}
      <div style={{ background: C.green, borderRadius: R["2xl"], padding: "26px 28px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 22, top: 14, fontSize: 90, opacity: 0.16 }}>🐮</div>
        <div style={{ fontSize: 14, opacity: 0.92, fontWeight: 600 }}>Total balance (AUD)</div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-.03em", margin: "6px 0 12px" }}>
          {formatMoney(totalAud)}
        </div>
        {main && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.butter, color: "#5A4000", padding: "6px 13px", borderRadius: R.full, fontSize: 13, fontWeight: 800 }}>
            Main · {main.name} {formatMoney(main.balance, main.currency)}
          </div>
        )}
      </div>

      {/* Safe to spend hero insight */}
      <div
        style={{
          ...card,
          background: safe.covered ? C.greenSoft : "#FFE9E2",
          border: `1px solid ${safe.covered ? "#BFE9D2" : "#FFD2C5"}`,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: C.muted }}>
          Safe to spend per day
        </div>
        {safe.covered ? (
          <>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.greenDark, margin: "4px 0" }}>
              {formatMoney(safe.perDay)}
            </div>
            <div style={{ fontSize: 14, color: C.sub }}>
              {safe.target
                ? `until ${safe.target.name} on ${safe.target.nextDueDate} (${safe.daysLeft} days)`
                : "no upcoming fixed payments"}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 19, fontWeight: 800, color: C.coral, margin: "4px 0" }}>
              Warning: your balance may not cover {safe.target?.name}.
            </div>
            <div style={{ fontSize: 14, color: C.sub }}>You're about {formatMoney(safe.amountNeeded)} short.</div>
          </>
        )}
      </div>

      {/* This month grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard label="This month in" value={formatMoney(income)} tone="positive" />
        <StatCard label="This month out" value={formatMoney(expense)} tone="negative" />
        <StatCard
          label="Left this month"
          value={formatMoney(net)}
          tone={net >= 0 ? "positive" : "negative"}
          hint={net >= 0 ? "income minus spending" : "spending more than you earned"}
        />
        <button onClick={() => onNavigate("fixed")} style={{ textAlign: "left", border: "none", padding: 0, background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
          <StatCard
            label="Next fixed payment ›"
            value={nextFP ? formatMoney(nextFP.amount, nextFP.currency) : "Add one"}
            hint={nextFP ? `${nextFP.name} · in ${daysUntil(nextFP.nextDueDate)} days` : "tap to add rent / phone bill"}
          />
        </button>
      </div>

      <MoneyFeed accounts={accounts} transactions={transactions} fixedPayments={fixedPayments} />

      {/* Recent activity */}
      <section style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.ink }}>Recent activity</h2>
          <button onClick={() => onNavigate("transactions")} style={{ border: "none", background: "transparent", color: C.green, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            See all ›
          </button>
        </div>
        {recent.length === 0 ? (
          <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>No transactions yet.</p>
        ) : (
          recent.map((tx) => (
            <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${C.divider}` }}>
              <div style={{ width: 40, height: 40, borderRadius: R.md, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {iconFor(tx.category)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.memo || tx.category}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{tx.category} · {tx.date}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: tx.type === "income" ? C.greenDark : C.ink }}>
                {tx.type === "income" ? "+" : "−"}{formatMoney(tx.amount, tx.currency)}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function Onboarding({ onNavigate }) {
  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p style={{ margin: 0, fontSize: 14, color: C.muted }}>Welcome to CashCow 🐮</p>
        <h1 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: C.ink }}>Let's set you up</h1>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 24 }}>
        <p style={{ margin: 0, fontSize: 14, color: C.sub, lineHeight: 1.6 }}>
          CashCow works out how much you can safely spend each day. To start, add your
          first account (like your bank) with its current balance.
        </p>
        <ol style={{ margin: "16px 0 0", paddingLeft: 18, fontSize: 14, color: C.sub, lineHeight: 1.9 }}>
          <li>Add an account & balance</li>
          <li>Add your rent / phone bill as a fixed payment</li>
          <li>Log a coffee or lunch — watch your "safe to spend"</li>
        </ol>
        <button
          onClick={() => onNavigate("accounts")}
          style={{ marginTop: 20, width: "100%", border: "none", cursor: "pointer", background: C.green, color: "#fff", fontSize: 15, fontWeight: 700, padding: 14, borderRadius: R.md, fontFamily: "inherit", boxShadow: S.card }}
        >
          Create my first account
        </button>
      </div>
    </div>
  );
}
