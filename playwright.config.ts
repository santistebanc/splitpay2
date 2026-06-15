import { defineConfig, devices } from "@playwright/test";

const { LOCAL_ANON_KEY, LOCAL_SUPABASE_URL } = require("./env/local-keys.cjs");

const syncE2e = process.env.PLAYWRIGHT_SYNC_E2E === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8081",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: syncE2e ? undefined : ["**/two-device-sync.spec.ts"],
      testMatch: syncE2e ? ["**/two-device-sync.spec.ts"] : undefined,
    },
  ],
  webServer: {
    command: syncE2e
      ? "CI=1 npm run web:sync --workspace=@splitpay/mobile"
      : "CI=1 npm run web --workspace=@splitpay/mobile",
    url: "http://localhost:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      EXPO_PUBLIC_SUPABASE_URL: LOCAL_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: LOCAL_ANON_KEY,
      ...(syncE2e
        ? { EXPO_PUBLIC_POWERSYNC_URL: "http://127.0.0.1:8080" }
        : {}),
    },
  },
});
