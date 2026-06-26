// AddTransaction.jsx
// A controlled form for logging income or expenses. "Controlled" means every
// input's value comes from React state, so we always know the current form
// data and can build a clean transaction object on submit.
import { useState } from "react";
import { quickAdds } from "../data/sampleData";

// Today's date as YYYY-MM-DD, used as the default date.
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTransaction({
  categories,
  accounts,
  editingTx, // a transaction object when editing, otherwise null/undefined
  onAdd,
  onUpdate,
  onCancel,
}) {
  const isEditing = Boolean(editingTx);

  // Each field is a piece of state. When editing, we seed it from editingTx.
  // (App passes a unique `key`, so this component remounts and re-seeds
  //  whenever the edit target changes.)
  const [type, setType] = useState(editingTx?.type || "expense");
  const [amount, setAmount] = useState(editingTx ? String(editingTx.amount) : "");
  const [currency, setCurrency] = useState(editingTx?.currency || "AUD");
  const [category, setCategory] = useState(editingTx?.category || "");
  const [accountId, setAccountId] = useState(
    editingTx?.accountId || accounts[0]?.id || ""
  );
  const [memo, setMemo] = useState(editingTx?.memo || "");
  const [date, setDate] = useState(editingTx?.date || today());
  const [isFixed, setIsFixed] = useState(editingTx?.isFixed || false);

  // Only show categories that match the selected type (income vs expense).
  const visibleCategories = categories.filter((c) => c.type === type);

  // When the user taps a quick-add chip, pre-fill several fields at once.
  function applyQuickAdd(q) {
    setType(q.type);
    setCategory(q.category);
    setAmount(String(q.amount));
    setCurrency("AUD");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert("Please enter an amount greater than 0.");
      return;
    }
    if (!category) {
      alert("Please pick a category.");
      return;
    }

    // Build the transaction object that matches our data model.
    const tx = {
      // Keep the same id when editing; create a new one when adding.
      id: isEditing ? editingTx.id : `tx-${Date.now()}`,
      type,
      amount: numericAmount,
      currency,
      category,
      accountId,
      memo: memo.trim(),
      date,
      isFixed,
    };

    // App handles saving + balance update + navigation for both cases.
    if (isEditing) onUpdate(tx);
    else onAdd(tx);
  }

  // Shared styling for inputs so the form stays consistent.
  const field =
    "w-full rounded-xl bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-neutral-700 focus:ring-emerald-500";
  const labelCls = "mb-1 block text-xs font-medium text-neutral-400";

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">
        {isEditing ? "Edit transaction" : "Add transaction"}
      </h1>

      {/* Quick adds (hidden while editing — they're for fast new entries) */}
      <div className={isEditing ? "hidden" : ""}>
        <p className={labelCls}>Quick add</p>
        <div className="flex flex-wrap gap-2">
          {quickAdds.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => applyQuickAdd(q)}
              className="flex items-center gap-1.5 rounded-full bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 ring-1 ring-neutral-700 hover:bg-neutral-700"
            >
              <span>{q.icon}</span> {q.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Income / Expense toggle */}
        <div className="grid grid-cols-2 gap-2">
          {["expense", "income"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategory(""); // reset category since the list changes
              }}
              className={`rounded-xl py-2.5 text-sm font-medium capitalize ring-1 transition-colors ${
                type === t
                  ? t === "income"
                    ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/40"
                    : "bg-red-500/15 text-red-400 ring-red-500/40"
                  : "bg-neutral-800 text-neutral-400 ring-neutral-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Amount + currency */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className={labelCls}>Amount</label>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={field}
            />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={field}
            >
              <option value="AUD">AUD</option>
              <option value="KRW">KRW</option>
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className={labelCls}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={field}
          >
            <option value="">Select a category…</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account */}
        <div>
          <label className={labelCls}>Account</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className={field}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.currency})
              </option>
            ))}
          </select>
        </div>

        {/* Memo + date */}
        <div>
          <label className={labelCls}>Memo</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="e.g. Iced latte"
            className={field}
          />
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={field}
          />
        </div>

        {/* Fixed vs variable */}
        <div className="flex items-center justify-between rounded-xl bg-neutral-800 px-3 py-2.5 ring-1 ring-neutral-700">
          <div>
            <p className="text-sm text-white">Fixed payment?</p>
            <p className="text-xs text-neutral-500">
              Rent, phone, subscriptions — things you can't easily skip.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFixed((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              isFixed ? "bg-emerald-500" : "bg-neutral-600"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                isFixed ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl bg-neutral-800 py-3 text-sm font-semibold text-neutral-300 ring-1 ring-neutral-700 hover:text-white"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
          >
            {isEditing ? "Save changes" : "Save transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
