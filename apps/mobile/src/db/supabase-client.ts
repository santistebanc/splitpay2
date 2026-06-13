import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { SupabaseConfig } from "./sync-config";

let cachedClient: SupabaseClient | null = null;
let cachedKey: string | null = null;

/** Returns one Supabase client per URL + anon key so auth is shared across features. */
export function getSupabaseClient(config: SupabaseConfig): SupabaseClient {
  const key = `${config.supabaseUrl}|${config.supabaseAnonKey}`;
  if (!cachedClient || cachedKey !== key) {
    cachedClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
    cachedKey = key;
  }

  return cachedClient;
}

/** Ensures an anonymous Supabase session exists before uploads or edge calls. */
export async function ensureSupabaseSession(
  config: SupabaseConfig
): Promise<void> {
  const client = getSupabaseClient(config);
  const { data } = await client.auth.getSession();
  if (data.session) {
    return;
  }

  const { error } = await client.auth.signInAnonymously();
  if (error) {
    throw error;
  }
}
