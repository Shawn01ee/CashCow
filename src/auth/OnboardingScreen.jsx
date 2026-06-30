// OnboardingScreen.jsx — 3-step intro shown before login (first visit).
// Reuses the same responsive cc-auth layout as the login screen.
import { useState } from "react";
import { colors as C, radius as R, shadow as S, font } from "../theme/tokens";
import { useLang } from "../i18n";
import LangToggle from "../components/LangToggle";

const SLIDES = [
  {
    emoji: "🐮",
    title: "Welcome to\nCashCow",
    desc: "Track spending, bills, and accounts,\nall in one friendly place.",
    cta: "Next",
  },
  {
    emoji: "🎯",
    title: "Know what's\nsafe to spend",
    desc: "CashCow works out how much you can\nspend each day before your next bill.",
    cta: "Next",
  },
  {
    emoji: "📊",
    title: "Clear weekly\ninsights",
    desc: "See where your money goes, so nothing\nslips through the cracks.",
    cta: "Get started",
  },
];

export default function OnboardingScreen({ onFinish }) {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];

  function next() {
    if (step >= SLIDES.length - 1) onFinish();
    else setStep(step + 1);
  }

  return (
    <div className="cc-auth" style={{ background: C.bg, fontFamily: font.family }}>
      {/* Left green panel with the slide emoji */}
      <div
        className="cc-auth-brand"
        style={{ background: C.green, position: "relative", overflow: "hidden", alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ position: "absolute", top: -60, left: -40, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.10)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -30, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
        <div style={{ position: "absolute", top: 60, right: 70, fontSize: 38, opacity: 0.5 }}>💰</div>
        <div style={{ position: "absolute", bottom: 120, left: 80, fontSize: 30, opacity: 0.45 }}>✨</div>
        <div
          key={slide.emoji}
          style={{ width: 260, height: 260, borderRadius: 64, background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 140, animation: "ccPop .5s ease" }}
        >
          {slide.emoji}
        </div>
      </div>

      {/* Right content */}
      <div className="cc-auth-form">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <img src="/mascot.png" alt="CashCow" style={{ width: 42, height: 42, borderRadius: 13, objectFit: "cover" }} />
            <span style={{ fontSize: 21, fontWeight: 800, color: C.ink, letterSpacing: "-.02em" }}>CashCow</span>
          </div>
          <LangToggle />
        </div>

        <div key={slide.title} style={{ whiteSpace: "pre-line", fontSize: 38, lineHeight: 1.18, fontWeight: 800, color: C.ink, letterSpacing: "-.03em", animation: "ccUp .45s ease" }}>
          {t(slide.title)}
        </div>
        <div style={{ whiteSpace: "pre-line", fontSize: 16, lineHeight: 1.6, color: C.sub, marginTop: 16 }}>
          {t(slide.desc)}
        </div>

        <div style={{ display: "flex", gap: 8, margin: "36px 0 26px" }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{ height: 8, borderRadius: 999, transition: "all .3s", width: i === step ? 26 : 8, background: i === step ? C.green : "#E0D6C2" }} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={next} style={{ border: "none", cursor: "pointer", background: C.green, color: "#fff", fontSize: 16, fontWeight: 700, padding: "15px 28px", borderRadius: R.md, fontFamily: "inherit", boxShadow: S.card }}>
            {t(slide.cta)}
          </button>
          <button onClick={onFinish} style={{ border: "none", cursor: "pointer", background: "transparent", color: C.muted, fontSize: 15, fontWeight: 600, padding: "13px 10px", fontFamily: "inherit" }}>
            {t("Skip")}
          </button>
        </div>
      </div>
    </div>
  );
}
