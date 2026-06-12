import { PowerSyncDatabase } from "@powersync/node";
import { afterEach, describe, expect, it } from "vitest";

import { addExpense } from "./add-expense.js";
import { createGroup } from "./create-group.js";
import { listGroupActivities } from "./list-group-activities.js";
import { AppSchema } from "./schema.js";

async function openTestDatabase(): Promise<PowerSyncDatabase> {
  const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: { dbFilename: `splitpay-test-${crypto.randomUUID()}.db` },
  });
  await db.init();
  return db;
}

describe("listGroupActivities", () => {
  let db: PowerSyncDatabase | undefined;

  afterEach(async () => {
    if (db) {
      await db.close();
      db = undefined;
    }
  });

  it("returns activity rows for expenses newest first", async () => {
    db = await openTestDatabase();
    const group = await createGroup(db, {
      name: "Beach trip",
      currency: "EUR",
      memberNames: ["Alice", "Bob"],
    });
    const [alice, bob] = group.members;

    await addExpense(db, {
      groupId: group.id,
      amountCents: 600,
      note: "Coffee",
      contributions: [{ memberId: alice.id, amountCents: 600 }],
      allocations: [{ memberId: alice.id }, { memberId: bob.id }],
    });
    await addExpense(db, {
      groupId: group.id,
      amountCents: 1200,
      note: "Lunch",
      contributions: [{ memberId: alice.id, amountCents: 1200 }],
      allocations: [{ memberId: alice.id }, { memberId: bob.id }],
    });

    const activities = await listGroupActivities(db, group.id);

    expect(activities).toEqual([
      expect.objectContaining({
        type: "expense_added",
        summary: "Alice paid €12.00 for Lunch",
        expenseId: expect.any(String),
      }),
      expect.objectContaining({
        type: "expense_added",
        summary: "Alice paid €6.00 for Coffee",
      }),
    ]);
  });
});
