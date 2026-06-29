// LangToggle.jsx — small EN / 한 switch, used on the login & onboarding screens.
import { useLang } from "../i18n";
import { colors as C, radius as R } from "../theme/tokens";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: "inline-flex", gap: 2, background: "rgba(255,255,255,.6)", border: `1px solid ${C.border}`, borderRadius: R.full, padding: 3 }}>
      {[["en", "EN"], ["ko", "한"]].map(([code, label]) => {
        const active = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            style={{ border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 800, padding: "5px 12px", borderRadius: 999, background: active ? C.green : "transparent", color: active ? "#fff" : C.sub }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
