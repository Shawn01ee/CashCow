// i18n.jsx — tiny language switcher (English / Korean).
// Usage: const { t, lang, setLang } = useLang();  then  t("Home").
// Keys are the English text, so untranslated strings fall back to English.
import { createContext, useContext, useState } from "react";

const ko = {
  // Navigation (transcreated, Toss-style)
  Home: "홈",
  Add: "추가",
  Activity: "거래내역",
  Insights: "분석 리포트",
  Accounts: "자산",
  "Fixed payments": "고정·구독",
  "Log out": "로그아웃",
  "Signed in as": "로그인 계정",

  // Auth / login
  Welcome: "환영해요 👋",
  "Log in or sign up with your email": "이메일로 로그인하거나 가입하세요",
  Email: "이메일",
  "Send me a code": "인증코드 받기",
  "Sending…": "보내는 중…",
  "No password to remember. We'll email you a code. 🐮":
    "비밀번호가 필요 없어요. 이메일로 코드를 보내드려요. 🐮",
  "Almost there!": "거의 다 왔어요!",
  "Enter the 8-digit code we emailed you": "이메일로 받은 8자리 코드를 입력하세요",
  "8-digit code": "8자리 코드",
  "Log in": "로그인",
  "Verifying…": "확인 중…",
  "← Change email": "← 이메일 바꾸기",
  "Resend code": "코드 다시 보내기",
  "Money habits,": "돈 관리,",
  "made simple": "쉽고 간단하게",
  "Track spending, bills and what's safe to spend, all in one friendly place.":
    "지출, 고정비, 안전하게 쓸 돈까지 한 곳에서 편하게 관리하세요.",
  Daily: "매일",
  "safe-to-spend": "안전 지출",
  "No password": "비밀번호 없이",
  "just a code": "코드만 입력",

  // Onboarding
  "Welcome to\nCashCow": "캐시카우에\n오신 걸 환영해요",
  "Track spending, bills, and accounts,\nall in one friendly place.":
    "지출·고정비·계좌를\n한 곳에서 편하게 관리해요.",
  "Know what's\nsafe to spend": "얼마나 써도\n괜찮은지 알려드려요",
  "CashCow works out how much you can\nspend each day before your next bill.":
    "다음 고정비 전까지 하루에\n얼마 써도 되는지 계산해드려요.",
  "Clear weekly\ninsights": "한눈에 보는\n소비 리포트",
  "See where your money goes, so nothing\nslips through the cracks.":
    "어디에 얼마 썼는지 정리해서\n새는 돈을 잡아드려요.",
  Next: "다음",
  "Get started": "시작하기",
  Skip: "건너뛰기",

  // Dashboard
  "Total balance (AUD)": "총 잔액 (AUD)",
  Available: "가용",
  Protected: "보호",
  Main: "메인",
  "Safe to spend per day": "하루 안전 지출",
  "no upcoming fixed payments": "예정된 고정 지출이 없어요",
  "This month in": "이번 달 수입",
  "This month out": "이번 달 지출",
  "Left this month": "이번 달 남은 돈",
  "income minus spending": "수입에서 지출을 뺀 값",
  "spending more than you earned": "번 것보다 많이 썼어요",
  "Next fixed payment ›": "다음 고정 지출 ›",
  "Add one": "추가하기",
  "tap to add rent / phone bill": "탭해서 월세·통신비 추가",
  "Recent activity": "최근 거래",
  "See all ›": "전체 보기 ›",
  "No transactions yet.": "아직 거래가 없어요.",
  "Money Feed": "머니 피드",
  "Welcome to CashCow 🐮": "캐시카우에 오신 걸 환영해요 🐮",
  "Let's set you up": "시작해볼까요",
  "CashCow works out how much you can safely spend each day. To start, add your first account (like your bank) with its current balance.":
    "캐시카우가 하루에 얼마나 안전하게 쓸 수 있는지 계산해드려요. 먼저 은행 계좌와 현재 잔액을 추가해보세요.",
  "Add an account & balance": "계좌와 잔액 추가하기",
  "Add your rent / phone bill as a fixed payment": "월세·통신비를 고정 지출로 추가하기",
  "Log a coffee or lunch, then watch your safe to spend": "커피나 점심을 기록하고 '안전 지출'을 확인하기",
  "Create my first account": "첫 계좌 만들기",

  // Accounts
  Close: "닫기",
  "+ Add": "+ 추가",
  "Total AUD across all accounts:": "전체 계좌 AUD 합계:",
  "Account name (e.g. Wise)": "계좌 이름 (예: 토스뱅크)",
  "Starting balance": "시작 잔액",
  "Add account": "계좌 추가",
  PROTECTED: "보호됨",
  account: "계좌",
  "Set as main": "메인으로 설정",
  "Account name": "계좌 이름",
  Balance: "잔액",
  "Protected money": "보호된 돈",
  "Set aside, excluded from safe to spend.": "따로 빼둔 돈, 안전 지출에서 제외돼요.",
  "What's it for? e.g. Rent reserve": "용도가 뭔가요? 예: 월세 보관용",
  Cancel: "취소",
  Save: "저장",
  Keep: "유지",
  Delete: "삭제",
  "Delete account": "계좌 삭제",
  Edit: "수정",

  // Add transaction
  "Add transaction": "거래 추가",
  "Edit transaction": "거래 수정",
  "Add an account first": "먼저 계좌를 추가하세요",
  "Transactions go in and out of an account, so let's create one.": "거래는 계좌에서 드나들어요. 먼저 계좌를 만들어요.",
  "Go to Accounts": "자산으로 가기",
  "Quick add": "빠른 추가",
  expense: "지출",
  income: "수입",
  transfer: "이체",
  Amount: "금액",
  "How much?": "얼마예요?",
  Currency: "통화",
  Category: "카테고리",
  Account: "계좌",
  "From account": "보내는 계좌",
  "To account": "받는 계좌",
  Memo: "메모",
  Date: "날짜",
  "Select a category…": "카테고리 선택…",
  "Select an account…": "계좌 선택…",
  "e.g. Iced latte": "예: KT마트 훠궈 재료",
  "Fixed payment?": "고정 지출인가요?",
  "Rent, phone, subscriptions: things you can't easily skip.": "월세·통신비·구독처럼 거르기 어려운 지출이에요.",
  "How did it feel? (optional)": "어땠나요? (선택)",
  "Worth it": "만족",
  Meh: "그저 그럼",
  Regret: "후회",
  "Saving…": "저장 중…",
  "Save changes": "변경 저장",
  "Save transaction": "거래 저장",
  "Please enter an amount greater than 0.": "0보다 큰 금액을 입력하세요.",
  "Pick two different accounts.": "서로 다른 계좌를 선택하세요.",
  "Please pick a category.": "카테고리를 선택하세요.",
  // Quick-add chip labels
  Coffee: "커피",
  Lunch: "점심",
  Dinner: "저녁",
  Dessert: "디저트",
  Beer: "맥주",

  // Activity
  All: "전체",
  Income: "수입",
  Expense: "지출",
  Transfer: "이체",
  Fixed: "고정",
  Variable: "변동",
  "All accounts": "전체 계좌",
  "No transactions match this filter.": "이 필터에 맞는 거래가 없어요.",
  "Worth it?": "만족했나요?",
  "Delete this transaction?": "이 거래를 삭제할까요?",
  "The account balance will be adjusted back.": "계좌 잔액이 원래대로 조정돼요.",

  // Category names
  Rent: "월세",
  Groceries: "장보기",
  "Eating Out": "외식",
  Cafe: "카페",
  Transport: "교통",
  Study: "학업",
  Health: "건강",
  Fitness: "운동",
  Shopping: "쇼핑",
  Subscription: "구독",
  Phone: "통신비",
  Travel: "여행",
  Delivery: "배달",
  Convenience: "편의점",
  Taxi: "택시",
  Alcohol: "술",
  Beauty: "뷰티",
  Entertainment: "엔터테인먼트",
  Gifts: "선물",
  Utilities: "공과금",
  Laundry: "세탁",
  Other: "기타",
  "Family Support": "가족 지원",
  "Part-time Job": "아르바이트",
  Scholarship: "장학금",
  Refund: "환불",
  "Currency Exchange": "환전",
  "Other Income": "기타 수입",

  // Fixed payments
  "Fixed payments come out of an account, so you'll need one first.": "고정 지출은 계좌에서 나가요. 먼저 계좌가 필요해요.",
  "Rent, phone, subscriptions: the bills you can't skip. Tap Paid when one goes out and CashCow logs it and moves the date forward.":
    "월세·통신비·구독처럼 거를 수 없는 지출이에요. 결제되면 'Paid'를 눌러요 — 기록하고 다음 날짜로 넘겨드려요.",
  "Recurring per month": "매월 반복 지출",
  Name: "이름",
  "e.g. Next Rent": "예: 다음 월세",
  "Select…": "선택…",
  Frequency: "주기",
  "Next due date": "다음 결제일",
  "Add fixed payment": "고정 지출 추가",
  "No fixed payments yet.": "아직 고정 지출이 없어요.",
  "Add your rent or phone bill so CashCow knows what's coming up.": "월세나 통신비를 추가하면 다가올 지출을 알려드려요.",
  "No category": "카테고리 없음",
  "no account": "계좌 없음",
  Paid: "결제완료",
  weekly: "매주 (1주)",
  fortnightly: "격주 (2주)",
  "4-weekly": "4주마다",
  "8-weekly": "8주마다",
  monthly: "매월",
  yearly: "연간",
  once: "일회",

  // Insights
  Month: "월",
  Year: "년",
  "Fixed vs flexible": "고정 vs 변동",
  "How your spending felt": "소비 만족도",
  "Spending trend": "지출 추이",
  "Spending by category": "카테고리별 지출",
  "Where your money went": "어디에 썼나요",

  // Guide
  Guide: "가이드",
  "Purchase Ratings": "소비 평가",

  // Language toggle
  Language: "언어",
};

const DICTS = { en: {}, ko };

const LangContext = createContext({ lang: "en", setLang: () => {}, t: (s) => s });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("cashcow.lang") || "en");

  function setLang(l) {
    localStorage.setItem("cashcow.lang", l);
    setLangState(l);
  }

  // Translate: look up the English key in the active dictionary, else fall back.
  const t = (key) => DICTS[lang]?.[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
