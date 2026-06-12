import type { AbstractPowerSyncDatabase } from "@powersync/common";

import { addExpense } from "./add-expense";
import { createGroup } from "./create-group";
import { APP_TABLE_NAMES } from "./table-names";

export const E2E_SEEDS = {
  "groups-home": {
    name: "Ski weekend",
    currency: "EUR",
    memberNames: ["Alice", "Bob"],
  },
} as const;

export type E2eSeedName = "groups-home" | "group-balances";

export function isE2eSeedName(value: string): value is E2eSeedName {
  return value === "groups-home" || value === "group-balances";
}

async function seedGroupBalances(db: AbstractPowerSyncDatabase): Promise<void> {
  const group = await createGroup(db, {
    name: "Ski weekend",
    currency: "EUR",
    memberNames: ["Alice", "Bob"],
  });
  const alice = group.members.find((member) => member.displayName === "Alice");
  const bob = group.members.find((member) => member.displayName === "Bob");
  if (!alice || !bob) {
    throw new Error("E2E seed group-balances: missing members");
  }

  await addExpense(db, {
    groupId: group.id,
    amountCents: 1200,
    note: "Dinner",
    contributions: [{ memberId: alice.id, amountCents: 1200 }],
    allocations: [{ memberId: alice.id }, { memberId: bob.id }],
  });
}

/** Wipes app tables so `?e2eSeed=` always starts from a known state. */
export async function clearE2eData(
  db: AbstractPowerSyncDatabase
): Promise<void> {
  const tables = [...APP_TABLE_NAMES].reverse();

  await db.writeTransaction(async (tx) => {
    for (const table of tables) {
      await tx.execute(`DELETE FROM ${table}`);
    }
  });
}

/** Seeds SQLite for Playwright when `?e2eSeed=` is present. */
export async function runE2eSeed(
  db: AbstractPowerSyncDatabase,
  seedName: E2eSeedName
): Promise<void> {
  if (seedName === "group-balances") {
    await seedGroupBalances(db);
    return;
  }

  const seed = E2E_SEEDS[seedName];
  await createGroup(db, seed);
}
