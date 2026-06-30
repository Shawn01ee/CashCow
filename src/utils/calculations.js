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

// "Available" = money you can freely spend (AUD, not protected).
export function availableAudBalance(accounts) {
  return accounts
    .filter((a) => a.currency === "AUD" && !a.isProtected)
    .reduce((sum, a) => sum + a.balance, 0);
}

// "Protected" = money set aside (rent reserve, savings) — off-limits for spending.
export function protectedAudBalance(accounts) {
  return accounts
    .filter((a) => a.currency === "AUD" && a.isProtected)
    .reduce((sum, a) => sum + a.balance, 0);
}

// The single "main" account (falls back to the first account).
export function mainAccount(accounts) {
  return accounts.find((a) => a.isMain) || accounts[0] || null;
}

// AUD transactions within a period: "month" (year+month) or "year" (year only).
function inPeriodAudTx(transactions, ref = new Date(), granularity = "month") {
  return transactions.filter((t) => {
    if (t.currency !== "AUD") return false;
    const d = new Date(t.date);
    if (d.getFullYear() !== ref.getFullYear()) return false;
    if (granularity === "month" && d.getMonth() !== ref.getMonth()) return false;
    return true;
  });
}

// Total income in the period (AUD).
export function monthlyIncome(transactions, now = new Date(), granularity = "month") {
  return inPeriodAudTx(transactions, now, granularity)
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

// Total expense in the period (AUD).
export function monthlyExpense(transactions, now = new Date(), granularity = "month") {
  return inPeriodAudTx(transactions, now, granularity)
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

// Income minus expense for the period.
export function monthlyNet(transactions, now = new Date(), granularity = "month") {
  return monthlyIncome(transactions, now, granularity) - monthlyExpense(transactions, now, granularity);
}

// Split the period's expenses into fixed vs variable totals.
export function fixedVsVariable(transactions, now = new Date(), granularity = "month") {
  const expenses = inPeriodAudTx(transactions, now, granularity).filter((t) => t.type === "expense");
  const fixed = expenses.filter((t) => t.isFixed).reduce((s, t) => s + t.amount, 0);
  const variable = expenses.filter((t) => !t.isFixed).reduce((s, t) => s + t.amount, 0);
  return { fixed, variable };
}

// Build a category breakdown for this month's expenses.
// Returns: [{ category, total }] sorted biggest first.
export function categoryBreakdown(transactions, now = new Date(), granularity = "month") {
  const expenses = inPeriodAudTx(transactions, now, granularity).filter((t) => t.type === "expense");
  const totals = {};
  for (const t of expenses) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }
  return Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

// Biggest variable (flexible) spending category in the period, e.g. "Eating Out".
export function biggestVariableCategory(transactions, now = new Date(), granularity = "month") {
  const expenses = inPeriodAudTx(transactions, now, granularity).filter(
    (t) => t.type === "expense" && !t.isFixed
  );
  const totals = {};
  for (const t of expenses) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  }
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  return sorted.length ? { category: sorted[0][0], total: sorted[0][1] } : null;
}

// Summarise how this month's expenses felt (from the rating field).
// Returns { good, warn, bad } each as { count, total }.
export function ratingSummary(transactions, now = new Date(), granularity = "month") {
  const expenses = inPeriodAudTx(transactions, now, granularity).filter((t) => t.type === "expense");
  const sum = {
    good: { count: 0, total: 0 },
    warn: { count: 0, total: 0 },
    bad: { count: 0, total: 0 },
  };
  for (const t of expenses) {
    if (t.rating && sum[t.rating]) {
      sum[t.rating].count += 1;
      sum[t.rating].total += t.amount;
    }
  }
  return sum;
}

// Spending trend buckets for the Insights bar chart.
// period: "week" (last 7 days), "month" (last 6 months), "year" (last 5 years).
// Transfers are excluded (only real expenses count).
export function expenseTrend(transactions, period = "month", now = new Date()) {
  const expenses = transactions.filter((t) => t.type === "expense" && t.currency === "AUD");
  const buckets = [];

  if (period === "week") {
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const total = expenses.filter((t) => t.date === key).reduce((s, t) => s + t.amount, 0);
      buckets.push({ label: dayLabels[d.getDay()], total });
    }
  } else if (period === "year") {
    const y = now.getFullYear();
    for (let i = 4; i >= 0; i--) {
      const yr = y - i;
      const total = expenses
        .filter((t) => new Date(t.date).getFullYear() === yr)
        .reduce((s, t) => s + t.amount, 0);
      buckets.push({ label: `'${String(yr).slice(2)}`, total });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const total = expenses
        .filter((t) => {
          const td = new Date(t.date);
          return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
        })
        .reduce((s, t) => s + t.amount, 0);
      buckets.push({ label: d.toLocaleString("en", { month: "short" }), total });
    }
  }
  return buckets;
}

// Find the next upcoming fixed payment/expense (soonest future due date).
export function nextFixedPayment(fixedPayments, now = new Date()) {
  const upcoming = fixedPayments
    .filter((fp) => (fp.kind || "expense") === "expense" && new Date(fp.nextDueDate) >= startOfDay(now))
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  return upcoming[0] || null;
}

// Find the next upcoming fixed income (soonest future date).
export function nextFixedIncome(fixedPayments, now = new Date()) {
  const upcoming = fixedPayments
    .filter((fp) => fp.kind === "income" && new Date(fp.nextDueDate) >= startOfDay(now))
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

// Count how many times a recurring fixed payment fires between now and a horizon date.
// Walks forward from fp.nextDueDate step-by-step so monthly/yearly are accurate.
function occurrencesInWindow(fp, from, to) {
  const fromDay = startOfDay(from);
  const toDay = startOfDay(new Date(to));
  let count = 0;
  let cur = startOfDay(new Date(fp.nextDueDate));

  while (cur <= toDay) {
    if (cur >= fromDay) count++;
    if (fp.frequency === "weekly")       cur.setDate(cur.getDate() + 7);
    else if (fp.frequency === "fortnightly") cur.setDate(cur.getDate() + 14);
    else if (fp.frequency === "8-weekly")  cur.setDate(cur.getDate() + 56);
    else if (fp.frequency === "monthly")  cur.setMonth(cur.getMonth() + 1);
    else if (fp.frequency === "yearly")   cur.setFullYear(cur.getFullYear() + 1);
    else break; // "once" — only fires once, handled by count above
  }
  return count;
}

// ----------------------------------------------------------------------
// Safe to Spend — the heart of CashCow.
//
// If the user has a fixed income set up:
//   1. Find the next income date (the "horizon").
//   2. Sum ALL occurrences of recurring AUD bills between now and that date.
//   3. safe per day = (available - total bills before income) / days until income
//
// If no fixed income is set up, fall back to the next bill as the horizon.
// If neither exists, divide available by 30.
// ----------------------------------------------------------------------
export function safeToSpend(accounts, fixedPayments, now = new Date()) {
  const available = availableAudBalance(accounts);
  const nextIncome = nextFixedIncome(fixedPayments, now);

  // --- Income-based mode (primary) ---
  if (nextIncome && nextIncome.currency === "AUD") {
    const daysLeft = Math.max(1, daysUntil(nextIncome.nextDueDate, now));

    // All occurrences of every AUD expense bill up to (and including) the income date.
    const billsBefore = fixedPayments
      .filter((fp) => (fp.kind || "expense") === "expense" && fp.currency === "AUD")
      .reduce((sum, fp) => {
        const fromProtected = accounts.find((a) => a.id === fp.accountId)?.isProtected;
        if (fromProtected) return sum;
        const count = occurrencesInWindow(fp, now, nextIncome.nextDueDate);
        return sum + fp.amount * count;
      }, 0);

    const spendable = available - billsBefore;
    const perDay = spendable / daysLeft;

    return {
      perDay,
      daysLeft,
      target: nextIncome,   // horizon = next payday
      nextIncome,
      billsBefore,
      covered: spendable >= 0,
      amountNeeded: spendable < 0 ? Math.abs(spendable) : 0,
      mode: "income",
    };
  }

  // --- Fallback: next bill as horizon ---
  const nextBill = nextFixedPayment(fixedPayments, now);
  if (!nextBill) {
    return { perDay: available / 30, daysLeft: 30, target: null, nextIncome: null, covered: true, amountNeeded: 0, mode: "free" };
  }

  const daysLeft = Math.max(1, daysUntil(nextBill.nextDueDate, now));
  const fromProtected = accounts.find((a) => a.id === nextBill.accountId)?.isProtected;
  const leftover = fromProtected ? available : available - nextBill.amount;

  return {
    perDay: leftover / daysLeft,
    daysLeft,
    target: nextBill,
    nextIncome: null,
    covered: leftover >= 0,
    amountNeeded: leftover < 0 ? Math.abs(leftover) : 0,
    mode: "bill",
  };
}
