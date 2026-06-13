import { column, Schema, Table } from "@powersync/common";

import { APP_SCHEMA_VERSION } from "./table-names";

export { APP_SCHEMA_VERSION, APP_TABLE_NAMES } from "./table-names";
export type { AppTableName } from "./table-names";

const groups = new Table(
  {
    name: column.text,
    join_code: column.text,
    currency: column.text,
    created_at: column.text,
  },
  { indexes: { join_code: ["join_code"] } }
);

const members = new Table(
  {
    group_id: column.text,
    display_name: column.text,
  },
  { indexes: { group: ["group_id"] } }
);

const expenses = new Table(
  {
    group_id: column.text,
    amount_cents: column.integer,
    created_at: column.text,
    note: column.text,
  },
  { indexes: { group: ["group_id"] } }
);

const expense_contributions = new Table(
  {
    expense_id: column.text,
    member_id: column.text,
    amount_cents: column.integer,
    group_id: column.text,
  },
  { indexes: { expense: ["expense_id"], group: ["group_id"] } }
);

const expense_allocations = new Table(
  {
    expense_id: column.text,
    member_id: column.text,
    group_id: column.text,
  },
  { indexes: { expense: ["expense_id"], group: ["group_id"] } }
);

const activities = new Table(
  {
    group_id: column.text,
    type: column.text,
    summary: column.text,
    expense_id: column.text,
    created_at: column.text,
  },
  { indexes: { group: ["group_id"] } }
);

export const AppSchema = new Schema({
  groups,
  members,
  expenses,
  expense_contributions,
  expense_allocations,
  activities,
});
