// MoneyFeed.jsx
// The "coach" voice of CashCow. Instead of just numbers, we show a short
// list of friendly insight lines based on the user's current situation.
//
// All the wording is generated here from the calculation helpers, so the
// dashboard stays clean and the messaging logic lives in one place.
import {
  safeToSpend,
  monthlyNet,
  biggestVariableCategory,
  formatMoney,
} from "../utils/calculations";

export default function MoneyFeed({ accounts, transactions, fixedPayments }) {
  const safe = safeToSpend(accounts, fixedPayments);
  const net = monthlyNet(transactions);
  const biggestVar = biggestVariableCategory(transactions);

  // Build a list of { emoji, text, tone } messages.
  const messages = [];

  // 1. Overall safety headline
  if (!safe.covered) {
    messages.push({
      emoji: "⚠️",
      tone: "warn",
      text: `Heads up: your balance may not cover ${safe.target.name}. You're about ${formatMoney(
        safe.amountNeeded
      )} short.`,
    });
  } else if (safe.perDay > 0) {
    messages.push({
      emoji: "✅",
      tone: "good",
      text: `You're safe for now. ${
        safe.target ? `${safe.target.name} is covered.` : "No big payments coming up."
      }`,
    });
  }

  // 2. Safe-to-spend coaching
  if (safe.covered && safe.target) {
    messages.push({
      emoji: "💸",
      tone: "info",
      text: `You can safely spend about ${formatMoney(
        safe.perDay
      )} per day for the next ${safe.daysLeft} day${safe.daysLeft === 1 ? "" : "s"}.`,
    });
  }

  // 3. Net for the month
  messages.push({
    emoji: net >= 0 ? "📈" : "📉",
    tone: net >= 0 ? "good" : "warn",
    text:
      net >= 0
        ? `Nice — you've kept ${formatMoney(net)} this month so far.`
        : `You've spent ${formatMoney(Math.abs(net))} more than you earned this month.`,
  });

  // 4. Biggest flexible category tip
  if (biggestVar) {
    messages.push({
      emoji: "🍜",
      tone: "info",
      text: `${biggestVar.category} is your biggest flexible spend (${formatMoney(
        biggestVar.total
      )}). It's the easiest place to cut back.`,
    });
  }

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
      <h2 className="mb-3 text-sm font-semibold text-neutral-300">Money Feed</h2>
      <ul className="space-y-2.5">
        {messages.map((m, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-snug">
            <span className="shrink-0">{m.emoji}</span>
            <span
              className={
                m.tone === "good"
                  ? "text-emerald-300"
                  : m.tone === "warn"
                  ? "text-amber-300"
                  : "text-neutral-300"
              }
            >
              {m.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
