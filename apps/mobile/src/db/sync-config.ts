export type SyncConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  powersyncUrl: string;
};

export type SupabaseConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

/** Returns Supabase client settings when URL and anon key are present. */
export function getSupabaseConfig(): SupabaseConfig | null {
  const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}

/** Returns sync settings when all env vars are present; otherwise offline-only. */
export function getSyncConfig(): SyncConfig | null {
  const supabase = getSupabaseConfig();
  const powersyncUrl =
    process.env.EXPO_PUBLIC_POWERSYNC_URL ?? process.env.POWERSYNC_URL;

  if (!supabase || !powersyncUrl) {
    return null;
  }

  return { ...supabase, powersyncUrl };
}

export function isSyncConfigured(): boolean {
  return getSyncConfig() !== null;
}
