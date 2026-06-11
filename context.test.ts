import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const DOMAIN_TERMS = [
  "Group",
  "Member",
  "Claimed member",
  "Unclaimed member",
  "Claim",
  "Expense",
  "Split",
  "Payment",
  "Balance",
  "Settlement",
  "Activity",
  "Join code",
];

describe("CONTEXT.md", () => {
  it("defines core SplitPay domain terms", () => {
    const context = readFileSync("CONTEXT.md", "utf8");

    for (const term of DOMAIN_TERMS) {
      expect(context, `missing term: ${term}`).toContain(`**${term}**`);
    }
  });

  it("stays free of implementation details", () => {
    const context = readFileSync("CONTEXT.md", "utf8");

    expect(context).not.toMatch(/powersync/i);
    expect(context).not.toMatch(/react native/i);
    expect(context).not.toMatch(/sqlite/i);
  });
});
