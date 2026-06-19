import { createClient } from "@supabase/supabase-js";

// These come from your .env file — never hardcode them here
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase env vars. Copy .env.example → .env and fill in your keys.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
