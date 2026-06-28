// AuthScreen.jsx
// Passwordless login: the user types their email, we email them a 6-digit
// code, and they type it back. Sign-up and login are the same flow — if the
// email is new, Supabase creates the account automatically.
import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";

const CODE_LENGTH = 8;

// A row of single-digit boxes that fill as you type, auto-advance to the next
// box, support backspace, and accept a pasted code.
function CodeBoxes({ code, setCode }) {
  const refs = useRef([]);

  function setDigit(i, raw) {
    const digit = raw.replace(/\D/g, "").slice(-1); // last typed digit only
    const arr = code.split("");
    arr[i] = digit || "";
    const next = arr.join("").slice(0, CODE_LENGTH);
    setCode(next);
    if (digit && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
  }

  function onKeyDown(i, e) {
    // Backspace on an empty box jumps to the previous one.
    if (e.key === "Backspace" && !code[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function onPaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    setCode(text);
    refs.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus();
  }

  return (
    <div className="flex justify-between gap-1.5">
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
          className="h-12 w-full rounded-xl bg-neutral-800 text-center text-lg font-semibold text-white outline-none ring-1 ring-neutral-700 focus:ring-emerald-500"
        />
      ))}
    </div>
  );
}

export default function AuthScreen() {
  const [step, setStep] = useState("email"); // "email" | "code"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  // Step 1: send the 6-digit code to the email.
  async function sendCode(e) {
    e?.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }, // new email → make an account
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

  // Step 2: verify the code → logs the user in (AuthContext picks it up).
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
      // Success — the auth listener swaps us into the app.
    } catch (err) {
      setMessage({ type: "err", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-neutral-700 focus:ring-emerald-500";

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-4xl">🐮</div>
          <h1 className="mt-2 text-2xl font-bold text-white">CashCow</h1>
          <p className="text-sm text-neutral-500">
            {step === "email"
              ? "Your money, made simple. Enter your email to start."
              : "Almost there! Enter the code we emailed you."}
          </p>
        </div>

        {step === "email" ? (
          <form
            onSubmit={sendCode}
            className="space-y-3 rounded-2xl bg-neutral-900 p-5 ring-1 ring-neutral-800"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-400">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={field}
                autoFocus
              />
            </div>
            {message && <Note message={message} />}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send me a code"}
            </button>
            <p className="text-center text-xs text-neutral-600">
              No password to remember — we'll email you a quick 8-digit code. 🐮
            </p>
          </form>
        ) : (
          <form
            onSubmit={verifyCode}
            className="space-y-3 rounded-2xl bg-neutral-900 p-5 ring-1 ring-neutral-800"
          >
            <div>
              <label className="mb-2 block text-xs font-medium text-neutral-400">
                8-digit code
              </label>
              <CodeBoxes code={code} setCode={setCode} />
            </div>
            {message && <Note message={message} />}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Log in"}
            </button>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setMessage(null);
                }}
                className="hover:text-white"
              >
                ← Change email
              </button>
              <button
                type="button"
                onClick={sendCode}
                disabled={busy}
                className="font-medium text-emerald-400 hover:underline disabled:opacity-60"
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Note({ message }) {
  return (
    <p
      className={`text-xs ${
        message.type === "err" ? "text-red-400" : "text-emerald-400"
      }`}
    >
      {message.text}
    </p>
  );
}
