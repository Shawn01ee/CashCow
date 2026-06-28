// MoneyFeed.jsx — the "coach" voice: short friendly insight lines.
import {
  safeToSpend,
  monthlyNet,
  biggestVariableCategory,
  formatMoney,
} from "../utils/calculations";
import { colors as C, radius as R } from "../theme/tokens";

export default function MoneyFeed({ accounts, transactions, fixedPayments }) {
  const safe = safeToSpend(accounts, fixedPayments);
  const net = monthlyNet(transactions);
  const biggestVar = biggestVariableCategory(transactions);

  const messages = [];

  if (!safe.covered) {
    messages.push({
      emoji: "⚠️",
      tone: "warn",
      text: `Heads up: your balance may not cover ${safe.target.name}. You're about ${formatMoney(safe.amountNeeded)} short.`,
    });
  } else if (safe.perDay > 0) {
    messages.push({
      emoji: "✅",
      tone: "good",
      text: `You're safe for now. ${safe.target ? `${safe.target.name} is covered.` : "No big payments coming up."}`,
    });
  }

  if (safe.covered && safe.target) {
    messages.push({
      emoji: "💸",
      tone: "info",
      text: `You can safely spend about ${formatMoney(safe.perDay)} per day for the next ${safe.daysLeft} day${safe.daysLeft === 1 ? "" : "s"}.`,
    });
  }

  messages.push({
    emoji: net >= 0 ? "📈" : "📉",
    tone: net >= 0 ? "good" : "warn",
    text:
      net >= 0
        ? `Nice — you've kept ${formatMoney(net)} this month so far.`
        : `You've spent ${formatMoney(Math.abs(net))} more than you earned this month.`,
  });

  if (biggestVar) {
    messages.push({
      emoji: "🍜",
      tone: "info",
      text: `${biggestVar.category} is your biggest flexible spend (${formatMoney(biggestVar.total)}). It's the easiest place to cut back.`,
    });
  }

  const toneColor = (t) => (t === "good" ? C.greenDark : t === "warn" ? "#B26A00" : C.ink);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 20 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: C.ink }}>Money Feed</h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.45 }}>
            <span style={{ flexShrink: 0 }}>{m.emoji}</span>
            <span style={{ color: toneColor(m.tone) }}>{m.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
