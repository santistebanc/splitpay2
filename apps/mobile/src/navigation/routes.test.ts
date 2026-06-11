import { describe, expect, it } from "vitest";
import { APP_ROUTE_NAMES } from "./routes.js";

describe("APP_ROUTE_NAMES", () => {
  it("lists every planned stub screen for the stack", () => {
    expect(APP_ROUTE_NAMES).toEqual([
      "Groups",
      "NewGroup",
      "Group",
      "AddExpense",
      "SettleUp",
      "GroupSettings",
      "JoinGroup",
    ]);
  });
});
