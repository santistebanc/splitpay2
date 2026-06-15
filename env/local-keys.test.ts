import { describe, expect, it } from "vitest";
import {
  LOCAL_ANON_KEY,
  LOCAL_POWERSYNC_URL,
  LOCAL_SERVICE_ROLE_KEY,
  LOCAL_SUPABASE_URL,
} from "./local-keys.cjs";

describe("local supabase demo credentials", () => {
  it("loads local stack settings from env/local.keys", () => {
    expect(LOCAL_SUPABASE_URL).toBe("http://127.0.0.1:54321");
    expect(LOCAL_POWERSYNC_URL).toBe("http://127.0.0.1:8080");
    expect(LOCAL_ANON_KEY).toMatch(/^eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+$/);
    expect(LOCAL_SERVICE_ROLE_KEY).toMatch(/^eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+$/);
  });
});
