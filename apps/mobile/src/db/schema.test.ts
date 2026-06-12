import { describe, expect, it } from "vitest";
import { APP_TABLE_NAMES } from "./table-names.js";

describe("APP_TABLE_NAMES", () => {
  it("lists every offline table in the client schema", () => {
    expect(APP_TABLE_NAMES).toEqual([
      "groups",
      "members",
      "expenses",
      "expense_contributions",
      "expense_allocations",
    ]);
  });
});
