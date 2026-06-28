// AuthScreen.jsx
// Passwordless email OTP login, styled in the Buttercream design.
// Left: green brand panel (desktop only). Right: the email → code form.
import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { colors as C, radius as R, shadow as S, font } from "../theme/tokens";

const CODE_LENGTH = 8;

export default function AuthScreen() {
  const [step, setStep] = useState("email"); // "email" | "code"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [focus, setFocus] = useState(false);

  async function sendCode(e) {
    e?.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setStep("code");
      setMessage({ type: "ok", text: `We sent an 8-digit code to ${email}.` });
    } catch (err) {
      setMessage({ type: "err", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: "email",
      });
      if (error) throw error;
    } catch (err) {
      setMessage({ type: "err", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const inputWrap = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    border: `1.5px solid ${focus ? C.green : C.border}`,
    borderRadius: R.md,
    padding: "14px 16px",
    transition: "border-color .15s",
  };
  const input = {
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: 15,
    color: C.ink,
    flex: 1,
  };

  return (
    <div className="cc-auth" style={{ background: C.bg, fontFamily: font.family }}>
      {/* Left brand panel (desktop) */}
      <div
        className="cc-auth-brand"
        style={{
          background: C.green,
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 64px",
          color: "#fff",
        }}
      >
        <div style={{ position: "absolute", top: -60, left: -40, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.10)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -30, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
        <div style={{ position: "absolute", top: 64, right: 80, fontSize: 34, opacity: 0.5 }}>🪙</div>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: C.butter, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🐮</div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>CashCow</span>
        </div>
        <div style={{ fontSize: 38, lineHeight: 1.2, fontWeight: 800, letterSpacing: "-.03em" }}>
          Money habits,
          <br />made simple
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.92, marginTop: 16 }}>
          Track spending, bills and what's safe to spend —
          <br />all in one friendly place.
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>$58/day</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>safe to spend</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,.25)" }} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>No password</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>just a code</div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="cc-auth-form">
        {/* mobile logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: C.butter, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}>🐮</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: "-.02em" }}>CashCow</span>
        </div>

        {step === "email" ? (
          <>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, letterSpacing: "-.02em" }}>
              Welcome 👋
            </div>
            <div style={{ fontSize: 15, color: C.muted, marginTop: 8, marginBottom: 28 }}>
              Log in or sign up with your email
            </div>
            <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: C.sub }}>Email</label>
              <div style={inputWrap}>
                <span style={{ fontSize: 16, color: C.muted }}>✉️</span>
                <input
                  style={input}
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                  autoFocus
                />
              </div>
              {message && <Note message={message} />}
              <button type="submit" disabled={busy} style={ctaStyle(busy)}>
                {busy ? "Sending…" : "Send me a code"}
              </button>
              <div style={{ textAlign: "center", fontSize: 13, color: C.muted, marginTop: 2 }}>
                No password to remember — we'll email you a code. 🐮
              </div>
            </form>
          </>
        ) : (
          <>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, letterSpacing: "-.02em" }}>
              Almost there!
            </div>
            <div style={{ fontSize: 15, color: C.muted, marginTop: 8, marginBottom: 28 }}>
              Enter the 8-digit code we emailed you
            </div>
            <form onSubmit={verifyCode} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <CodeBoxes code={code} setCode={setCode} />
              {message && <Note message={message} />}
              <button type="submit" disabled={busy} style={ctaStyle(busy)}>
                {busy ? "Verifying…" : "Log in"}
              </button>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setMessage(null);
                  }}
                  style={linkBtn(C.muted)}
                >
                  ← Change email
                </button>
                <button type="button" onClick={sendCode} disabled={busy} style={linkBtn(C.green)}>
                  Resend code
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ctaStyle(busy) {
  return {
    marginTop: 8,
    border: "none",
    cursor: busy ? "not-allowed" : "pointer",
    background: C.green,
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    padding: "16px",
    borderRadius: R.md,
    fontFamily: "inherit",
    boxShadow: busy ? "none" : S.card,
    opacity: busy ? 0.7 : 1,
    transition: "background .15s",
  };
}

function linkBtn(color) {
  return {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color,
    fontWeight: 700,
    fontFamily: "inherit",
    fontSize: 13,
    padding: 0,
  };
}

function Note({ message }) {
  return (
    <p style={{ fontSize: 13, margin: 0, color: message.type === "err" ? C.coral : C.greenDark, fontWeight: 600 }}>
      {message.text}
    </p>
  );
}

// 8 single-digit boxes that fill as you type, in the Buttercream style.
function CodeBoxes({ code, setCode }) {
  const refs = useRef([]);

  function setDigit(i, raw) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const arr = code.split("");
    arr[i] = digit || "";
    const next = arr.join("").slice(0, CODE_LENGTH);
    setCode(next);
    if (digit && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
  }
  function onKeyDown(i, e) {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
  }
  function onPaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    setCode(text);
    refs.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus();
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
      {Array.from({ length: CODE_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[i] || ""}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          style={{
            width: "100%",
            height: 52,
            borderRadius: R.md,
            border: `1.5px solid ${C.border}`,
            background: "#fff",
            textAlign: "center",
            fontSize: 20,
            fontWeight: 800,
            color: C.ink,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      ))}
    </div>
  );
}
