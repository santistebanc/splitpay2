import { afterEach, describe, expect, it } from "vitest";

import { addExpense } from "./add-expense.js";
import { createGroup } from "./create-group.js";
import { listGroupActivities } from "./list-group-activities.js";
import {
  closeTestDatabase,
  openTestDatabase,
  type TestDatabase,
} from "./test-database.js";

describe("listGroupActivities", () => {
  let testDb: TestDatabase | undefined;

  afterEach(async () => {
    if (testDb) {
      await closeTestDatabase(testDb.db, testDb.dbPath);
      testDb = undefined;
    }
  });

  it("returns activity rows for expenses newest first", async () => {
    testDb = await openTestDatabase();
    const db = testDb.db;
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
