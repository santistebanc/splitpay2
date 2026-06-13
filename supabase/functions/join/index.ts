import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const JOIN_CODE_LENGTH = 5;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type JoinRequest = {
  joinCode?: string;
  displayName?: string;
};

type GroupRow = {
  id: string;
  name: string;
  join_code: string;
  currency: string;
  created_at: string;
};

type MemberRow = {
  id: string;
  group_id: string;
  display_name: string;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidJoinCode(code: string): boolean {
  if (code.length !== JOIN_CODE_LENGTH) {
    return false;
  }

  return [...code].every((char) => JOIN_CODE_ALPHABET.includes(char));
}

function mapGroup(row: GroupRow) {
  return {
    id: row.id,
    name: row.name,
    joinCode: row.join_code,
    currency: row.currency,
    createdAt: row.created_at,
  };
}

function mapMember(row: MemberRow) {
  return {
    id: row.id,
    groupId: row.group_id,
    displayName: row.display_name,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: JoinRequest;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const joinCode = body.joinCode?.trim().toUpperCase() ?? "";
  const displayName = body.displayName?.trim() ?? "";

  if (!isValidJoinCode(joinCode)) {
    return jsonResponse({ error: "Invalid join code" }, 400);
  }

  if (!displayName) {
    return jsonResponse({ error: "Enter a member name" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: groupRow, error: groupError } = await supabase
    .from("groups")
    .select("id, name, join_code, currency, created_at")
    .eq("join_code", joinCode)
    .maybeSingle();

  if (groupError) {
    return jsonResponse({ error: groupError.message }, 500);
  }

  if (!groupRow) {
    return jsonResponse({ error: "Group not found" }, 404);
  }

  const memberId = crypto.randomUUID();
  const { data: memberRow, error: memberError } = await supabase
    .from("members")
    .insert({
      id: memberId,
      group_id: groupRow.id,
      display_name: displayName,
    })
    .select("id, group_id, display_name")
    .single();

  if (memberError || !memberRow) {
    return jsonResponse(
      { error: memberError?.message ?? "Could not add member" },
      500
    );
  }

  const { data: memberRows, error: membersError } = await supabase
    .from("members")
    .select("id, group_id, display_name")
    .eq("group_id", groupRow.id)
    .order("display_name");

  if (membersError || !memberRows) {
    return jsonResponse({ error: membersError.message }, 500);
  }

  return jsonResponse({
    group: mapGroup(groupRow),
    member: mapMember(memberRow),
    members: memberRows.map(mapMember),
  });
});
