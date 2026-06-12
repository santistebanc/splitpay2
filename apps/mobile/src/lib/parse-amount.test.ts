import { describe, expect, it } from "vitest";

import { parseAmountToCents } from "./parse-amount.js";

describe("parseAmountToCents", () => {
  it("parses decimal and whole amounts", () => {
    expect(parseAmountToCents("12.00")).toBe(1200);
    expect(parseAmountToCents("12")).toBe(1200);
    expect(parseAmountToCents("12,50")).toBe(1250);
  });

  it("returns null for invalid input", () => {
    expect(parseAmountToCents("")).toBeNull();
    expect(parseAmountToCents("abc")).toBeNull();
    expect(parseAmountToCents("12.999")).toBeNull();
  });
});
