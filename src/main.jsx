import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./theme/cashcow.css";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* ToastProvider lets any screen show in-app messages.
        AuthProvider makes the logged-in user available everywhere. */}
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
