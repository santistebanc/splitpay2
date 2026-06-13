/** Bumped when client-side table layout changes (PowerSync applies on open). */
export const APP_SCHEMA_VERSION = 5;

export const APP_TABLE_NAMES = [
  "groups",
  "members",
  "expenses",
  "expense_contributions",
  "expense_allocations",
  "activities",
] as const;

export type AppTableName = (typeof APP_TABLE_NAMES)[number];
