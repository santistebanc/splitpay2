import { describe, expect, it } from "vitest";
import {
  addKnownGroup,
  getKnownGroups,
  removeKnownGroup,
  resolveAssumedMemberId,
  setAssumedMember,
} from "./known-groups.js";
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

  it("stores an assumed member when creating a group", async () => {
    const storage = createMockStorage();

    const groups = await addKnownGroup("trip-paris", storage, {
      assumedMemberId: "alice",
    });

    expect(groups).toEqual([
      { groupId: "trip-paris", assumedMemberId: "alice" },
    ]);
  });

  it("updates assumed member on an existing group", async () => {
    const storage = createMockStorage();

    await addKnownGroup("trip-paris", storage);
    const groups = await addKnownGroup("trip-paris", storage, {
      assumedMemberId: "bob",
    });

    expect(groups).toEqual([{ groupId: "trip-paris", assumedMemberId: "bob" }]);
  });

  it("sets and clears assumed member", async () => {
    const storage = createMockStorage();

    await addKnownGroup("trip-paris", storage);
    await setAssumedMember("trip-paris", "alice", storage);
    await setAssumedMember("trip-paris", null, storage);

    expect(await getKnownGroups(storage)).toEqual([
      { groupId: "trip-paris", assumedMemberId: null },
    ]);
  });

  it("removes a group from the local index", async () => {
    const storage = createMockStorage();

    await addKnownGroup("trip-paris", storage, { assumedMemberId: "alice" });
    const groups = await removeKnownGroup("trip-paris", storage);

    expect(groups).toEqual([]);
    expect(await getKnownGroups(storage)).toEqual([]);
  });

  it("resolves assumed member only when id is still valid", () => {
    expect(
      resolveAssumedMemberId(
        { groupId: "trip-paris", assumedMemberId: "alice" },
        ["alice", "bob"]
      )
    ).toBe("alice");

    expect(
      resolveAssumedMemberId(
        { groupId: "trip-paris", assumedMemberId: "carol" },
        ["alice", "bob"]
      )
    ).toBeNull();

    expect(resolveAssumedMemberId(undefined, ["alice"])).toBeNull();
  });
});
