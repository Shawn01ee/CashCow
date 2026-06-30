// Insights.jsx — Buttercream analytics: spending trend + donut + ranked bars.
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "./StatCard";
import {
  monthlyExpense,
  fixedVsVariable,
  categoryBreakdown,
  biggestVariableCategory,
  expenseTrend,
  ratingSummary,
  formatMoney,
} from "../utils/calculations";

import { colors as C, radius as R } from "../theme/tokens";
import MonthNav from "./MonthNav";
import { useLang } from "../i18n";

const RATING_META = [
  { key: "good", icon: "✅", label: "Worth it", color: "#1A9D63" },
  { key: "warn", icon: "⚠️", label: "Meh", color: "#B26A00" },
  { key: "bad", icon: "❌", label: "Regret", color: "#FF7A59" },
];

const COLORS = C.cat;
const GRANULARITIES = [["month", "Month"], ["year", "Year"]];

export default function Insights({ transactions, monthDate = new Date(), onMonthChange }) {
  const { t, lang } = useLang();
  const ko = lang === "ko";
  const [granularity, setGranularity] = useState("month"); // "month" | "year"

  // Stats follow the selected period (a month, or the whole year).
  const total = monthlyExpense(transactions, monthDate, granularity);
  const { fixed, variable } = fixedVsVariable(transactions, monthDate, granularity);
  const breakdown = categoryBreakdown(transactions, monthDate, granularity);
  const biggest = breakdown[0] || null;
  const biggestVar = biggestVariableCategory(transactions, monthDate, granularity);
  // Trend bars: last 6 months in month view, last 5 years in year view.
  const trend = expenseTrend(transactions, granularity, monthDate);
  const trendMax = Math.max(1, ...trend.map((b) => b.total));
  const rating = ratingSummary(transactions, monthDate, granularity);
  const ratedCount = rating.good.count + rating.warn.count + rating.bad.count;
  const periodLabel = ko
    ? granularity === "year" ? "올해" : "이번 달"
    : granularity === "year" ? "this year" : "this month";

  const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 20 };

  const Header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.ink }}>{t("Insights")}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {/* Month vs Year analysis */}
        <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 11, padding: 4 }}>
          {GRANULARITIES.map(([key, label]) => {
            const active = granularity === key;
            return (
              <button
                key={key}
                onClick={() => setGranularity(key)}
                style={{ padding: "6px 14px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: active ? C.green : "transparent", color: active ? "#fff" : C.sub }}
              >
                {t(label)}
              </button>
            );
          })}
        </div>
        {onMonthChange && <MonthNav monthDate={monthDate} onChange={onMonthChange} granularity={granularity} />}
      </div>
    </div>
  );

  if (total === 0) {
    return (
      <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
        {Header}
        <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
          {ko ? `${periodLabel}에 기록된 지출이 없어요. 거래를 추가하거나 다른 기간을 골라보세요.` : `No spending recorded for ${periodLabel}. Add a few transactions or pick another period.`}
        </p>
      </div>
    );
  }

  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
      {Header}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard label={ko ? `${periodLabel} 지출` : `Spent ${periodLabel}`} value={formatMoney(total)} tone="negative" />
        <StatCard label={t("Fixed vs flexible")} value={ko ? `고정 ${Math.round((fixed / total) * 100)}%` : `${Math.round((fixed / total) * 100)}% fixed`} hint={ko ? `고정 ${formatMoney(fixed)} · 변동 ${formatMoney(variable)}` : `${formatMoney(fixed)} fixed · ${formatMoney(variable)} flexible`} />
      </div>

      {/* How spending felt (from ratings) */}
      {ratedCount > 0 && (
        <div style={card}>
          <h2 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 800, color: C.ink }}>{t("How your spending felt")}</h2>
          {(() => {
            const ratedTotal = rating.good.total + rating.warn.total + rating.bad.total;
            const pct = (v) => (ratedTotal > 0 ? Math.round((v / ratedTotal) * 100) : 0);
            return (
              <>
                <div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ width: `${pct(rating.good.total)}%`, background: "#34C77B" }} />
                  <div style={{ width: `${pct(rating.warn.total)}%`, background: "#FFCB45" }} />
                  <div style={{ width: `${pct(rating.bad.total)}%`, background: "#FF7A59" }} />
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: C.sub }}>
                  {ko ? <>평가한 지출 중 <strong style={{ color: "#1A9D63" }}>{pct(rating.good.total)}%</strong>가 만족스러웠어요.</> : <><strong style={{ color: "#1A9D63" }}>{pct(rating.good.total)}%</strong> of rated spending felt worth it.</>}
                </p>
              </>
            );
          })()}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {RATING_META.map((r) => (
              <div key={r.key} style={{ textAlign: "center", background: C.bg, borderRadius: R.md, padding: "12px 6px" }}>
                <div style={{ fontSize: 22 }}>{r.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: r.color, marginTop: 4 }}>{formatMoney(rating[r.key].total)}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{t(r.label)} · {rating[r.key].count}</div>
              </div>
            ))}
          </div>
          {rating.bad.total > 0 && (
            <p style={{ margin: "12px 0 0", fontSize: 14, color: C.sub, lineHeight: 1.5 }}>
              {ko
                ? <>❌ <strong style={{ color: C.ink }}>{formatMoney(rating.bad.total)}</strong>을 후회한 지출로 표시했어요 ({rating.bad.count}건). 다음 달엔 한번 줄여봐요!</>
                : <>❌ You marked <strong style={{ color: C.ink }}>{formatMoney(rating.bad.total)}</strong> as regretted spending ({rating.bad.count} purchase{rating.bad.count === 1 ? "" : "s"}). Worth a look next month!</>}
            </p>
          )}
        </div>
      )}

      {/* Spending trend — last 6 months (month view) or last 5 years (year view) */}
      <div style={card}>
        <h2 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 800, color: C.ink }}>
          {t("Spending trend")}{" "}
          <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>
            ({ko ? (granularity === "year" ? "최근 5년" : "최근 6개월") : (granularity === "year" ? "last 5 years" : "last 6 months")})
          </span>
        </h2>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 150, gap: 10 }}>
          {trend.map((b, i) => {
            const hot = i === trend.length - 1;
            const h = Math.round((b.total / trendMax) * 120);
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end", height: "100%" }}>
                <div title={formatMoney(b.total)} style={{ width: "100%", maxWidth: 38, height: Math.max(6, h), borderRadius: 9, background: hot ? C.green : C.barIdle, transition: "height .3s" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: hot ? C.ink : C.muted }}>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={card}>
        <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: C.ink }}>{t("Spending by category")}</h2>
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
                    {t(row.category)}
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
        <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: C.ink }}>{t("Where your money went")}</h2>
        {biggest && (
          <p style={{ margin: 0 }}>
            {ko
              ? <>🏆 {periodLabel} 가장 많이 쓴 곳은 <strong style={{ color: C.ink }}>{t(biggest.category)}</strong>예요: {formatMoney(biggest.total)} (전체의 {Math.round((biggest.total / total) * 100)}%).</>
              : <>🏆 You spent the most on <strong style={{ color: C.ink }}>{biggest.category}</strong> {periodLabel}: {formatMoney(biggest.total)} ({Math.round((biggest.total / total) * 100)}% of all spending).</>}
          </p>
        )}
        {breakdown[1] && (
          <p style={{ margin: "8px 0 0" }}>
            {ko
              ? <>🥈 다음은 <strong style={{ color: C.ink }}>{t(breakdown[1].category)}</strong> ({formatMoney(breakdown[1].total)}){breakdown[2] ? <>, <strong style={{ color: C.ink }}>{t(breakdown[2].category)}</strong> ({formatMoney(breakdown[2].total)})</> : ""} 순이에요.</>
              : <>🥈 Next up: <strong style={{ color: C.ink }}>{breakdown[1].category}</strong> ({formatMoney(breakdown[1].total)}){breakdown[2] ? <> and <strong style={{ color: C.ink }}>{breakdown[2].category}</strong> ({formatMoney(breakdown[2].total)})</> : ""}.</>}
          </p>
        )}
        {biggestVar && (
          <p style={{ margin: "8px 0 0" }}>
            {ko
              ? <>🍜 가장 큰 변동 지출은 <strong style={{ color: C.ink }}>{t(biggestVar.category)}</strong>예요. 변동 지출이 가장 줄이기 쉬워요.</>
              : <>🍜 Your biggest flexible category is <strong style={{ color: C.ink }}>{biggestVar.category}</strong>. Variable spending is the easiest area to control.</>}
          </p>
        )}
      </div>
    </div>
  );
}
