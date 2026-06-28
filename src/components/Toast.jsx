// Toast.jsx
// A tiny toast (snackbar) system to replace browser alert().
// Any component can call useToast() and do toast.error("...") / toast.success("...").
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Add a toast and auto-remove it after a few seconds.
  const push = useCallback((message, type) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // The API components use.
  const value = {
    info: (m) => push(m, "info"),
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Stacked toasts, fixed near the bottom (above the mobile nav). */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full max-w-sm rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ${
              t.type === "error"
                ? "bg-red-500/15 text-red-200 ring-red-500/40"
                : t.type === "success"
                ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/40"
                : "bg-neutral-800 text-neutral-100 ring-neutral-700"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
