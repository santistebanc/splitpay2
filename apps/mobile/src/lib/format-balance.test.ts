import { describe, expect, it } from "vitest";

import { formatBalanceCents } from "./format-balance.js";

describe("formatBalanceCents", () => {
  it("formats positive and negative euro balances", () => {
    expect(formatBalanceCents(600, "EUR")).toBe("+€6.00");
    expect(formatBalanceCents(-600, "EUR")).toBe("-€6.00");
    expect(formatBalanceCents(0, "EUR")).toBe("€0.00");
  });
});
