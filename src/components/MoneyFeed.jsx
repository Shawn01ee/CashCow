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
        ? safe.mode === "income"
          ? `주의: 다음 수입(${safe.target?.name})이 오기 전에 잔액이 부족할 수 있어요. 약 ${formatMoney(safe.amountNeeded)} 모자라요.`
          : `주의: 잔액이 ${safe.target?.name} 결제에 부족할 수 있어요. 약 ${formatMoney(safe.amountNeeded)} 모자라요.`
        : safe.mode === "income"
          ? `Heads up: you may run short before ${safe.target?.name} arrives. About ${formatMoney(safe.amountNeeded)} short.`
          : `Heads up: your balance may not cover ${safe.target?.name}. You're about ${formatMoney(safe.amountNeeded)} short.`,
    });
  } else if (safe.perDay > 0) {
    messages.push({
      emoji: "✅",
      tone: "good",
      text: ko
        ? safe.mode === "income"
          ? `${safe.target.name} 수입이 ${safe.daysLeft}일 후에 들어와요. 하루 ${formatMoney(safe.perDay)}씩 쓸 수 있어요.`
          : `지금은 안전해요. ${safe.target ? `${safe.target.name} 결제는 준비됐어요.` : "예정된 큰 지출이 없어요."}`
        : safe.mode === "income"
          ? `${safe.target.name} lands in ${safe.daysLeft} day${safe.daysLeft === 1 ? "" : "s"}. You can spend ${formatMoney(safe.perDay)}/day until then.`
          : `You're good for now. ${safe.target ? `${safe.target.name} is covered.` : "No big payments coming up."}`,
    });
  }

  if (safe.covered && safe.mode !== "income" && safe.target) {
    messages.push({
      emoji: "💸",
      tone: "info",
      text: ko
        ? `앞으로 ${safe.daysLeft}일 동안 하루에 약 ${formatMoney(safe.perDay)}까지 안전하게 쓸 수 있어요.`
        : `You can safely spend about ${formatMoney(safe.perDay)} per day for the next ${safe.daysLeft} day${safe.daysLeft === 1 ? "" : "s"}.`,
    });
  }

  if (safe.covered && safe.mode === "income" && safe.billsBefore > 0) {
    messages.push({
      emoji: "🧾",
      tone: "info",
      text: ko
        ? `수입 전에 ${formatMoney(safe.billsBefore)}의 고정 지출이 예정돼 있어요. 이미 계산에 반영됐어요.`
        : `${formatMoney(safe.billsBefore)} in bills are due before your next income — already factored in.`,
    });
  }

  messages.push({
    emoji: net >= 0 ? "📈" : "📉",
    tone: net >= 0 ? "good" : "warn",
    text: ko
      ? net >= 0
        ? `잘하고 있어요! 이번 달 ${formatMoney(net)} 흑자예요.`
        : `이번 달 수입보다 ${formatMoney(Math.abs(net))} 더 썼어요.`
      : net >= 0
        ? `Nice — you're ${formatMoney(net)} ahead this month.`
        : `You've spent ${formatMoney(Math.abs(net))} more than you earned this month.`,
  });

  if (biggestVar) {
    messages.push({
      emoji: "🍜",
      tone: "info",
      text: ko
        ? `이번 달 변동 지출 중 ${biggestVar.category}에 가장 많이 썼어요 (${formatMoney(biggestVar.total)}).`
        : `${biggestVar.category} is your biggest variable expense (${formatMoney(biggestVar.total)}) — easiest place to cut back.`,
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
