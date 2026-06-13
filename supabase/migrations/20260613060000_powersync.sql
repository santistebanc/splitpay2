-- PowerSync replication + group membership for per-user sync buckets.

create table public.group_memberships (
  user_id uuid not null references auth.users (id) on delete cascade,
  group_id text not null references public.groups (id) on delete cascade,
  primary key (user_id, group_id)
);

create index group_memberships_user_id_idx on public.group_memberships (user_id);

create publication powersync for table
  public.groups,
  public.members,
  public.expenses,
  public.expense_contributions,
  public.expense_allocations,
  public.activities,
  public.group_memberships;

grant select, insert, update, delete on public.group_memberships to service_role;
grant select, insert on public.group_memberships to authenticated;

alter table public.groups enable row level security;
alter table public.members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_contributions enable row level security;
alter table public.expense_allocations enable row level security;
alter table public.activities enable row level security;
alter table public.group_memberships enable row level security;

create policy groups_select on public.groups
  for select
  using (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
    )
  );

create policy groups_insert on public.groups
  for insert
  with check (auth.uid() is not null);

create policy groups_update on public.groups
  for update
  using (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
    )
  );

create policy members_all on public.members
  for all
  using (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = members.group_id
        and gm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = members.group_id
        and gm.user_id = auth.uid()
    )
  );

create policy expenses_all on public.expenses
  for all
  using (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = expenses.group_id
        and gm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = expenses.group_id
        and gm.user_id = auth.uid()
    )
  );

create policy expense_contributions_all on public.expense_contributions
  for all
  using (
    exists (
      select 1
      from public.expenses e
      join public.group_memberships gm on gm.group_id = e.group_id
      where e.id = expense_contributions.expense_id
        and gm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.expenses e
      join public.group_memberships gm on gm.group_id = e.group_id
      where e.id = expense_contributions.expense_id
        and gm.user_id = auth.uid()
    )
  );

create policy expense_allocations_all on public.expense_allocations
  for all
  using (
    exists (
      select 1
      from public.expenses e
      join public.group_memberships gm on gm.group_id = e.group_id
      where e.id = expense_allocations.expense_id
        and gm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.expenses e
      join public.group_memberships gm on gm.group_id = e.group_id
      where e.id = expense_allocations.expense_id
        and gm.user_id = auth.uid()
    )
  );

create policy activities_all on public.activities
  for all
  using (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = activities.group_id
        and gm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = activities.group_id
        and gm.user_id = auth.uid()
    )
  );

create policy group_memberships_select on public.group_memberships
  for select
  using (user_id = auth.uid());

create policy group_memberships_insert on public.group_memberships
  for insert
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, update, delete on public.members to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.expense_contributions to authenticated;
grant select, insert, update, delete on public.expense_allocations to authenticated;
grant select, insert, update, delete on public.activities to authenticated;
