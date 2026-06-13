const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";
const LOCAL_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const LOCAL_POWERSYNC_URL = "http://127.0.0.1:8080";

/** True when local Supabase REST and PowerSync are reachable. */
export async function isSyncStackRunning(): Promise<boolean> {
  try {
    const [supabase, powersync] = await Promise.all([
      fetch(`${LOCAL_SUPABASE_URL}/rest/v1/`, {
        headers: { apikey: LOCAL_ANON_KEY },
      }),
      fetch(LOCAL_POWERSYNC_URL),
    ]);
    return supabase.status < 500 && powersync.status < 500;
  } catch {
    return false;
  }
}

export function parseJoinCodeFromMeta(meta: string | null): string {
  const match = meta?.match(/·\s*([A-Z2-9]{5})\s*$/);
  if (!match?.[1]) {
    throw new Error(`Could not parse join code from: ${meta ?? "null"}`);
  }
  return match[1];
}
