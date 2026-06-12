import type { AbstractPowerSyncDatabase } from "@powersync/common";

import { createGroup } from "./create-group";

export const E2E_SEEDS = {
  "groups-home": {
    name: "Ski weekend",
    currency: "EUR",
    memberNames: ["Alice", "Bob"],
  },
} as const;

export type E2eSeedName = keyof typeof E2E_SEEDS;

export function isE2eSeedName(value: string): value is E2eSeedName {
  return value in E2E_SEEDS;
}

/** Seeds SQLite for Playwright when `?e2eSeed=` is present. */
export async function runE2eSeed(
  db: AbstractPowerSyncDatabase,
  seedName: E2eSeedName
): Promise<void> {
  const seed = E2E_SEEDS[seedName];
  await createGroup(db, seed);
}
