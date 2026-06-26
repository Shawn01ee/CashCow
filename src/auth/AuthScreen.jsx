// AuthScreen.jsx
// The login / sign-up page shown when nobody is logged in.
// One screen, toggled between "Log in" and "Sign up" modes.
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  const isSignup = mode === "signup";

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({
          type: "ok",
          text: "Account created! If email confirmation is on, check your inbox. Otherwise just log in.",
        });
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // On success the AuthContext listener swaps us into the app.
      }
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
            {isSignup ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
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
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 6 characters"
              className={field}
            />
          </div>

          {message && (
            <p
              className={`text-xs ${
                message.type === "err" ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {busy ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          {isSignup ? "Already have an account?" : "New to CashCow?"}{" "}
          <button
            onClick={() => {
              setMode(isSignup ? "login" : "signup");
              setMessage(null);
            }}
            className="font-medium text-emerald-400 hover:underline"
          >
            {isSignup ? "Log in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
