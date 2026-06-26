// SetupNeeded.jsx
// Shown when the Supabase keys are missing, so the app explains what to do
// instead of crashing with a blank screen.
export default function SetupNeeded() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="max-w-md rounded-2xl bg-neutral-900 p-6 ring-1 ring-neutral-800">
        <div className="text-4xl">🐮🔧</div>
        <h1 className="mt-3 text-xl font-bold text-white">Almost there!</h1>
        <p className="mt-2 text-sm text-neutral-400">
          CashCow can't find your Supabase keys yet. To connect the database:
        </p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-neutral-300">
          <li>Create a project at supabase.com</li>
          <li>
            Copy <code className="text-emerald-400">.env.local.example</code> to{" "}
            <code className="text-emerald-400">.env.local</code>
          </li>
          <li>Paste your Project URL and anon key into it</li>
          <li>Restart the dev server (<code className="text-emerald-400">npm run dev</code>)</li>
        </ol>
      </div>
    </div>
  );
}
