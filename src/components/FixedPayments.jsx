// FixedPayments.jsx
// Manage recurring bills (rent, phone, subscriptions). You can add/edit/delete
// them and tap "Paid" — which logs a real expense, lowers the account balance,
// and moves the due date forward (or removes a one-off).
import { useState } from "react";
import { formatMoney, daysUntil } from "../utils/calculations";

const FREQUENCIES = ["weekly", "fortnightly", "monthly", "once"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function FixedPayments({
  fixedPayments,
  accounts,
  categories,
  onAdd,
  onUpdate,
  onDelete,
  onMarkPaid,
  onNavigate,
}) {
  const [editing, setEditing] = useState(null); // fp being edited, or null
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDueDate, setNextDueDate] = useState(today());

  const expenseCategories = categories.filter((c) => c.type === "expense");

  // No accounts yet → fixed payments need one. Send the user to Accounts.
  if (accounts.length === 0) {
    return (
      <EmptyNeedsAccount onNavigate={onNavigate} />
    );
  }

  function resetForm() {
    setEditing(null);
    setShowForm(false);
    setName("");
    setAmount("");
    setCurrency("AUD");
    setAccountId(accounts[0]?.id || "");
    setCategory("");
    setFrequency("monthly");
    setNextDueDate(today());
  }

  function openAdd() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(fp) {
    setEditing(fp);
    setName(fp.name);
    setAmount(String(fp.amount));
    setCurrency(fp.currency);
    setAccountId(fp.accountId || accounts[0]?.id || "");
    setCategory(fp.category || "");
    setFrequency(fp.frequency);
    setNextDueDate(fp.nextDueDate);
    setShowForm(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim() || !amt || amt <= 0) return;

    const payload = {
      name: name.trim(),
      amount: amt,
      currency,
      accountId,
      category,
      frequency,
      nextDueDate,
    };
    if (editing) onUpdate({ ...editing, ...payload });
    else onAdd(payload);
    resetForm();
  }

  const field =
    "w-full rounded-xl bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-neutral-700 focus:ring-emerald-500";
  const labelCls = "mb-1 block text-xs font-medium text-neutral-400";

  // Sort soonest-due first.
  const sorted = [...fixedPayments].sort(
    (a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Fixed payments</h1>
        <button
          onClick={() => (showForm ? resetForm() : openAdd())}
          className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          {showForm ? "Close" : "+ Add"}
        </button>
      </div>
      <p className="text-sm text-neutral-500">
        Rent, phone, subscriptions — the bills you can't skip. Tap “Paid” when one
        goes out and CashCow logs it and moves the date forward.
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800"
        >
          <div>
            <label className={labelCls}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Next Rent"
              className={field}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className={labelCls}>Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={field}>
                <option value="AUD">AUD</option>
                <option value="KRW">KRW</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={field}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
              <option value="">Select…</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={field}>
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f} className="capitalize">
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Next due date</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className={field}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
          >
            {editing ? "Save changes" : "Add fixed payment"}
          </button>
        </form>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-neutral-900 p-5 text-center ring-1 ring-neutral-800">
          <p className="text-3xl">🏠</p>
          <p className="mt-2 text-sm text-neutral-300">No fixed payments yet.</p>
          <p className="text-xs text-neutral-500">
            Add your rent or phone bill so CashCow knows what's coming up.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((fp) => {
            const days = daysUntil(fp.nextDueDate);
            const acc = accounts.find((a) => a.id === fp.accountId);
            return (
              <li
                key={fp.id}
                className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{fp.name}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {fp.category || "—"} · {acc ? acc.name : "no account"} ·{" "}
                      <span className="capitalize">{fp.frequency}</span>
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Due {fp.nextDueDate} · in {days} day{days === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-red-400">
                    {formatMoney(fp.amount, fp.currency)}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onMarkPaid(fp)}
                    className="flex-1 rounded-lg bg-emerald-500/15 py-1.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25"
                  >
                    ✓ Paid
                  </button>
                  <button
                    onClick={() => openEdit(fp)}
                    className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 ring-1 ring-neutral-700 hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(fp.id)}
                    className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-400 ring-1 ring-neutral-700 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EmptyNeedsAccount({ onNavigate }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Fixed payments</h1>
      <div className="rounded-2xl bg-neutral-900 p-6 text-center ring-1 ring-neutral-800">
        <p className="text-3xl">🏦</p>
        <p className="mt-2 text-sm text-neutral-300">Add an account first</p>
        <p className="mt-1 text-xs text-neutral-500">
          Fixed payments come out of an account, so you'll need one first.
        </p>
        <button
          onClick={() => onNavigate("accounts")}
          className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          Go to Accounts
        </button>
      </div>
    </div>
  );
}
