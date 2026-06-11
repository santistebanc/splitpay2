import { describe, expect, it } from "vitest";
import { getOrCreateDeviceId } from "./device-id.js";
import { createMockStorage } from "./test/mock-storage.js";

describe("getOrCreateDeviceId", () => {
  it("creates and persists a new device id", async () => {
    const storage = createMockStorage();

    const id = await getOrCreateDeviceId(storage);

    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(await storage.getItem("@splitpay/deviceId")).toBe(id);
  });

  it("returns the same id on subsequent calls", async () => {
    const storage = createMockStorage();

    const first = await getOrCreateDeviceId(storage);
    const second = await getOrCreateDeviceId(storage);

    expect(second).toBe(first);
  });

  it("reuses a stored id without generating a new one", async () => {
    const storage = createMockStorage();
    await storage.setItem("@splitpay/deviceId", "existing-device-id");

    await expect(getOrCreateDeviceId(storage)).resolves.toBe(
      "existing-device-id"
    );
  });
});
