// Accounts.jsx
// Lists account cards and provides a small form to add a new account.
import { useState } from "react";
import AccountCard from "./AccountCard";
import { totalAudBalance, formatMoney } from "../utils/calculations";

export default function Accounts({ accounts, onAddAccount, onSetMain }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [balance, setBalance] = useState("");

  const totalAud = totalAudBalance(accounts);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please give the account a name.");
      return;
    }
    const account = {
      id: `acc-${Date.now()}`,
      name: name.trim(),
      currency,
      balance: parseFloat(balance) || 0,
      isMain: false,
    };
    onAddAccount(account);
    // Reset and close the form.
    setName("");
    setBalance("");
    setCurrency("AUD");
    setShowForm(false);
  }

  const field =
    "w-full rounded-xl bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-neutral-700 focus:ring-emerald-500";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Accounts</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          {showForm ? "Close" : "+ Add"}
        </button>
      </div>

      <p className="text-sm text-neutral-500">
        Total AUD across all accounts:{" "}
        <span className="font-semibold text-white">{formatMoney(totalAud)}</span>
      </p>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Account name (e.g. Wise)"
            className={field}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={field}
            >
              <option value="AUD">AUD</option>
              <option value="KRW">KRW</option>
            </select>
            <input
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="Starting balance"
              className={field}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
          >
            Add account
          </button>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {accounts.map((acc) => (
          <AccountCard key={acc.id} account={acc} onSetMain={onSetMain} />
        ))}
      </div>
    </div>
  );
}
