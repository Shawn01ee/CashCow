// AccountCard.jsx
// One card per account: name, currency, balance, a "Main" badge, a button to
// make it the main account, and an inline balance editor for manual fixes.
import { useState } from "react";
import { formatMoney } from "../utils/calculations";

export default function AccountCard({ account, onSetMain, onEditBalance }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(account.balance));

  function save() {
    const num = parseFloat(value);
    if (!Number.isNaN(num)) onEditBalance(account.id, num);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            {account.name}
            {account.isMain && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                MAIN
              </span>
            )}
          </p>
          <p className="text-xs text-neutral-500">{account.currency} account</p>
        </div>
        {!account.isMain && (
          <button
            onClick={() => onSetMain(account.id)}
            className="rounded-lg bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300 ring-1 ring-neutral-700 hover:text-white"
          >
            Set as main
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="w-full rounded-xl bg-neutral-800 px-3 py-2 text-lg font-semibold text-white outline-none ring-1 ring-neutral-700 focus:ring-emerald-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setValue(String(account.balance));
                setEditing(false);
              }}
              className="flex-1 rounded-lg bg-neutral-800 py-1.5 text-xs text-neutral-300 ring-1 ring-neutral-700 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="flex-1 rounded-lg bg-emerald-500 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-emerald-400"
            >
              Save balance
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-end justify-between">
          <p className="text-2xl font-semibold text-white">
            {formatMoney(account.balance, account.currency)}
          </p>
          <button
            onClick={() => {
              setValue(String(account.balance));
              setEditing(true);
            }}
            className="text-xs text-neutral-400 hover:text-white"
          >
            ✏️ Edit
          </button>
        </div>
      )}
    </div>
  );
}
