import {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from "@powersync/common";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { SyncConfig } from "./sync-config";

const FATAL_RESPONSE_CODES = [
  new RegExp("^22...$"),
  new RegExp("^23...$"),
  new RegExp("^42501$"),
];

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

async function ensureSession(client: SupabaseClient): Promise<void> {
  const { data } = await client.auth.getSession();
  if (data.session) {
    return;
  }

  const { error } = await client.auth.signInAnonymously();
  if (error) {
    throw error;
  }
}

async function ensureGroupMembership(
  client: SupabaseClient,
  groupId: string
): Promise<void> {
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session?.user) {
    return;
  }

  await client.from("group_memberships").insert({
    user_id: session.user.id,
    group_id: groupId,
  });
}

/** Creates a Supabase-backed PowerSync connector for the given client session. */
export function createSupabaseConnector(
  config: SyncConfig,
  client?: SupabaseClient
): PowerSyncBackendConnector {
  const supabase =
    client ?? createClient(config.supabaseUrl, config.supabaseAnonKey);

  return {
    fetchCredentials: async () => {
      await ensureSession(supabase);
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
      const transaction = await database.getNextCrudTransaction();
      if (!transaction) {
        return;
      }

      let lastOp: CrudEntry | null = null;
      try {
        const operations = [...transaction.crud].sort(
          (left, right) => uploadOrder(left.table) - uploadOrder(right.table)
        );

        for (const op of operations) {
          lastOp = op;
          const table = supabase.from(op.table);
          let result: { error: { code?: string; message: string } | null };

          switch (op.op) {
            case UpdateType.PUT: {
              const record = { ...op.opData, id: op.id };
              result = await table.insert(record);
              if (op.table === "groups") {
                await ensureGroupMembership(supabase, op.id);
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
