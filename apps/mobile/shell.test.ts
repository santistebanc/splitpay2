import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("mobile shell", () => {
  it("exposes npm run web for Expo web dev", () => {
    const pkg = JSON.parse(
      readFileSync("apps/mobile/package.json", "utf8")
    ) as { scripts: Record<string, string> };

    expect(pkg.scripts.web).toBeDefined();
  });
});
