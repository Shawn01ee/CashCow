// AuthScreen.jsx
// Passwordless login: the user types their email, we email them a 6-digit
// code, and they type it back. Sign-up and login are the same flow — if the
// email is new, Supabase creates the account automatically.
import { useState } from "react";
import { supabase } from "../lib/supabase";

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
      setMessage({ type: "ok", text: `We sent a 6-digit code to ${email}.` });
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
              ? "Log in or sign up with your email"
              : "Enter the code we emailed you"}
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
                placeholder="you@email.com"
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
              No password needed — we'll email you a 6-digit code.
            </p>
          </form>
        ) : (
          <form
            onSubmit={verifyCode}
            className="space-y-3 rounded-2xl bg-neutral-900 p-5 ring-1 ring-neutral-800"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-400">
                6-digit code
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className={`${field} text-center text-lg tracking-[0.4em]`}
                autoFocus
              />
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
