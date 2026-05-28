import { createClient, type Session, type User } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

const missingValues = new Set([
  "",
  "your_supabase_url",
  "your_supabase_project_url",
  "your_supabase_anon_key",
  "your_supabase_publishable_key"
]);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !missingValues.has(supabaseUrl) &&
    !missingValues.has(supabaseAnonKey)
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    })
  : null;

export type SupabaseSession = Session;
export type SupabaseUser = User;

export function getAuthRedirectUrl() {
  return window.location.origin;
}
