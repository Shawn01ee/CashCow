// SetupNeeded.jsx — shown when Supabase keys are missing (buttercream).
import { colors as C, radius as R, font } from "../theme/tokens";

export default function SetupNeeded() {
  const code = { color: C.greenDark, fontWeight: 700 };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 16, fontFamily: font.family }}>
      <div style={{ maxWidth: 440, background: C.card, border: `1px solid ${C.border}`, borderRadius: R.xl, padding: 24 }}>
        <div style={{ fontSize: 30 }}>🐮🔧</div>
        <h1 style={{ margin: "12px 0 0", fontSize: 19, fontWeight: 800, color: C.ink }}>Almost there!</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: C.sub }}>
          CashCow can't find your Supabase keys yet. To connect the database:
        </p>
        <ol style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 14, color: C.ink, lineHeight: 1.8 }}>
          <li>Create a project at supabase.com</li>
          <li>Copy <code style={code}>.env.local.example</code> to <code style={code}>.env.local</code></li>
          <li>Paste your Project URL and anon key into it</li>
          <li>Restart the dev server (<code style={code}>npm run dev</code>)</li>
        </ol>
      </div>
    </div>
  );
}
