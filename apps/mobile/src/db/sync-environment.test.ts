import { describe, expect, it } from "vitest";

import { classifySyncHost, getSyncEnvironment } from "./sync-environment.js";

describe("sync environment", () => {
  it("classifies localhost and LAN dev hosts as local", () => {
    expect(classifySyncHost("127.0.0.1")).toBe("local");
    expect(classifySyncHost("localhost")).toBe("local");
    expect(classifySyncHost("10.0.2.2")).toBe("local");
    expect(classifySyncHost("192.168.1.42")).toBe("local");
  });

  it("classifies hosted Supabase as remote", () => {
    expect(classifySyncHost("abcdefgh.supabase.co")).toBe("remote");
  });

  it("returns null when Supabase env is missing", () => {
    const saved = { ...process.env };
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    expect(getSyncEnvironment()).toBeNull();

    process.env = saved;
  });

  it("detects remote dev from EXPO_PUBLIC Supabase URL", () => {
    const saved = { ...process.env };
    process.env.EXPO_PUBLIC_SUPABASE_URL = "https://xyzcompany.supabase.co";
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    expect(getSyncEnvironment()).toBe("remote");

    process.env = saved;
  });
});
