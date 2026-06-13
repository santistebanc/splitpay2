import { describe, expect, it } from "vitest";

import { getSyncConfig, isSyncConfigured } from "./sync-config.js";

describe("sync config", () => {
  it("returns null when env vars are missing", () => {
    const saved = { ...process.env };
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.EXPO_PUBLIC_POWERSYNC_URL;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.POWERSYNC_URL;

    expect(getSyncConfig()).toBeNull();
    expect(isSyncConfigured()).toBe(false);

    process.env = saved;
  });

  it("reads EXPO_PUBLIC env vars when present", () => {
    const saved = { ...process.env };
    process.env.EXPO_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.EXPO_PUBLIC_POWERSYNC_URL = "http://127.0.0.1:8080";

    expect(getSyncConfig()).toEqual({
      supabaseUrl: "http://127.0.0.1:54321",
      supabaseAnonKey: "anon-key",
      powersyncUrl: "http://127.0.0.1:8080",
    });
    expect(isSyncConfigured()).toBe(true);

    process.env = saved;
  });
});
