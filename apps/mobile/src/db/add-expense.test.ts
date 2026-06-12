import { PowerSyncDatabase } from "@powersync/node";
import { afterEach, describe, expect, it } from "vitest";

import { addExpense, getExpense } from "./add-expense.js";
import { createGroup } from "./create-group.js";
import { AppSchema } from "./schema.js";

async function openTestDatabase(): Promise<PowerSyncDatabase> {
  const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: { dbFilename: `splitpay-test-${crypto.randomUUID()}.db` },
  });
  await db.init();
  return db;
}

describe("addExpense", () => {
  let db: PowerSyncDatabase | undefined;

  afterEach(async () => {
    if (db) {
      await db.close();
      db = undefined;
    }
  });

  it("persists an expense with contributions and allocation snapshot", async () => {
    db = await openTestDatabase();
    const group = await createGroup(db, {
      name: "Ski weekend",
      currency: "EUR",
      memberNames: ["Alice", "Bob"],
    });
    const [alice, bob] = group.members;

    const created = await addExpense(db, {
      groupId: group.id,
      amountCents: 1200,
      note: "Dinner",
      contributions: [{ memberId: alice.id, amountCents: 1200 }],
      allocations: [{ memberId: alice.id }, { memberId: bob.id }],
    });

    expect(created).toEqual({
      id: expect.any(String),
      groupId: group.id,
      amountCents: 1200,
      note: "Dinner",
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      contributions: [{ memberId: alice.id, amountCents: 1200 }],
      allocations: [{ memberId: alice.id }, { memberId: bob.id }],
    });

    const loaded = await getExpense(db, created.id);

    expect(loaded).toEqual(created);
  });

  it("returns null when the expense id is unknown", async () => {
    db = await openTestDatabase();

    await expect(getExpense(db, "missing-expense")).resolves.toBeNull();
  });
});
