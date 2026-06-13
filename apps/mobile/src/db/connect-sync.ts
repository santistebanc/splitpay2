import type { AbstractPowerSyncDatabase } from "@powersync/common";

import { createSupabaseConnector } from "./supabase-connector";
import { getSyncConfig } from "./sync-config";

/** Connects the local database to PowerSync when env vars are configured. */
export async function connectSyncIfConfigured(
  db: AbstractPowerSyncDatabase
): Promise<boolean> {
  const config = getSyncConfig();
  if (!config) {
    return false;
  }

  await db.connect(createSupabaseConnector(config));
  return true;
}
