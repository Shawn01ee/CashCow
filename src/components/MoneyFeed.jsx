// MoneyFeed.jsx — the "coach" voice: short friendly insight lines.
import {
  safeToSpend,
  monthlyNet,
  biggestVariableCategory,
  formatMoney,
} from "../utils/calculations";
import { colors as C, radius as R } from "../theme/tokens";
import { useLang } from "../i18n";

export default function MoneyFeed({ accounts, transactions, fixedPayments }) {
  const { t, lang } = useLang();
  const ko = lang === "ko";
  const safe = safeToSpend(accounts, fixedPayments);
  const net = monthlyNet(transactions);
  const biggestVar = biggestVariableCategory(transactions);

  const messages = [];

  if (!safe.covered) {
    messages.push({
      emoji: "⚠️",
      tone: "warn",
      text: ko
        ? `주의: 잔액이 ${safe.target.name} 결제에 부족할 수 있어요. 약 ${formatMoney(safe.amountNeeded)} 모자라요.`
        : `Heads up: your balance may not cover ${safe.target.name}. You're about ${formatMoney(safe.amountNeeded)} short.`,
    });
  } else if (safe.perDay > 0) {
    messages.push({
      emoji: "✅",
      tone: "good",
      text: ko
        ? `지금은 안전해요. ${safe.target ? `${safe.target.name} 결제는 준비됐어요.` : "예정된 큰 지출이 없어요."}`
        : `You're safe for now. ${safe.target ? `${safe.target.name} is covered.` : "No big payments coming up."}`,
    });
  }

  if (safe.covered && safe.target) {
    messages.push({
      emoji: "💸",
      tone: "info",
      text: ko
        ? `앞으로 ${safe.daysLeft}일 동안 하루에 약 ${formatMoney(safe.perDay)}까지 안전하게 쓸 수 있어요.`
        : `You can safely spend about ${formatMoney(safe.perDay)} per day for the next ${safe.daysLeft} day${safe.daysLeft === 1 ? "" : "s"}.`,
    });
  }

  messages.push({
    emoji: net >= 0 ? "📈" : "📉",
    tone: net >= 0 ? "good" : "warn",
    text: ko
      ? net >= 0
        ? `좋아요 — 이번 달 지금까지 ${formatMoney(net)}을 남겼어요.`
        : `이번 달 번 것보다 ${formatMoney(Math.abs(net))} 더 썼어요.`
      : net >= 0
        ? `Nice — you've kept ${formatMoney(net)} this month so far.`
        : `You've spent ${formatMoney(Math.abs(net))} more than you earned this month.`,
  });

  if (biggestVar) {
    messages.push({
      emoji: "🍜",
      tone: "info",
      text: ko
        ? `${biggestVar.category}이(가) 가장 큰 변동 지출이에요 (${formatMoney(biggestVar.total)}). 가장 줄이기 쉬운 항목이에요.`
        : `${biggestVar.category} is your biggest flexible spend (${formatMoney(biggestVar.total)}). It's the easiest place to cut back.`,
    });
  }

  const toneColor = (tn) => (tn === "good" ? C.greenDark : tn === "warn" ? "#B26A00" : C.ink);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 20 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800, color: C.ink }}>{t("Money Feed")}</h2>
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
