import { PowerSyncDatabase } from "@powersync/node";
import { afterEach, describe, expect, it } from "vitest";

import { addExpense } from "./add-expense.js";
import { createGroup } from "./create-group.js";
import { listGroupExpenses } from "./list-group-expenses.js";
import { AppSchema } from "./schema.js";

async function openTestDatabase(): Promise<PowerSyncDatabase> {
  const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: { dbFilename: `splitpay-test-${crypto.randomUUID()}.db` },
  });
  await db.init();
  return db;
}

describe("listGroupExpenses", () => {
  let db: PowerSyncDatabase | undefined;

  afterEach(async () => {
    if (db) {
      await db.close();
      db = undefined;
    }
  });

  it("returns expenses with contributions and allocations for a group", async () => {
    db = await openTestDatabase();
    const group = await createGroup(db, {
      name: "Ski weekend",
      currency: "EUR",
      memberNames: ["Alice", "Bob"],
    });
    const [alice, bob] = group.members;

    await addExpense(db, {
      groupId: group.id,
      amountCents: 1200,
      note: "Dinner",
      contributions: [{ memberId: alice.id, amountCents: 1200 }],
      allocations: [{ memberId: alice.id }, { memberId: bob.id }],
    });

    const expenses = await listGroupExpenses(db, group.id);

    expect(expenses).toHaveLength(1);
    expect(expenses[0]).toMatchObject({
      amountCents: 1200,
      note: "Dinner",
      contributions: [{ memberId: alice.id, amountCents: 1200 }],
      allocations: [{ memberId: alice.id }, { memberId: bob.id }],
    });
  });
});
