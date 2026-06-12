import { describe, expect, it } from "vitest";

import { formatAmountCents, formatBalanceCents } from "./format-balance.js";

describe("formatAmountCents", () => {
  it("formats euro amounts without a sign", () => {
    expect(formatAmountCents(1200, "EUR")).toBe("€12.00");
  });
});

describe("formatBalanceCents", () => {
  it("formats positive and negative euro balances", () => {
    expect(formatBalanceCents(600, "EUR")).toBe("+€6.00");
    expect(formatBalanceCents(-600, "EUR")).toBe("-€6.00");
    expect(formatBalanceCents(0, "EUR")).toBe("€0.00");
  });
});
