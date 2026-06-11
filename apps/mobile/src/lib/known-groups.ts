import { STORAGE_KEYS } from "./storage-keys";
import { defaultStorage, type KeyValueStorage } from "./storage";

export type KnownGroup = {
  groupId: string;
};

async function readKnownGroups(
  storage: KeyValueStorage
): Promise<KnownGroup[]> {
  const raw = await storage.getItem(STORAGE_KEYS.knownGroups);
  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as KnownGroup[];
}

async function writeKnownGroups(
  groups: KnownGroup[],
  storage: KeyValueStorage
): Promise<void> {
  await storage.setItem(STORAGE_KEYS.knownGroups, JSON.stringify(groups));
}

/** Group ids this device has opened or created (local index before SQLite). */
export async function getKnownGroups(
  storage: KeyValueStorage = defaultStorage
): Promise<KnownGroup[]> {
  return readKnownGroups(storage);
}

/** Records a group id locally if it is not already known. */
export async function addKnownGroup(
  groupId: string,
  storage: KeyValueStorage = defaultStorage
): Promise<KnownGroup[]> {
  const groups = await readKnownGroups(storage);
  if (groups.some((group) => group.groupId === groupId)) {
    return groups;
  }

  const next = [...groups, { groupId }];
  await writeKnownGroups(next, storage);
  return next;
}
