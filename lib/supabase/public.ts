import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Cookie-free client for public pages. Because it never reads cookies, pages
 * that use it can be statically generated and revalidated (ISR). It runs as
 * the anon role, so RLS only ever returns published articles.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
