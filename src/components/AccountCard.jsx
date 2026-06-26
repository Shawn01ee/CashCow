// AccountCard.jsx
// One card per account: name, currency, balance, a "Main" badge, and a
// button to make it the main account.
import { formatMoney } from "../utils/calculations";

export default function AccountCard({ account, onSetMain }) {
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
      <p className="mt-3 text-2xl font-semibold text-white">
        {formatMoney(account.balance, account.currency)}
      </p>
    </div>
  );
}
