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
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 80,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
        }}
      >
        {toasts.map((t) => {
          const tone =
            t.type === "error"
              ? { bg: "#FFE9E2", border: "#FFD2C5", color: "#B23A1A" }
              : t.type === "success"
              ? { bg: "#E4F6EC", border: "#BFE9D2", color: "#1A7D4E" }
              : { bg: "#2A2520", border: "#2A2520", color: "#fff" };
          return (
            <div
              key={t.id}
              style={{
                pointerEvents: "auto",
                width: "100%",
                maxWidth: 384,
                borderRadius: 14,
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "0 10px 30px rgba(70,55,25,.18)",
                background: tone.bg,
                border: `1px solid ${tone.border}`,
                color: tone.color,
              }}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
