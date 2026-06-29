import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./theme/cashcow.css";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import { LanguageProvider } from "./i18n.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* LanguageProvider shares the chosen language (English / Korean).
        ToastProvider lets any screen show in-app messages.
        AuthProvider makes the logged-in user available everywhere. */}
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  </StrictMode>
);
