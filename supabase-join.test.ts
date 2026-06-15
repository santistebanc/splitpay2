import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  LOCAL_SERVICE_ROLE_KEY,
  LOCAL_SUPABASE_URL,
} from "./env/local-keys.cjs";

const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function isLocalSupabaseRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${LOCAL_SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: LOCAL_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${LOCAL_SERVICE_ROLE_KEY}`,
      },
    });

    return response.status === 200;
  } catch {
    return false;
  }
}

function randomJoinCode(): string {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code +=
      JOIN_CODE_ALPHABET[Math.floor(Math.random() * JOIN_CODE_ALPHABET.length)];
  }
  return code;
}

describe("supabase join edge function", () => {
  it("defines a join function entrypoint", () => {
    const source = readFileSync("supabase/functions/join/index.ts", "utf8");

    expect(source).toContain("Deno.serve");
    expect(source).toContain("joinCode");
    expect(source).toContain("displayName");
  });

  it("joins a group by code against local Supabase", async () => {
    if (!(await isLocalSupabaseRunning())) {
      return;
    }

    const groupId = randomUUID();
    const joinCode = randomJoinCode();
    const createdAt = new Date().toISOString();
    const headers = {
      apikey: LOCAL_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${LOCAL_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    };

    const seedGroup = await fetch(`${LOCAL_SUPABASE_URL}/rest/v1/groups`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: groupId,
        name: "Weekend trip",
        join_code: joinCode,
        currency: "EUR",
        created_at: createdAt,
      }),
    });
    expect(seedGroup.status).toBe(201);

    const seedMember = await fetch(`${LOCAL_SUPABASE_URL}/rest/v1/members`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: randomUUID(),
        group_id: groupId,
        display_name: "Alice",
      }),
    });
    expect(seedMember.status).toBe(201);

    const joinResponse = await fetch(
      `${LOCAL_SUPABASE_URL}/functions/v1/join`,
      {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          joinCode,
          displayName: "Bob",
        }),
      }
    );

    expect(joinResponse.status).toBe(200);
    const body = (await joinResponse.json()) as {
      group: { id: string; joinCode: string };
      member: { displayName: string; groupId: string };
      members: { displayName: string }[];
    };

    expect(body.group.id).toBe(groupId);
    expect(body.group.joinCode).toBe(joinCode);
    expect(body.member.displayName).toBe("Bob");
    expect(body.member.groupId).toBe(groupId);
    expect(body.members.map((member) => member.displayName).sort()).toEqual([
      "Alice",
      "Bob",
    ]);
  });

  it("returns 404 when the join code is unknown", async () => {
    if (!(await isLocalSupabaseRunning())) {
      return;
    }

    const response = await fetch(`${LOCAL_SUPABASE_URL}/functions/v1/join`, {
      method: "POST",
      headers: {
        apikey: LOCAL_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${LOCAL_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        joinCode: "ZZZZZ",
        displayName: "Bob",
      }),
    });

    expect(response.status).toBe(404);
  });
});
