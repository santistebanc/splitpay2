import { afterEach, describe, expect, it } from "vitest";

import { addExpense } from "./add-expense.js";
import { createGroup } from "./create-group.js";
import { listGroupExpenses } from "./list-group-expenses.js";
import {
  closeTestDatabase,
  openTestDatabase,
  type TestDatabase,
} from "./test-database.js";

describe("listGroupExpenses", () => {
  let testDb: TestDatabase | undefined;

  afterEach(async () => {
    if (testDb) {
      await closeTestDatabase(testDb.db, testDb.dbPath);
      testDb = undefined;
    }
  });

  it("returns expenses with contributions and allocations for a group", async () => {
    testDb = await openTestDatabase();
    const db = testDb.db;
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
