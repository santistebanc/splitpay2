import { afterEach, describe, expect, it } from "vitest";

import { addExpense, getExpense } from "./add-expense.js";
import { createGroup } from "./create-group.js";
import { listGroupActivities } from "./list-group-activities.js";
import {
  closeTestDatabase,
  openTestDatabase,
  type TestDatabase,
} from "./test-database.js";

describe("addExpense", () => {
  let testDb: TestDatabase | undefined;

  afterEach(async () => {
    if (testDb) {
      await closeTestDatabase(testDb.db, testDb.dbPath);
      testDb = undefined;
    }
  });

  it("persists an expense with contributions and allocation snapshot", async () => {
    testDb = await openTestDatabase();
    const db = testDb.db;
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

    const activities = await listGroupActivities(db, group.id);
    expect(activities).toEqual([
      expect.objectContaining({
        type: "expense_added",
        summary: "Alice paid €12.00 for Dinner",
        expenseId: created.id,
      }),
    ]);
  });

  it("returns null when the expense id is unknown", async () => {
    testDb = await openTestDatabase();
    const db = testDb.db;

    await expect(getExpense(db, "missing-expense")).resolves.toBeNull();
  });
});
