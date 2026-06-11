import { describe, expect, it } from "vitest";
import { isPayment } from "./is-payment";
import type { LedgerExpense } from "./types";

describe("isPayment", () => {
  it("returns true when one contributor pays and one other member is allocated", () => {
    const expense: LedgerExpense = {
      id: "settle-1",
      amountCents: 500,
      contributions: [{ memberId: "alice", amountCents: 500 }],
      allocations: [{ memberId: "bob" }],
    };

    expect(isPayment(expense)).toBe(true);
  });

  it("returns false for a normal expense split across multiple members", () => {
    const expense: LedgerExpense = {
      id: "dinner",
      amountCents: 1200,
      contributions: [{ memberId: "alice", amountCents: 1200 }],
      allocations: [{ memberId: "alice" }, { memberId: "bob" }],
    };

    expect(isPayment(expense)).toBe(false);
  });

  it("returns false when contributor and allocation are the same member", () => {
    const expense: LedgerExpense = {
      id: "self",
      amountCents: 300,
      contributions: [{ memberId: "alice", amountCents: 300 }],
      allocations: [{ memberId: "alice" }],
    };

    expect(isPayment(expense)).toBe(false);
  });
});
