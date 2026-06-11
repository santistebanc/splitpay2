import { describe, expect, it } from "vitest";
import { addKnownGroup, getKnownGroups } from "./known-groups.js";
import { createMockStorage } from "./test/mock-storage.js";

describe("known groups", () => {
  it("returns an empty list when nothing is stored", async () => {
    const storage = createMockStorage();

    await expect(getKnownGroups(storage)).resolves.toEqual([]);
  });

  it("adds a group id and persists the list", async () => {
    const storage = createMockStorage();

    const groups = await addKnownGroup("trip-paris", storage);

    expect(groups).toEqual([{ groupId: "trip-paris" }]);
    expect(await getKnownGroups(storage)).toEqual([{ groupId: "trip-paris" }]);
  });

  it("does not duplicate an existing group id", async () => {
    const storage = createMockStorage();

    await addKnownGroup("trip-paris", storage);
    const groups = await addKnownGroup("trip-paris", storage);

    expect(groups).toEqual([{ groupId: "trip-paris" }]);
  });

  it("appends new group ids", async () => {
    const storage = createMockStorage();

    await addKnownGroup("trip-paris", storage);
    const groups = await addKnownGroup("ski-weekend", storage);

    expect(groups).toEqual([
      { groupId: "trip-paris" },
      { groupId: "ski-weekend" },
    ]);
  });
});
