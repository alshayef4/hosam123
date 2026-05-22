import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export function getSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase client not initialized — check SUPABASE_URL and SUPABASE_KEY"
    );
  }
  return supabase;
}
