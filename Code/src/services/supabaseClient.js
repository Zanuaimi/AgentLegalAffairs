import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const missingSupabaseEnvVars = [
  !supabaseUrl ? "VITE_SUPABASE_URL" : null,
  !supabaseAnonKey ? "VITE_SUPABASE_ANON_KEY" : null,
].filter(Boolean);

export const isSupabaseConfigured = missingSupabaseEnvVars.length === 0;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      `Supabase is not configured. Missing: ${missingSupabaseEnvVars.join(
        ", ",
      )}. Check Code/.env.local.`,
    );
  }

  return supabase;
}

/*
BEGINNER DOCUMENTATION:

1. What is this file?
It creates the Supabase client used by the React app to talk to Supabase Auth and PostgreSQL.

2. Why check isSupabaseConfigured?
The project can still run as a local teaching/demo app if .env.local is missing. When Supabase values exist, the app uses the real backend.

3. Is the anon key secret?
No. Supabase anon keys are meant for frontend use. Security comes from Row Level Security policies in PostgreSQL.
*/
