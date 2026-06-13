import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("CI workflow", () => {
  it("exists and runs npm run ci on push and pull_request", () => {
    const workflow = readFileSync(".github/workflows/ci.yml", "utf8");

    expect(workflow).toContain("npm run ci");
    expect(workflow).toContain("pull_request");
    expect(workflow).toContain("push");
  });

  it("defines a sync integration workflow", () => {
    const workflow = readFileSync(
      ".github/workflows/sync-integration.yml",
      "utf8"
    );

    expect(workflow).toContain("npm run test:sync");
    expect(workflow).toContain("npm run test:e2e:sync");
  });
});
