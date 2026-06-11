import { STORAGE_KEYS } from "./storage-keys";
import { defaultStorage, type KeyValueStorage } from "./storage";

export function createDeviceId(): string {
  return crypto.randomUUID();
}

/** Returns a stable anonymous device id, creating one on first access. */
export async function getOrCreateDeviceId(
  storage: KeyValueStorage = defaultStorage
): Promise<string> {
  const existing = await storage.getItem(STORAGE_KEYS.deviceId);
  if (existing) {
    return existing;
  }

  const deviceId = createDeviceId();
  await storage.setItem(STORAGE_KEYS.deviceId, deviceId);
  return deviceId;
}
