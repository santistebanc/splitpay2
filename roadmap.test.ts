import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("project roadmap docs", () => {
  it("lists S11 as next and documents the full process", () => {
    const roadmap = readFileSync("docs/ROADMAP.md", "utf8");
    const process = readFileSync("docs/PROCESS.md", "utf8");
    const slices = readFileSync("docs/SLICES.md", "utf8");

    expect(roadmap).toContain("S11");
    expect(roadmap).toContain("🔜 **Next**");
    expect(roadmap).toContain("S28");
    expect(process).toContain("npm run verify");
    expect(process).toContain("confirmed");
    expect(slices).toContain("ROADMAP.md");
    expect(slices).toContain("PROCESS.md");

    const cursorRule = readFileSync(
      ".cursor/rules/splitpay-development.mdc",
      "utf8"
    );
    expect(cursorRule).toContain("ROADMAP.md");
    expect(cursorRule).toContain("confirmed");
  });

  it("records major decisions in ADRs", () => {
    const adr1 = readFileSync(
      "docs/adr/0001-micro-slices-and-phasing.md",
      "utf8"
    );
    const adr2 = readFileSync(
      "docs/adr/0002-contribution-allocation-model.md",
      "utf8"
    );

    expect(adr1).toContain("Micro-slices");
    expect(adr2).toContain("Contribution");
    expect(adr2).toContain("Allocation snapshot");
  });
});
