-- Run ONLY in the old PEWSS Supabase project immediately before the final export.
-- Leaves the source intact and readable; old deployments cannot accept new writes.
begin;
lock table public.pewss_applications, public.pewss_decisions in access exclusive mode;
do $$ begin
  if exists(select 1 from public.pewss_decisions where state <> 'sent') then
    raise exception 'Reconcile outstanding decisions before cutover';
  end if;
end $$;
create or replace function public.pewss_migration_read_only() returns trigger
language plpgsql set search_path='' as $$ begin
  raise exception 'PEWSS is completing a database migration. Please try again shortly.';
end $$;
create trigger pewss_migration_freeze before insert or update or delete on public.pewss_applications
for each statement execute function public.pewss_migration_read_only();
create trigger pewss_migration_freeze before insert or update or delete on public.pewss_decisions
for each statement execute function public.pewss_migration_read_only();
commit;
-- Rollback only after stopping Neon writes and reconciling any new records:
-- alter table public.pewss_applications disable trigger pewss_migration_freeze;
-- alter table public.pewss_decisions disable trigger pewss_migration_freeze;
