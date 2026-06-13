import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  UpdateType,
} from "@powersync/common";
import type { SupabaseClient } from "@supabase/supabase-js";

import { ensureSupabaseSession, getSupabaseClient } from "./supabase-client";
import type { SyncConfig } from "./sync-config";
import { isDuplicateKeyError } from "./upload-errors";

const FATAL_RESPONSE_CODES = [new RegExp("^22...$")];

const UPLOAD_TABLE_ORDER = [
  "groups",
  "members",
  "expenses",
  "expense_contributions",
  "expense_allocations",
  "activities",
] as const;

function uploadOrder(table: string): number {
  const index = UPLOAD_TABLE_ORDER.indexOf(
    table as (typeof UPLOAD_TABLE_ORDER)[number]
  );
  return index === -1 ? UPLOAD_TABLE_ORDER.length : index;
}

async function ensureGroupMembership(
  client: SupabaseClient,
  groupId: string
): Promise<void> {
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session?.user) {
    throw new Error(
      "Cannot upload group data without an authenticated session"
    );
  }

  const { error } = await client.from("group_memberships").insert({
    user_id: session.user.id,
    group_id: groupId,
  });

  if (error && !isDuplicateKeyError(error)) {
    throw error;
  }
}

/** Creates a Supabase-backed PowerSync connector for the given client session. */
export function createSupabaseConnector(
  config: SyncConfig,
  client?: SupabaseClient
): PowerSyncBackendConnector {
  const supabase = client ?? getSupabaseClient(config);

  return {
    fetchCredentials: async () => {
      await ensureSupabaseSession(config);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        return null;
      }

      return {
        endpoint: config.powersyncUrl,
        token: session.access_token,
      };
    },

    uploadData: async (database: AbstractPowerSyncDatabase) => {
      await ensureSupabaseSession(config);

      const transaction = await database.getNextCrudTransaction();
      if (!transaction) {
        return;
      }

      try {
        const operations = [...transaction.crud].sort(
          (left, right) => uploadOrder(left.table) - uploadOrder(right.table)
        );

        for (const op of operations) {
          const table = supabase.from(op.table);
          let result: { error: { code?: string; message: string } | null };

          switch (op.op) {
            case UpdateType.PUT: {
              const record = { ...op.opData, id: op.id };
              result = await table.insert(record);
              if (result.error && isDuplicateKeyError(result.error)) {
                result = { error: null };
              }
              if (op.table === "groups") {
                await ensureGroupMembership(supabase, op.id);
              }
              if (op.table === "members") {
                const groupId =
                  typeof op.opData?.group_id === "string"
                    ? op.opData.group_id
                    : undefined;
                if (groupId) {
                  await ensureGroupMembership(supabase, groupId);
                }
              }
              break;
            }
            case UpdateType.PATCH:
              result = await table.update(op.opData ?? {}).eq("id", op.id);
              break;
            case UpdateType.DELETE:
              result = await table.delete().eq("id", op.id);
              break;
            default:
              throw new Error(`Unsupported CRUD operation: ${op.op}`);
          }

          if (result.error) {
            throw result.error;
          }
        }

        await transaction.complete();
      } catch (error: unknown) {
        const code =
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          typeof error.code === "string"
            ? error.code
            : undefined;

        if (code && FATAL_RESPONSE_CODES.some((regex) => regex.test(code))) {
          await transaction.complete();
          return;
        }

        throw error;
      }
    },
  };
}
