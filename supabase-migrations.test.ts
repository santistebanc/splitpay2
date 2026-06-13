import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATIONS_DIR = join(process.cwd(), "supabase/migrations");

const SERVER_TABLES = [
  "groups",
  "members",
  "expenses",
  "expense_contributions",
  "expense_allocations",
  "activities",
] as const;

describe("supabase migrations", () => {
  it("defines every offline table in an initial migration", () => {
    const migrationSql = readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".sql"))
      .map((file) => readFileSync(join(MIGRATIONS_DIR, file), "utf8"))
      .join("\n");

    for (const table of SERVER_TABLES) {
      expect(migrationSql).toContain(`create table public.${table}`);
    }
  });
});
