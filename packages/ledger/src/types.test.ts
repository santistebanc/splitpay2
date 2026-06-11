import { describe, expect, it } from "vitest";
import type { LedgerExpense, LedgerMember } from "./types";

describe("ledger types", () => {
  it("represents members and an expense for balance calculation", () => {
    const members: LedgerMember[] = [{ id: "alice" }, { id: "bob" }];

    const expense: LedgerExpense = {
      id: "dinner",
      amountCents: 1200,
      contributions: [{ memberId: "alice", amountCents: 1200 }],
      allocations: [{ memberId: "alice" }, { memberId: "bob" }],
    };

    expect(members).toHaveLength(2);
    expect(expense.amountCents).toBe(1200);
    expect(expense.contributions).toEqual([
      { memberId: "alice", amountCents: 1200 },
    ]);
  });

  it("allows empty allocations as a ledger fallback for snapshot expansion", () => {
    const expense: LedgerExpense = {
      id: "taxi",
      amountCents: 900,
      contributions: [{ memberId: "bob", amountCents: 900 }],
      allocations: [],
    };

    expect(expense.allocations).toHaveLength(0);
  });

  it("keeps saved allocations when a new member joins the group later", () => {
    const expense: LedgerExpense = {
      id: "dinner",
      amountCents: 1200,
      contributions: [{ memberId: "alice", amountCents: 1200 }],
      allocations: [{ memberId: "alice" }, { memberId: "bob" }],
    };

    const groupNow: LedgerMember[] = [
      { id: "alice" },
      { id: "bob" },
      { id: "carol" },
    ];

    const allocatedIds = expense.allocations.map((a) => a.memberId);
    expect(allocatedIds).not.toContain("carol");
    expect(groupNow.map((m) => m.id)).toContain("carol");
  });
});
