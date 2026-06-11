import { describe, expect, it } from "vitest";
import { computeBalances } from "./compute-balances";
import type { LedgerExpense, LedgerMember } from "./types";

describe("computeBalances", () => {
  it("credits the contributor and debits each allocation equally for one expense", () => {
    const members: LedgerMember[] = [{ id: "alice" }, { id: "bob" }];

    const expenses: LedgerExpense[] = [
      {
        id: "dinner",
        amountCents: 1200,
        contributions: [{ memberId: "alice", amountCents: 1200 }],
        allocations: [{ memberId: "alice" }, { memberId: "bob" }],
      },
    ];

    const balances = computeBalances(members, expenses);

    expect(balances).toEqual([
      { memberId: "bob", balanceCents: -600 },
      { memberId: "alice", balanceCents: 600 },
    ]);
  });
});
