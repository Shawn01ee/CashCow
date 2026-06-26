// AuthContext.jsx
// ----------------------------------------------------------------------
// Shares the logged-in user across the whole app using React Context, so
// any component can call useAuth() to know who's logged in (or sign out).
//
// Supabase keeps the session in localStorage for us and refreshes tokens
// automatically — we just listen for changes.
// ----------------------------------------------------------------------
import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If keys aren't set yet, don't try to talk to Supabase.
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 1) Get the current session once on startup.
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 2) Then keep listening for login/logout/token-refresh events.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Clean up the listener when the app unmounts.
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signOut: () => supabase?.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Tiny helper so components can do: const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
