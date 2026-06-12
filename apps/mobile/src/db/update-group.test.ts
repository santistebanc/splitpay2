import { PowerSyncDatabase } from "@powersync/node";
import { afterEach, describe, expect, it } from "vitest";

import { addExpense } from "./add-expense.js";
import { createGroup, getGroup } from "./create-group.js";
import {
  addMember,
  isMemberReferenced,
  removeMember,
  renameGroup,
  renameMember,
} from "./update-group.js";
import { AppSchema } from "./schema.js";

async function openTestDatabase(): Promise<PowerSyncDatabase> {
  const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: { dbFilename: `splitpay-test-${crypto.randomUUID()}.db` },
  });
  await db.init();
  return db;
}

describe("renameGroup", () => {
  let db: PowerSyncDatabase | undefined;

  afterEach(async () => {
    if (db) {
      await db.close();
      db = undefined;
    }
  });

  it("updates the group name", async () => {
    db = await openTestDatabase();
    const group = await createGroup(db, {
      name: "Beach trip",
      currency: "EUR",
      memberNames: ["Alice"],
    });

    const updated = await renameGroup(db, group.id, "Summer trip");

    expect(updated.name).toBe("Summer trip");
    expect(await getGroup(db, group.id)).toMatchObject({ name: "Summer trip" });
  });
});

describe("addMember", () => {
  let db: PowerSyncDatabase | undefined;

  afterEach(async () => {
    if (db) {
      await db.close();
      db = undefined;
    }
  });

  it("adds a member to the group roster", async () => {
    db = await openTestDatabase();
    const group = await createGroup(db, {
      name: "Beach trip",
      currency: "EUR",
      memberNames: ["Alice"],
    });

    const carol = await addMember(db, group.id, "Carol");

    expect(carol.displayName).toBe("Carol");
    expect(await getGroup(db, group.id)).toMatchObject({
      members: [
        expect.objectContaining({ displayName: "Alice" }),
        expect.objectContaining({ displayName: "Carol" }),
      ],
    });
  });
});

describe("renameMember", () => {
  let db: PowerSyncDatabase | undefined;

  afterEach(async () => {
    if (db) {
      await db.close();
      db = undefined;
    }
  });

  it("updates a member display name", async () => {
    db = await openTestDatabase();
    const group = await createGroup(db, {
      name: "Beach trip",
      currency: "EUR",
      memberNames: ["Alice"],
    });
    const [alice] = group.members;

    const updated = await renameMember(db, alice.id, "Alicia");

    expect(updated.displayName).toBe("Alicia");
    expect(await getGroup(db, group.id)).toMatchObject({
      members: [expect.objectContaining({ displayName: "Alicia" })],
    });
  });
});

describe("removeMember", () => {
  let db: PowerSyncDatabase | undefined;

  afterEach(async () => {
    if (db) {
      await db.close();
      db = undefined;
    }
  });

  it("removes a member with no expense references", async () => {
    db = await openTestDatabase();
    const group = await createGroup(db, {
      name: "Beach trip",
      currency: "EUR",
      memberNames: ["Alice", "Bob"],
    });
    const bob = group.members.find((member) => member.displayName === "Bob");
    if (!bob) {
      throw new Error("missing Bob");
    }

    await removeMember(db, bob.id);

    expect(await getGroup(db, group.id)).toMatchObject({
      members: [expect.objectContaining({ displayName: "Alice" })],
    });
  });

  it("throws when the member is referenced by an expense", async () => {
    db = await openTestDatabase();
    const group = await createGroup(db, {
      name: "Beach trip",
      currency: "EUR",
      memberNames: ["Alice", "Bob"],
    });
    const [alice, bob] = group.members;

    await addExpense(db, {
      groupId: group.id,
      amountCents: 1200,
      note: "Lunch",
      contributions: [{ memberId: alice.id, amountCents: 1200 }],
      allocations: [{ memberId: alice.id }, { memberId: bob.id }],
    });

    await expect(removeMember(db, bob.id)).rejects.toThrow(
      "Member is referenced by expenses"
    );
    expect(await isMemberReferenced(db, bob.id)).toBe(true);
  });
});
