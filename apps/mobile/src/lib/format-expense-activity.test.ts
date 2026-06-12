import { isPayment } from "@splitpay/ledger";
import { describe, expect, it } from "vitest";

import type { ExpenseRecord } from "../db/add-expense";
import { formatExpenseActivitySummary } from "./format-expense-activity";

function expense(
  partial: Partial<ExpenseRecord> &
    Pick<ExpenseRecord, "contributions" | "allocations">
): ExpenseRecord {
  return {
    id: "expense-1",
    groupId: "group-1",
    amountCents: 1200,
    createdAt: "2026-01-01T00:00:00.000Z",
    note: "",
    ...partial,
  };
}

describe("formatExpenseActivitySummary", () => {
  const names = new Map([
    ["alice", "Alice"],
    ["bob", "Bob"],
  ]);

  it("summarizes a normal expense with a note", () => {
    const summary = formatExpenseActivitySummary(
      expense({
        amountCents: 1200,
        note: "Lunch",
        contributions: [{ memberId: "alice", amountCents: 1200 }],
        allocations: [{ memberId: "alice" }, { memberId: "bob" }],
      }),
      names,
      "EUR"
    );

    expect(summary).toBe("Alice paid €12.00 for Lunch");
    expect(
      isPayment({
        id: "expense-1",
        amountCents: 1200,
        contributions: [{ memberId: "alice", amountCents: 1200 }],
        allocations: [{ memberId: "alice" }, { memberId: "bob" }],
      })
    ).toBe(false);
  });

  it("summarizes a settle-up payment", () => {
    const summary = formatExpenseActivitySummary(
      expense({
        amountCents: 600,
        note: "Settlement",
        contributions: [{ memberId: "bob", amountCents: 600 }],
        allocations: [{ memberId: "alice" }],
      }),
      names,
      "EUR"
    );

    expect(summary).toBe("Bob paid Alice €6.00");
    expect(
      isPayment({
        id: "expense-1",
        amountCents: 600,
        contributions: [{ memberId: "bob", amountCents: 600 }],
        allocations: [{ memberId: "alice" }],
      })
    ).toBe(true);
  });
});
