import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/**
 * Anonymous client for public lookbook pages. No cookies, so pages can be
 * statically cached. Row-level security limits it to visible categories and
 * published outfits.
 */
export function createPublicClient() {
  const { url, key } = supabaseEnv();
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
