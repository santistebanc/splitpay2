import { getSupabaseConfig } from "./sync-config";

export type SyncEnvironment = "local" | "remote";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "10.0.2.2"]);

function isPrivateLanHost(hostname: string): boolean {
  if (hostname.startsWith("192.168.")) {
    return true;
  }
  if (hostname.startsWith("10.")) {
    return true;
  }
  const parts = hostname.split(".").map(Number);
  if (
    parts.length === 4 &&
    parts[0] === 172 &&
    parts[1]! >= 16 &&
    parts[1]! <= 31
  ) {
    return true;
  }
  return false;
}

/** Classifies a Supabase/PowerSync host as local dev or remote hosted. */
export function classifySyncHost(hostname: string): SyncEnvironment {
  const host = hostname.toLowerCase();
  if (
    LOCAL_HOSTS.has(host) ||
    host.endsWith(".local") ||
    isPrivateLanHost(host)
  ) {
    return "local";
  }
  return "remote";
}

/** Returns whether sync env points at local Docker or a hosted dev/prod stack. */
export function getSyncEnvironment(): SyncEnvironment | null {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  try {
    return classifySyncHost(new URL(config.supabaseUrl).hostname);
  } catch {
    return null;
  }
}
