// sampleData.js
// ----------------------------------------------------------------------
// This is the "seed" data CashCow uses the very first time the app runs.
// After that, everything lives in the browser's localStorage and this
// file is only used again if the user resets their data.
//
// Keeping all sample data in one place makes it easy to tweak later.
// ----------------------------------------------------------------------

export const sampleAccounts = [
  { id: "acc-1", name: "CommBank", currency: "AUD", balance: 2430.5, isMain: true },
  { id: "acc-2", name: "Korean Bank", currency: "KRW", balance: 1200000, isMain: false },
  { id: "acc-3", name: "Cash", currency: "AUD", balance: 80, isMain: false },
];

export const sampleCategories = [
  // --- Expense categories ---
  { id: "cat-rent", name: "Rent", type: "expense", icon: "🏠", isFixed: true },
  { id: "cat-groceries", name: "Groceries", type: "expense", icon: "🛒", isFixed: false },
  { id: "cat-eatingout", name: "Eating Out", type: "expense", icon: "🍜", isFixed: false },
  { id: "cat-cafe", name: "Cafe", type: "expense", icon: "☕", isFixed: false },
  { id: "cat-transport", name: "Transport", type: "expense", icon: "🚋", isFixed: false },
  { id: "cat-study", name: "Study", type: "expense", icon: "📚", isFixed: false },
  { id: "cat-health", name: "Health", type: "expense", icon: "💊", isFixed: false },
  { id: "cat-fitness", name: "Fitness", type: "expense", icon: "🏋️", isFixed: false },
  { id: "cat-shopping", name: "Shopping", type: "expense", icon: "🛍️", isFixed: false },
  { id: "cat-subscription", name: "Subscription", type: "expense", icon: "🔁", isFixed: true },
  { id: "cat-phone", name: "Phone", type: "expense", icon: "📱", isFixed: true },
  { id: "cat-travel", name: "Travel", type: "expense", icon: "✈️", isFixed: false },
  { id: "cat-other", name: "Other", type: "expense", icon: "📦", isFixed: false },

  // --- Income categories ---
  { id: "cat-family", name: "Family Support", type: "income", icon: "💸", isFixed: true },
  { id: "cat-job", name: "Part-time Job", type: "income", icon: "💼", isFixed: true },
  { id: "cat-scholarship", name: "Scholarship", type: "income", icon: "🎓", isFixed: true },
  { id: "cat-refund", name: "Refund", type: "income", icon: "↩️", isFixed: false },
  { id: "cat-exchange", name: "Currency Exchange", type: "income", icon: "💱", isFixed: false },
  { id: "cat-otherincome", name: "Other Income", type: "income", icon: "➕", isFixed: false },
];

export const sampleTransactions = [
  { id: "tx-1", type: "expense", amount: 1038, currency: "AUD", category: "Rent", accountId: "acc-1", memo: "Scape rent", date: "2026-06-20", isFixed: true },
  { id: "tx-2", type: "expense", amount: 15.8, currency: "AUD", category: "Eating Out", accountId: "acc-1", memo: "Ramen", date: "2026-06-25", isFixed: false },
  { id: "tx-3", type: "expense", amount: 5.2, currency: "AUD", category: "Cafe", accountId: "acc-1", memo: "Iced latte", date: "2026-06-26", isFixed: false },
  { id: "tx-4", type: "income", amount: 500, currency: "AUD", category: "Family Support", accountId: "acc-1", memo: "Monthly support", date: "2026-06-24", isFixed: true },
];

export const sampleFixedPayments = [
  { id: "fp-1", name: "Next Rent", amount: 1038, currency: "AUD", accountId: "acc-1", category: "Rent", frequency: "fortnightly", nextDueDate: "2026-07-03" },
  { id: "fp-2", name: "Phone Bill", amount: 30, currency: "AUD", accountId: "acc-1", category: "Phone", frequency: "monthly", nextDueDate: "2026-07-10" },
];

// Quick-add buttons shown on the Add screen for the most common expenses.
// Each one pre-fills the form so logging a coffee takes one tap.
export const quickAdds = [
  { label: "Coffee", icon: "☕", category: "Cafe", amount: 5, type: "expense" },
  { label: "Lunch", icon: "🍜", category: "Eating Out", amount: 15, type: "expense" },
  { label: "Groceries", icon: "🛒", category: "Groceries", amount: 40, type: "expense" },
  { label: "Transport", icon: "🚋", category: "Transport", amount: 4, type: "expense" },
];
