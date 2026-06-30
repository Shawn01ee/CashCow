// Guide.jsx — Feature introduction screen.
import { useState } from "react";
import { colors as C, radius as R } from "../theme/tokens";
import { useLang } from "../i18n";

const FEATURES = [
  {
    icon: "💰",
    titleKey: "Safe to Spend",
    descKey: "safe-to-spend-guide",
    color: "#1A9D63",
    bg: "#E4F6EC",
  },
  {
    icon: "📒",
    titleKey: "Activity",
    descKey: "activity-guide",
    color: C.ink,
    bg: "#F5F0E8",
  },
  {
    icon: "🔁",
    titleKey: "Fixed payments",
    descKey: "fixed-guide",
    color: "#4666CC",
    bg: "#EAF0FF",
  },
  {
    icon: "📊",
    titleKey: "Insights",
    descKey: "insights-guide",
    color: "#B26A00",
    bg: "#FFF3D6",
  },
  {
    icon: "🏦",
    titleKey: "Accounts",
    descKey: "accounts-guide",
    color: "#7C3ABD",
    bg: "#F3EEFF",
  },
  {
    icon: "⭐",
    titleKey: "Purchase Ratings",
    descKey: "ratings-guide",
    color: "#B23A1A",
    bg: "#FFE9E2",
  },
];

const TIPS = [
  { icon: "💡", key: "tip-memo" },
  { icon: "🔒", key: "tip-protected" },
  { icon: "📅", key: "tip-period" },
  { icon: "⚡", key: "tip-quickadd" },
];

export default function Guide({ onNavigate }) {
  const { t, lang } = useLang();
  const ko = lang === "ko";
  const [open, setOpen] = useState(null);

  const featureDesc = (key) => {
    const map = {
      "safe-to-spend-guide": ko
        ? "다음 고정 지출까지 하루에 얼마나 써도 괜찮은지 자동으로 계산해드려요. 홈 화면 상단의 큰 숫자가 바로 그거예요. 거래를 기록할수록 더 정확해져요."
        : "CashCow automatically calculates how much you can spend each day until your next fixed payment. That big number on the home screen is your daily budget. The more transactions you log, the more accurate it gets.",
      "activity-guide": ko
        ? "모든 거래 내역을 한눈에 볼 수 있어요. 수입·지출·이체별로 필터하거나 계좌별로 확인할 수 있고, 월/년도별로 기간을 바꿀 수도 있어요."
        : "View all your transactions in one place. Filter by income, expense, or transfer — or by account. Switch between monthly and yearly views using the period selector.",
      "fixed-guide": ko
        ? "월세, 통신비, 넷플릭스처럼 매달 나가는 돈을 등록해두세요. 결제 후 'Paid' 버튼을 누르면 자동으로 거래가 기록되고 다음 결제일이 계산돼요."
        : "Add recurring bills like rent, phone, or Netflix. When a payment goes out, tap 'Paid' and CashCow logs the expense and moves the due date forward automatically.",
      "insights-guide": ko
        ? "어디에 얼마나 썼는지 카테고리별로 분석해드려요. 월별·연도별로 비교하고, 지출 추이 차트로 소비 패턴도 확인할 수 있어요."
        : "See exactly where your money goes, broken down by category. Compare months or years, and spot spending patterns in the trend chart.",
      "accounts-guide": ko
        ? "여러 계좌를 등록하고 잔액을 관리할 수 있어요. 비상금이나 월세 보관용 돈은 '보호 계좌'로 설정하면 안전 지출 계산에서 제외돼요."
        : "Add multiple accounts and track balances. Mark an account as 'Protected' to set money aside — it won't count toward your safe-to-spend calculation.",
      "ratings-guide": ko
        ? "지출을 기록할 때 ✅ 만족 / ⚠️ 그저 그럼 / ❌ 후회 중 하나로 평가해보세요. 분석 리포트에서 돈을 어떻게 느꼈는지 확인할 수 있어요."
        : "When logging an expense, rate it ✅ Worth it / ⚠️ Meh / ❌ Regret. The Insights screen shows a breakdown of how your spending felt over time.",
    };
    return map[key] || key;
  };

  const tipText = (key) => {
    const map = {
      "tip-memo": ko
        ? "거래에 메모를 남기면 거래내역에서 바로 보여요. 예: 'KT마트 훠궈 재료'"
        : "Add a memo to any transaction and it'll show directly in the Activity list.",
      "tip-protected": ko
        ? "보호 계좌에 월세를 미리 넣어두면 '안전 지출'이 그 돈을 건드리지 않아요."
        : "Keep rent money in a Protected account so your safe-to-spend never touches it.",
      "tip-period": ko
        ? "거래내역과 분석 리포트에서 ‹ 2026 ›으로 연도별 전체 소비를 한눈에 볼 수 있어요."
        : "Switch to yearly view in Activity or Insights to see your full-year spending at a glance.",
      "tip-quickadd": ko
        ? "'추가' 화면의 빠른 추가 버튼으로 커피, 점심, 배달 등을 한 번에 입력할 수 있어요."
        : "Use Quick Add chips on the Add screen to log coffee, lunch, or delivery in one tap.",
    };
    return map[key] || key;
  };

  const card = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: R.xl,
    padding: 18,
  };

  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: C.ink }}>
          {ko ? "CashCow 사용 가이드" : "How to use CashCow"}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: C.sub }}>
          {ko ? "주요 기능을 탭해서 자세히 알아보세요." : "Tap any feature to learn more."}
        </p>
      </div>

      {/* Feature cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FEATURES.map((f) => {
          const isOpen = open === f.titleKey;
          return (
            <div
              key={f.titleKey}
              style={{ ...card, cursor: "pointer", transition: "box-shadow .15s" }}
              onClick={() => setOpen(isOpen ? null : f.titleKey)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: R.md, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{t(f.titleKey)}</div>
                </div>
                <span style={{ fontSize: 13, color: C.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s", display: "inline-block" }}>▾</span>
              </div>
              {isOpen && (
                <p style={{ margin: "12px 0 0 58px", fontSize: 14, color: C.sub, lineHeight: 1.6 }}>
                  {featureDesc(f.descKey)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div>
        <h2 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 800, color: C.ink }}>
          {ko ? "꿀팁 모음" : "Pro tips"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TIPS.map((tip) => (
            <div key={tip.key} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: C.bg, borderRadius: R.md, padding: "12px 14px" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon}</span>
              <span style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{tipText(tip.key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ ...card, textAlign: "center", background: C.ink, border: "none" }}>
        <div style={{ fontSize: 28 }}>🐮</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 8 }}>
          {ko ? "바로 시작해볼까요?" : "Ready to get started?"}
        </div>
        <div style={{ fontSize: 13, color: "#D9CFBE", marginTop: 4 }}>
          {ko ? "첫 거래를 기록하고 오늘 예산을 확인해봐요." : "Log your first transaction to see your daily budget."}
        </div>
        <button
          onClick={() => onNavigate("add")}
          style={{ marginTop: 14, border: "none", background: C.green, color: "#fff", borderRadius: R.md, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          {ko ? "첫 거래 기록하기" : "Log my first transaction"}
        </button>
      </div>
    </div>
  );
}
