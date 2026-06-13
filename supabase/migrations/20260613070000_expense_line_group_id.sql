alter table public.expense_contributions
  add column group_id text references public.groups (id) on delete cascade;

alter table public.expense_allocations
  add column group_id text references public.groups (id) on delete cascade;

create index expense_contributions_group_id_idx
  on public.expense_contributions (group_id);

create index expense_allocations_group_id_idx
  on public.expense_allocations (group_id);
