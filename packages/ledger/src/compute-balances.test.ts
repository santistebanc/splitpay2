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

  it("100 cents split 3 ways sums to zero with deterministic rounding", () => {
    const members: LedgerMember[] = [
      { id: "alice" },
      { id: "bob" },
      { id: "carol" },
    ];

    const expenses: LedgerExpense[] = [
      {
        id: "snack",
        amountCents: 100,
        contributions: [{ memberId: "alice", amountCents: 100 }],
        allocations: [
          { memberId: "alice" },
          { memberId: "bob" },
          { memberId: "carol" },
        ],
      },
    ];

    const balances = computeBalances(members, expenses);

    expect(balances.reduce((sum, b) => sum + b.balanceCents, 0)).toBe(0);
    expect(balances).toEqual([
      { memberId: "carol", balanceCents: -34 },
      { memberId: "bob", balanceCents: -33 },
      { memberId: "alice", balanceCents: 67 },
    ]);
  });
});
