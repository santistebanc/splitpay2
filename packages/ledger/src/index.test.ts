import { describe, expect, it } from "vitest";
import { LEDGER_READY } from "./index";

describe("ledger workspace", () => {
  it("is ready for behavior-driven tests", () => {
    expect(LEDGER_READY).toBe(true);
  });
});
