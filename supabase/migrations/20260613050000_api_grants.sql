-- Allow Supabase API roles to access SplitPay tables (RLS comes in a later slice).

grant select, insert, update, delete on public.groups to service_role;
grant select, insert, update, delete on public.members to service_role;
grant select, insert, update, delete on public.expenses to service_role;
grant select, insert, update, delete on public.expense_contributions to service_role;
grant select, insert, update, delete on public.expense_allocations to service_role;
grant select, insert, update, delete on public.activities to service_role;

grant select on public.groups to anon, authenticated;
grant select on public.members to anon, authenticated;
grant select on public.expenses to anon, authenticated;
grant select on public.expense_contributions to anon, authenticated;
grant select on public.expense_allocations to anon, authenticated;
grant select on public.activities to anon, authenticated;
