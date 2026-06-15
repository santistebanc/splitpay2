import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const REQUIRED_KEYS = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  "EXPO_PUBLIC_POWERSYNC_URL",
] as const;

const TEMPLATES = ["env/local.example", "env/dev.example"] as const;

describe("remote dev env templates", () => {
  for (const template of TEMPLATES) {
    it(`${template} documents required client env vars`, () => {
      const content = readFileSync(template, "utf8");

      for (const key of REQUIRED_KEYS) {
        expect(content).toContain(`${key}=`);
      }
    });
  }

  it("env/local.example points to env/local.keys for demo credentials", () => {
    const content = readFileSync("env/local.example", "utf8");

    expect(content).toContain("env/local.keys");
  });

  it("env/local.keys documents required client env vars", () => {
    const content = readFileSync("env/local.keys", "utf8");

    for (const key of REQUIRED_KEYS) {
      expect(content).toMatch(new RegExp(`^${key}=.+`, "m"));
    }

    expect(content).toMatch(/^SUPABASE_SERVICE_ROLE_KEY=.+$/m);
  });
});
