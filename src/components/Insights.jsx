// Insights.jsx
// A simple analytics screen for THIS month's expenses:
//   - fixed vs variable totals
//   - a donut chart of spending by category (Recharts)
//   - a ranked bar list (works even if you remove the chart)
//   - friendly coach text
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "./StatCard";
import {
  monthlyExpense,
  fixedVsVariable,
  categoryBreakdown,
  biggestVariableCategory,
  formatMoney,
} from "../utils/calculations";

// A small palette reused across slices/bars.
const COLORS = [
  "#34d399", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa",
  "#f472b6", "#22d3ee", "#fb923c", "#4ade80", "#e879f9",
];

export default function Insights({ transactions }) {
  const total = monthlyExpense(transactions);
  const { fixed, variable } = fixedVsVariable(transactions);
  const breakdown = categoryBreakdown(transactions); // sorted biggest first
  const biggest = breakdown[0] || null;
  const biggestVar = biggestVariableCategory(transactions);

  // Empty state when there's nothing to analyse yet.
  if (total === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-white">Insights</h1>
        <p className="text-sm text-neutral-500">
          No spending recorded this month yet. Add a few transactions and your
          patterns will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Insights</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Spent this month" value={formatMoney(total)} tone="negative" />
        <StatCard
          label="Fixed vs flexible"
          value={`${Math.round((fixed / total) * 100)}% fixed`}
          hint={`${formatMoney(fixed)} fixed · ${formatMoney(variable)} flexible`}
        />
      </div>

      {/* Donut chart */}
      <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
        <h2 className="mb-2 text-sm font-semibold text-neutral-300">
          Spending by category
        </h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="total"
                nameKey="category"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {breakdown.map((entry, i) => (
                  <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatMoney(value)}
                contentStyle={{
                  background: "#171717",
                  border: "1px solid #404040",
                  borderRadius: "0.75rem",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ranked bar list (also a legend for the donut) */}
        <ul className="mt-2 space-y-2">
          {breakdown.map((row, i) => {
            const pct = Math.round((row.total / total) * 100);
            return (
              <li key={row.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-neutral-200">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    {row.category}
                  </span>
                  <span className="text-neutral-400">
                    {formatMoney(row.total)} · {pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Coach text */}
      <div className="rounded-2xl bg-neutral-900 p-4 text-sm leading-relaxed text-neutral-300 ring-1 ring-neutral-800">
        {biggest && (
          <p>
            🏆 <strong className="text-white">{biggest.category}</strong> takes the
            largest share of your spending this month ({formatMoney(biggest.total)}).
          </p>
        )}
        {biggestVar && (
          <p className="mt-2">
            🍜 Your biggest flexible category is{" "}
            <strong className="text-white">{biggestVar.category}</strong>. Variable
            spending is the easiest area to control.
          </p>
        )}
      </div>
    </div>
  );
}
