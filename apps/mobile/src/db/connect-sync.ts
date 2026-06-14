import type { AbstractPowerSyncDatabase } from "@powersync/common";

import { createSupabaseConnector } from "./supabase-connector";
import { ensureSupabaseSession, getSupabaseClient } from "./supabase-client";
import { getSyncConfig } from "./sync-config";

const SYNC_WAIT_MS = 30_000;
const UPLOAD_FLUSH_ATTEMPTS = 20;
const UPLOAD_FLUSH_DELAY_MS = 250;

async function isPowerSyncReachable(powersyncUrl: string): Promise<boolean> {
  try {
    const response = await fetch(powersyncUrl);
    return response.status < 500;
  } catch {
    return false;
  }
}

/** Connects the local database to PowerSync when env vars are configured. */
export async function connectSyncIfConfigured(
  db: AbstractPowerSyncDatabase
): Promise<boolean> {
  const config = getSyncConfig();
  if (!config) {
    return false;
  }

  if (!(await isPowerSyncReachable(config.powersyncUrl))) {
    return false;
  }

  await ensureSupabaseSession(config);
  await db.connect(createSupabaseConnector(config, getSupabaseClient(config)));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SYNC_WAIT_MS);
  try {
    await db.waitForFirstSync(controller.signal);
  } finally {
    clearTimeout(timeout);
  }

  return true;
}

/** Reconnects when sync is configured but the client is offline. */
export async function ensureSyncConnected(
  db: AbstractPowerSyncDatabase
): Promise<boolean> {
  const config = getSyncConfig();
  if (!config) {
    return false;
  }

  const status = db.currentStatus;
  if (
    db.connected &&
    status.connected &&
    status.dataFlowStatus.downloadError == null
  ) {
    return true;
  }

  return reconnectSyncIfConfigured(db);
}

/** Pushes all queued local writes to Supabase when sync env vars are set. */
export async function flushPendingUploads(
  db: AbstractPowerSyncDatabase
): Promise<void> {
  const config = getSyncConfig();
  if (!config) {
    return;
  }

  await ensureSupabaseSession(config);
  const connector = createSupabaseConnector(config, getSupabaseClient(config));

  for (let attempt = 0; attempt < UPLOAD_FLUSH_ATTEMPTS; attempt++) {
    const pending = await db.getNextCrudTransaction();
    if (!pending) {
      return;
    }

    await connector.uploadData(db);
    await new Promise((resolve) => setTimeout(resolve, UPLOAD_FLUSH_DELAY_MS));
  }

  throw new Error("Timed out waiting for local changes to upload");
}

/** Reconnects sync so new group memberships and server data are picked up. */
export async function reconnectSyncIfConfigured(
  db: AbstractPowerSyncDatabase
): Promise<boolean> {
  const config = getSyncConfig();
  if (!config) {
    return false;
  }

  if (!(await isPowerSyncReachable(config.powersyncUrl))) {
    return false;
  }

  const client = getSupabaseClient(config);
  if (db.connected) {
    await db.disconnect();
  }

  await db.connect(createSupabaseConnector(config, client));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SYNC_WAIT_MS);
  try {
    await db.waitForFirstSync(controller.signal);
  } finally {
    clearTimeout(timeout);
  }

  return true;
}
