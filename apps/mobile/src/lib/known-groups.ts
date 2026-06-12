import { STORAGE_KEYS } from "./storage-keys";
import { defaultStorage, type KeyValueStorage } from "./storage";

export type KnownGroup = {
  groupId: string;
  assumedMemberId?: string | null;
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
  storage: KeyValueStorage = defaultStorage,
  options?: { assumedMemberId?: string | null }
): Promise<KnownGroup[]> {
  const groups = await readKnownGroups(storage);
  const existing = groups.find((group) => group.groupId === groupId);
  if (existing) {
    if (options?.assumedMemberId !== undefined) {
      existing.assumedMemberId = options.assumedMemberId;
      await writeKnownGroups(groups, storage);
    }
    return groups;
  }

  const next = [
    ...groups,
    {
      groupId,
      ...(options?.assumedMemberId !== undefined
        ? { assumedMemberId: options.assumedMemberId }
        : {}),
    },
  ];
  await writeKnownGroups(next, storage);
  return next;
}

/** Sets which member this device assumes in a group, or clears with null. */
export async function setAssumedMember(
  groupId: string,
  assumedMemberId: string | null,
  storage: KeyValueStorage = defaultStorage
): Promise<KnownGroup[]> {
  const groups = await readKnownGroups(storage);
  const group = groups.find((entry) => entry.groupId === groupId);
  if (!group) {
    throw new Error(`Unknown group: ${groupId}`);
  }

  group.assumedMemberId = assumedMemberId;
  await writeKnownGroups(groups, storage);
  return groups;
}

/** Removes a group from this device's local index (exit group). */
export async function removeKnownGroup(
  groupId: string,
  storage: KeyValueStorage = defaultStorage
): Promise<KnownGroup[]> {
  const groups = await readKnownGroups(storage);
  const next = groups.filter((group) => group.groupId !== groupId);
  await writeKnownGroups(next, storage);
  return next;
}

/** Returns assumed member id when it exists in validMemberIds; otherwise null. */
export function resolveAssumedMemberId(
  knownGroup: KnownGroup | undefined,
  validMemberIds: readonly string[]
): string | null {
  const assumedMemberId = knownGroup?.assumedMemberId;
  if (!assumedMemberId) {
    return null;
  }

  return validMemberIds.includes(assumedMemberId) ? assumedMemberId : null;
}
