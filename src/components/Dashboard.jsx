// Dashboard.jsx
// The Home screen. It pulls numbers from the calculation helpers and lays
// them out as friendly cards, plus the Money Feed and recent activity.
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

export default function Dashboard({
  accounts,
  transactions,
  fixedPayments,
  categories,
  hasAccounts,
  onNavigate,
}) {
  // Brand-new user with no account yet → show a friendly onboarding card
  // instead of a dashboard full of $0.00s.
  if (!hasAccounts) return <Onboarding onNavigate={onNavigate} />;

  // Crunch all the numbers up front.
  const totalAud = totalAudBalance(accounts);
  const main = mainAccount(accounts);
  const income = monthlyIncome(transactions);
  const expense = monthlyExpense(transactions);
  const net = monthlyNet(transactions);
  const nextFP = nextFixedPayment(fixedPayments);
  const safe = safeToSpend(accounts, fixedPayments);

  // Most recent 5 transactions for the little activity preview.
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Quick lookup so a transaction's category name -> emoji icon.
  const iconFor = (categoryName) =>
    categories.find((c) => c.name === categoryName)?.icon || "💵";

  return (
    <div className="space-y-5">
      {/* Greeting / big balance */}
      <header>
        <p className="text-sm text-neutral-400">Good to see you 👋</p>
        <h1 className="mt-1 text-3xl font-bold text-white">
          {formatMoney(totalAud)}
        </h1>
        <p className="text-sm text-neutral-500">
          Total across your AUD accounts
          {main ? ` · main: ${main.name} ${formatMoney(main.balance, main.currency)}` : ""}
        </p>
      </header>

      {/* Safe to spend — the hero insight */}
      <div
        className={`rounded-2xl p-5 ring-1 ${
          safe.covered
            ? "bg-emerald-500/10 ring-emerald-500/30"
            : "bg-red-500/10 ring-red-500/30"
        }`}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Safe to spend per day
        </p>
        {safe.covered ? (
          <>
            <p className="mt-1 text-3xl font-bold text-emerald-400">
              {formatMoney(safe.perDay)}
            </p>
            <p className="mt-1 text-sm text-neutral-300">
              {safe.target
                ? `until ${safe.target.name} on ${safe.target.nextDueDate} (${safe.daysLeft} days)`
                : "no upcoming fixed payments"}
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-xl font-bold text-red-400">
              Warning: your balance may not cover {safe.target?.name}.
            </p>
            <p className="mt-1 text-sm text-neutral-300">
              You're about {formatMoney(safe.amountNeeded)} short.
            </p>
          </>
        )}
      </div>

      {/* This month at a glance */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="This month in" value={formatMoney(income)} tone="positive" />
        <StatCard label="This month out" value={formatMoney(expense)} tone="negative" />
        <StatCard
          label="Left this month"
          value={formatMoney(net)}
          tone={net >= 0 ? "positive" : "negative"}
          hint={net >= 0 ? "income minus spending" : "spending more than you earned"}
        />
        {/* Tappable — opens the Fixed Payments screen to manage bills. */}
        <button onClick={() => onNavigate("fixed")} className="text-left">
          <StatCard
            label="Next fixed payment ›"
            value={nextFP ? formatMoney(nextFP.amount, nextFP.currency) : "Add one"}
            hint={
              nextFP
                ? `${nextFP.name} · in ${daysUntil(nextFP.nextDueDate)} days`
                : "tap to add rent / phone bill"
            }
          />
        </button>
      </div>

      {/* Coach messages */}
      <MoneyFeed
        accounts={accounts}
        transactions={transactions}
        fixedPayments={fixedPayments}
      />

      {/* Recent activity preview */}
      <section className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-300">Recent activity</h2>
          <button
            onClick={() => onNavigate("transactions")}
            className="text-xs font-medium text-emerald-400 hover:underline"
          >
            See all
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-neutral-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {recent.map((tx) => (
              <li key={tx.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xl">{iconFor(tx.category)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">
                    {tx.memo || tx.category}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {tx.category} · {tx.date}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.type === "income" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatMoney(tx.amount, tx.currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// Shown to a brand-new user who hasn't created any account yet.
function Onboarding({ onNavigate }) {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-neutral-400">Welcome to CashCow 🐮</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Let's set you up</h1>
      </header>

      <div className="rounded-2xl bg-neutral-900 p-6 ring-1 ring-neutral-800">
        <p className="text-sm text-neutral-300">
          CashCow works out how much you can safely spend each day. To start, add
          your first account (like your bank) with its current balance.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-neutral-400">
          <li>1️⃣ Add an account & balance</li>
          <li>2️⃣ Add your rent / phone bill as a fixed payment</li>
          <li>3️⃣ Log a coffee or lunch — and watch your “safe to spend”</li>
        </ol>
        <button
          onClick={() => onNavigate("accounts")}
          className="mt-5 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          Create my first account
        </button>
      </div>
    </div>
  );
}
