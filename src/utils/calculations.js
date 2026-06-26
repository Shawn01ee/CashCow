// calculations.js
// ----------------------------------------------------------------------
// All the "math" of CashCow lives here, separated from the UI.
// Components ask these functions questions like:
//   - "What's my total AUD balance?"
//   - "How much did I spend this month?"
//   - "How much can I safely spend per day?"
// Keeping this logic in one file makes it easy to test and reuse.
// ----------------------------------------------------------------------

// Format a number as money, e.g. formatMoney(5.2, "AUD") => "$5.20"
export function formatMoney(amount, currency = "AUD") {
  const symbol = currency === "KRW" ? "₩" : "$";
  // KRW has no cents; AUD shows 2 decimals.
  const fixed = currency === "KRW"
    ? Math.round(amount).toLocaleString()
    : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${fixed}`;
}

// Is this date string (YYYY-MM-DD) in the same month + year as `ref`?
function isSameMonth(dateStr, ref) {
  const d = new Date(dateStr);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

// Total balance across all AUD accounts.
// (For v0.1 we keep currencies separate and headline the AUD total,
//  since that's the money students actually live on day to day.)
export function totalAudBalance(accounts) {
  return accounts
    .filter((a) => a.currency === "AUD")
    .reduce((sum, a) => sum + a.balance, 0);
}

// The single "main" account (falls back to the first account).
export function mainAccount(accounts) {
  return accounts.find((a) => a.isMain) || accounts[0] || null;
}

// All AUD transactions that happened in the current month.
function thisMonthAudTx(transactions, now = new Date()) {
  return transactions.filter((t) => t.currency === "AUD" && isSameMonth(t.date, now));
}

// Total income this month (AUD).
export function monthlyIncome(transactions, now = new Date()) {
  return thisMonthAudTx(transactions, now)
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

// Total expense this month (AUD).
export function monthlyExpense(transactions, now = new Date()) {
  return thisMonthAudTx(transactions, now)
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

// "Left this month" = income - expense (friendlier name than "net cash flow").
export function monthlyNet(transactions, now = new Date()) {
  return monthlyIncome(transactions, now) - monthlyExpense(transactions, now);
}

// Split this month's expenses into fixed vs variable totals.
export function fixedVsVariable(transactions, now = new Date()) {
  const expenses = thisMonthAudTx(transactions, now).filter((t) => t.type === "expense");
  const fixed = expenses.filter((t) => t.isFixed).reduce((s, t) => s + t.amount, 0);
  const variable = expenses.filter((t) => !t.isFixed).reduce((s, t) => s + t.amount, 0);
  return { fixed, variable };
}

// Build a category breakdown for this month's expenses.
// Returns: [{ category, total }] sorted biggest first.
export function categoryBreakdown(transactions, now = new Date()) {
  const expenses = thisMonthAudTx(transactions, now).filter((t) => t.type === "expense");
  const totals = {};
  for (const t of expenses) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }
  return Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

// Biggest variable (flexible) spending category this month, e.g. "Eating Out".
export function biggestVariableCategory(transactions, now = new Date()) {
  const expenses = thisMonthAudTx(transactions, now).filter(
    (t) => t.type === "expense" && !t.isFixed
  );
  const totals = {};
  for (const t of expenses) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  return sorted.length ? { category: sorted[0][0], total: sorted[0][1] } : null;
}

// Find the next upcoming fixed payment (soonest future due date).
export function nextFixedPayment(fixedPayments, now = new Date()) {
  const upcoming = fixedPayments
    .filter((fp) => new Date(fp.nextDueDate) >= startOfDay(now))
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  return upcoming[0] || null;
}

// Whole number of days from now until a date string (never negative).
export function daysUntil(dateStr, now = new Date()) {
  const ms = startOfDay(new Date(dateStr)) - startOfDay(now);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// ----------------------------------------------------------------------
// Safe to Spend — the heart of CashCow.
//
// We answer: "How much can I spend each day and still cover my next big
// fixed payment?"
//
//   Safe per day = (AUD balance - next fixed payment) / days until it's due
//
// Returns an object the dashboard can use directly:
//   { perDay, daysLeft, target, covered, amountNeeded }
// ----------------------------------------------------------------------
export function safeToSpend(accounts, fixedPayments, now = new Date()) {
  const balance = totalAudBalance(accounts);
  const next = nextFixedPayment(fixedPayments, now);

  // No upcoming fixed payment? Then nothing is "locked up" — all balance is free.
  if (!next) {
    return { perDay: balance, daysLeft: 0, target: null, covered: true, amountNeeded: 0 };
  }

  const daysLeft = Math.max(1, daysUntil(next.nextDueDate, now)); // avoid divide-by-zero
  const leftover = balance - next.amount; // money free to spend after covering the payment
  const perDay = leftover / daysLeft;

  return {
    perDay,
    daysLeft,
    target: next,                 // the fixed payment we're saving for
    covered: leftover >= 0,       // can the balance cover it at all?
    amountNeeded: leftover < 0 ? Math.abs(leftover) : 0, // shortfall, if any
  };
}
