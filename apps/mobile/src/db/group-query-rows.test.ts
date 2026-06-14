import { describe, expect, it } from "vitest";

import { assembleExpenseRecords } from "./group-query-rows.js";

describe("assembleExpenseRecords", () => {
  it("joins contributions and allocations onto expenses", () => {
    const expenses = assembleExpenseRecords(
      [
        {
          id: "exp-1",
          group_id: "grp-1",
          amount_cents: 1200,
          created_at: "2026-01-01",
          note: "Lunch",
        },
      ],
      [
        {
          expense_id: "exp-1",
          member_id: "mem-1",
          amount_cents: 1200,
        },
      ],
      [
        {
          expense_id: "exp-1",
          member_id: "mem-1",
        },
        {
          expense_id: "exp-1",
          member_id: "mem-2",
        },
      ]
    );

    expect(expenses).toEqual([
      {
        id: "exp-1",
        groupId: "grp-1",
        amountCents: 1200,
        createdAt: "2026-01-01",
        note: "Lunch",
        contributions: [{ memberId: "mem-1", amountCents: 1200 }],
        allocations: [{ memberId: "mem-1" }, { memberId: "mem-2" }],
      },
    ]);
  });
});
