-- SplitPay server schema (mirrors apps/mobile/src/db/schema.ts for future PowerSync sync)

create table public.groups (
  id text primary key,
  name text not null,
  join_code text not null,
  currency text not null,
  created_at text not null
);

create unique index groups_join_code_idx on public.groups (join_code);

create table public.members (
  id text primary key,
  group_id text not null references public.groups (id) on delete cascade,
  display_name text not null
);

create index members_group_id_idx on public.members (group_id);

create table public.expenses (
  id text primary key,
  group_id text not null references public.groups (id) on delete cascade,
  amount_cents integer not null,
  created_at text not null,
  note text not null default ''
);

create index expenses_group_id_idx on public.expenses (group_id);

create table public.expense_contributions (
  id text primary key,
  expense_id text not null references public.expenses (id) on delete cascade,
  member_id text not null references public.members (id),
  amount_cents integer not null
);

create index expense_contributions_expense_id_idx
  on public.expense_contributions (expense_id);

create table public.expense_allocations (
  id text primary key,
  expense_id text not null references public.expenses (id) on delete cascade,
  member_id text not null references public.members (id)
);

create index expense_allocations_expense_id_idx
  on public.expense_allocations (expense_id);

create table public.activities (
  id text primary key,
  group_id text not null references public.groups (id) on delete cascade,
  type text not null,
  summary text not null,
  expense_id text references public.expenses (id) on delete set null,
  created_at text not null
);

create index activities_group_id_idx on public.activities (group_id);
