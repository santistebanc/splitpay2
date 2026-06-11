import { describe, expect, it } from "vitest";
import type { LedgerBalance } from "./compute-balances";
import { computeSettlements } from "./compute-settlements";

describe("computeSettlements", () => {
  it("matches largest debtor to largest creditor for mixed balances", () => {
    const balances: LedgerBalance[] = [
      { memberId: "carol", balanceCents: -500 },
      { memberId: "bob", balanceCents: -400 },
      { memberId: "alice", balanceCents: 900 },
    ];

    const settlements = computeSettlements(balances);

    expect(settlements).toEqual([
      { fromMemberId: "carol", toMemberId: "alice", amountCents: 500 },
      { fromMemberId: "bob", toMemberId: "alice", amountCents: 400 },
    ]);
  });

  it("returns no settlements when everyone is at zero", () => {
    const balances: LedgerBalance[] = [
      { memberId: "alice", balanceCents: 0 },
      { memberId: "bob", balanceCents: 0 },
    ];

    expect(computeSettlements(balances)).toEqual([]);
  });
});
