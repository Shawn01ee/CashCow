// Insights.jsx — Buttercream analytics: donut + ranked bars + coach text.
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "./StatCard";
import {
  monthlyExpense,
  fixedVsVariable,
  categoryBreakdown,
  biggestVariableCategory,
  formatMoney,
} from "../utils/calculations";
import { colors as C, radius as R } from "../theme/tokens";

const COLORS = C.cat;

export default function Insights({ transactions }) {
  const total = monthlyExpense(transactions);
  const { fixed, variable } = fixedVsVariable(transactions);
  const breakdown = categoryBreakdown(transactions);
  const biggest = breakdown[0] || null;
  const biggestVar = biggestVariableCategory(transactions);

  const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 20 };

  if (total === 0) {
    return (
      <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>Insights</h1>
        <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
          No spending recorded this month yet. Add a few transactions and your patterns will show up here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>Insights</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard label="Spent this month" value={formatMoney(total)} tone="negative" />
        <StatCard label="Fixed vs flexible" value={`${Math.round((fixed / total) * 100)}% fixed`} hint={`${formatMoney(fixed)} fixed · ${formatMoney(variable)} flexible`} />
      </div>

      <div style={card}>
        <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: C.ink }}>Spending by category</h2>
        <div style={{ height: 220, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={breakdown} dataKey="total" nameKey="category" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {breakdown.map((entry, i) => (<Cell key={entry.category} fill={COLORS[i % COLORS.length]} />))}
              </Pie>
              <Tooltip
                formatter={(value) => formatMoney(value)}
                contentStyle={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, color: C.ink }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {breakdown.map((row, i) => {
            const pct = Math.round((row.total / total) * 100);
            const color = COLORS[i % COLORS.length];
            return (
              <li key={row.category}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, color: C.ink, fontWeight: 700 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                    {row.category}
                  </span>
                  <span style={{ color: C.muted }}>{formatMoney(row.total)} · {pct}%</span>
                </div>
                <div style={{ height: 7, borderRadius: R.full, background: C.divider, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: R.full, width: `${pct}%`, background: color }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ ...card, fontSize: 14, lineHeight: 1.6, color: C.sub }}>
        {biggest && (
          <p style={{ margin: 0 }}>
            🏆 <strong style={{ color: C.ink }}>{biggest.category}</strong> takes the largest share of your spending this month ({formatMoney(biggest.total)}).
          </p>
        )}
        {biggestVar && (
          <p style={{ margin: "8px 0 0" }}>
            🍜 Your biggest flexible category is <strong style={{ color: C.ink }}>{biggestVar.category}</strong>. Variable spending is the easiest area to control.
          </p>
        )}
      </div>
    </div>
  );
}
