// Dashboard.jsx — Home screen in the Buttercream theme.
import { useState, useEffect } from "react";
import StatCard from "./StatCard";
import MoneyFeed from "./MoneyFeed";
import {
  totalAudBalance,
  availableAudBalance,
  protectedAudBalance,
  mainAccount,
  monthlyIncome,
  monthlyExpense,
  monthlyNet,
  nextFixedPayment,
  safeToSpend,
  daysUntil,
  formatMoney,
} from "../utils/calculations";
import { colors as C, radius as R, shadow as S } from "../theme/tokens";
import { useLang } from "../i18n";

const WMO_ICON = (code) => {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌦️";
  if (code <= 86) return "🌨️";
  return "⛈️";
};

const DAYS_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DAYS_KO = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function WeatherBar({ lang }) {
  const ko = lang === "ko";
  const [time, setTime] = useState(new Date());
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lon } = coords;
      try {
        const [geoRes, wxRes] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`),
        ]);
        const geo = await geoRes.json();
        const wx = await wxRes.json();
        const city = geo.address?.city || geo.address?.town || geo.address?.suburb || geo.address?.village || "";
        const country = geo.address?.country || "";
        const temp = Math.round(wx.current?.temperature_2m ?? 0);
        const icon = WMO_ICON(wx.current?.weather_code ?? 0);
        setInfo({ city, country, temp, icon });
      } catch {}
    }, () => {});
  }, []);

  const hh = time.getHours();
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = String(hh % 12 || 12).padStart(2, "0");

  const day = time.getDay();
  const date = time.getDate();
  const month = time.getMonth();
  const year = time.getFullYear();

  const dayStr = ko ? DAYS_KO[day] : DAYS_EN[day];
  const dateStr = ko
    ? `${year}년 ${month + 1}월 ${date}일`
    : `${MONTHS_EN[month]} ${date}, ${year}`;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      background: "linear-gradient(135deg, #fffbf0 0%, #f5f0e8 100%)",
      border: `1px solid ${C.border}`,
      borderRadius: R.xl,
      padding: "16px 20px",
    }}>
      {/* Mascot */}
      <img
        src="/mascot.png"
        alt="CashCow"
        style={{ width: 64, height: 64, objectFit: "contain", flexShrink: 0 }}
      />

      {/* Text block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Day of week */}
        <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 1 }}>
          {dayStr}
        </div>
        {/* Date */}
        <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: "-.03em", lineHeight: 1.1, marginBottom: 6 }}>
          {dateStr}
        </div>
        {/* Time + weather row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 500,
          color: C.sub,
          fontVariantNumeric: "tabular-nums",
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: C.ink, fontVariantNumeric: "tabular-nums" }}>
            {h12}:{mm}<span style={{ fontSize: 14, fontWeight: 600, color: C.sub }}>{ss}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginLeft: 4 }}>{ampm}</span>
          </span>
          {info && (
            <>
              <span style={{ color: C.border }}>·</span>
              <span style={{ fontSize: 16 }}>{info.icon}</span>
              <span style={{ fontWeight: 600, color: C.sub }}>{info.temp}°C</span>
              <span style={{ color: C.border }}>·</span>
              <span style={{ color: C.muted }}>{info.city}{info.country ? `, ${info.country}` : ""}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 20 };

export default function Dashboard({
  accounts,
  transactions,
  fixedPayments,
  categories,
  hasAccounts,
  onNavigate,
}) {
  const { t, lang } = useLang();
  if (!hasAccounts) return <Onboarding onNavigate={onNavigate} />;

  const totalAud = totalAudBalance(accounts);
  const available = availableAudBalance(accounts);
  const protectedBal = protectedAudBalance(accounts);
  const main = mainAccount(accounts);
  const income = monthlyIncome(transactions);
  const expense = monthlyExpense(transactions);
  const net = monthlyNet(transactions);
  const nextFP = nextFixedPayment(fixedPayments);
  const safe = safeToSpend(accounts, fixedPayments);

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  const iconFor = (name) => categories.find((c) => c.name === name)?.icon || "💵";

  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
      <WeatherBar lang={lang} />
      {/* Hero: total balance */}
      <div style={{ background: C.green, borderRadius: R["2xl"], padding: "26px 28px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <img src="/mascot.png" alt="" style={{ position: "absolute", right: 12, top: 10, width: 90, height: 90, objectFit: "contain", opacity: 0.22, pointerEvents: "none" }} />
        <div style={{ fontSize: 14, opacity: 0.92, fontWeight: 600 }}>{t("Total balance (AUD)")}</div>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-.03em", margin: "6px 0 12px" }}>
          {formatMoney(totalAud)}
        </div>
        {protectedBal > 0 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.butter, color: "#5A4000", padding: "6px 13px", borderRadius: R.full, fontSize: 13, fontWeight: 800 }}>
              {t("Available")} {formatMoney(available)}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.18)", color: "#fff", padding: "6px 13px", borderRadius: R.full, fontSize: 13, fontWeight: 800 }}>
              🔒 {t("Protected")} {formatMoney(protectedBal)}
            </span>
          </div>
        ) : main ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.butter, color: "#5A4000", padding: "6px 13px", borderRadius: R.full, fontSize: 13, fontWeight: 800 }}>
            {t("Main")} · {main.name} {formatMoney(main.balance, main.currency)}
          </div>
        ) : null}
      </div>

      {/* Safe to spend hero insight */}
      <div
        style={{
          ...card,
          background: safe.covered ? C.greenSoft : "#FFE9E2",
          border: `1px solid ${safe.covered ? "#BFE9D2" : "#FFD2C5"}`,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: C.muted }}>
          {t("Safe to spend per day")}
        </div>
        {safe.covered ? (
          <>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.greenDark, margin: "4px 0" }}>
              {formatMoney(safe.perDay)}
            </div>
            <div style={{ fontSize: 14, color: C.sub }}>
              {safe.target
                ? lang === "ko"
                  ? safe.mode === "income"
                    ? `다음 수입(${safe.target.name})까지 ${safe.daysLeft}일${safe.billsBefore > 0 ? ` · 고정지출 ${formatMoney(safe.billsBefore)} 제외` : ""}`
                    : `${safe.target.name} 결제까지 ${safe.daysLeft}일`
                  : safe.mode === "income"
                    ? `${safe.daysLeft} days until ${safe.target.name}${safe.billsBefore > 0 ? ` · ${formatMoney(safe.billsBefore)} in bills deducted` : ""}`
                    : `until ${safe.target.name} on ${safe.target.nextDueDate} (${safe.daysLeft} days)`
                : t("no upcoming fixed payments")}
            </div>
            {safe.mode !== "income" && (
              <div
                onClick={() => onNavigate("fixed")}
                style={{ fontSize: 12, color: C.green, marginTop: 6, cursor: "pointer", fontWeight: 600 }}
              >
                {lang === "ko" ? "💡 수입 등록하면 더 정확해져요 →" : "💡 Add your income for smarter budgeting →"}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 19, fontWeight: 800, color: C.coral, margin: "4px 0" }}>
              {lang === "ko"
                ? `주의: 잔액이 ${safe.target?.name} 결제에 부족할 수 있어요.`
                : `Warning: your balance may not cover ${safe.target?.name}.`}
            </div>
            <div style={{ fontSize: 14, color: C.sub }}>
              {lang === "ko"
                ? `약 ${formatMoney(safe.amountNeeded)} 부족해요.`
                : `You're about ${formatMoney(safe.amountNeeded)} short.`}
            </div>
          </>
        )}
      </div>

      {/* This month grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard label={t("This month in")} value={formatMoney(income)} tone="positive" />
        <StatCard label={t("This month out")} value={formatMoney(expense)} tone="negative" />
        <StatCard
          label={t("Left this month")}
          value={formatMoney(net)}
          tone={net >= 0 ? "positive" : "negative"}
          hint={net >= 0 ? t("income minus spending") : t("spending more than you earned")}
        />
        <button onClick={() => onNavigate("fixed")} style={{ textAlign: "left", border: "none", padding: 0, background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
          <StatCard
            label={t("Next fixed payment ›")}
            value={nextFP ? formatMoney(nextFP.amount, nextFP.currency) : t("Add one")}
            hint={nextFP ? (lang === "ko" ? `${nextFP.name} · ${daysUntil(nextFP.nextDueDate)}일 후` : `${nextFP.name} · in ${daysUntil(nextFP.nextDueDate)} days`) : t("tap to add rent / phone bill")}
          />
        </button>
      </div>

      <MoneyFeed accounts={accounts} transactions={transactions} fixedPayments={fixedPayments} />

      {/* Recent activity */}
      <section style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.ink }}>{t("Recent activity")}</h2>
          <button onClick={() => onNavigate("transactions")} style={{ border: "none", background: "transparent", color: C.green, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            {t("See all ›")}
          </button>
        </div>
        {recent.length === 0 ? (
          <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>{t("No transactions yet.")}</p>
        ) : (
          recent.map((tx) => (
            <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${C.divider}` }}>
              <div style={{ width: 40, height: 40, borderRadius: R.md, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {iconFor(tx.category)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.memo || tx.category}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{tx.category} · {tx.date}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: tx.type === "income" ? C.greenDark : C.ink }}>
                {tx.type === "income" ? "+" : "−"}{formatMoney(tx.amount, tx.currency)}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function Onboarding({ onNavigate }) {
  const { t } = useLang();
  return (
    <div style={{ animation: "ccUp .35s ease", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p style={{ margin: 0, fontSize: 14, color: C.muted }}>{t("Welcome to CashCow 🐮")}</p>
        <h1 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: C.ink }}>{t("Let's set you up")}</h1>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 24 }}>
        <p style={{ margin: 0, fontSize: 14, color: C.sub, lineHeight: 1.6 }}>
          {t("CashCow works out how much you can safely spend each day. To start, add your first account (like your bank) with its current balance.")}
        </p>
        <ol style={{ margin: "16px 0 0", paddingLeft: 18, fontSize: 14, color: C.sub, lineHeight: 1.9 }}>
          <li>{t("Add an account & balance")}</li>
          <li>{t("Add your rent / phone bill as a fixed payment")}</li>
          <li>{t("Log a coffee or lunch, then watch your safe to spend")}</li>
        </ol>
        <button
          onClick={() => onNavigate("accounts")}
          style={{ marginTop: 20, width: "100%", border: "none", cursor: "pointer", background: C.green, color: "#fff", fontSize: 15, fontWeight: 700, padding: 14, borderRadius: R.md, fontFamily: "inherit", boxShadow: S.card }}
        >
          {t("Create my first account")}
        </button>
      </div>
    </div>
  );
}
