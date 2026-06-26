// supabase.js
// ----------------------------------------------------------------------
// Creates the one Supabase client the whole app shares.
//
// The URL and "anon" (publishable) key come from environment variables so
// they are NOT hard-coded in the source. In Vite, any variable that starts
// with VITE_ is exposed to the browser via import.meta.env.
//
// The anon key is SAFE to ship to the browser — it only lets users do what
// your Row Level Security (RLS) policies allow. That's why RLS is essential.
// ----------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Have you filled in .env.local yet? We use this to show a friendly
// "setup needed" screen instead of crashing when the keys are missing.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// If not configured, we still export a client-shaped object so imports don't
// explode; the app will show the setup screen before ever calling it.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
