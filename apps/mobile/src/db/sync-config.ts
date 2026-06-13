export type SyncConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  powersyncUrl: string;
};

/** Returns sync settings when all env vars are present; otherwise offline-only. */
export function getSyncConfig(): SyncConfig | null {
  const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  const powersyncUrl =
    process.env.EXPO_PUBLIC_POWERSYNC_URL ?? process.env.POWERSYNC_URL;

  if (!supabaseUrl || !supabaseAnonKey || !powersyncUrl) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey, powersyncUrl };
}

export function isSyncConfigured(): boolean {
  return getSyncConfig() !== null;
}
