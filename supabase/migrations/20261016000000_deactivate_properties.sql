-- Properties are deactivated instead of deleted.
-- Requires 20261015000000_property_admin_and_images.sql.
-- Run once in the Supabase SQL Editor (or with `supabase db push`); it is safe to run again.

-- 1. Column ---------------------------------------------------------------------
-- Inactive properties are hidden from the public site but stay in the admin dashboard
alter table public.properties add column if not exists is_active boolean not null default true;
create index if not exists idx_properties_is_active on public.properties (is_active);

-- 2. Row Level Security --------------------------------------------------------
drop policy if exists "Anyone can read published properties" on public.properties;
create policy "Anyone can read published properties"
  on public.properties for select
  to anon, authenticated
  using ((is_published and is_active) or public.is_admin());

drop policy if exists "Admins can delete properties" on public.properties;
revoke delete on public.properties from anon, authenticated;

-- 3. Block deletes --------------------------------------------------------------
-- Also stops the service role and the SQL Editor; for real maintenance run
-- `alter table public.properties disable trigger prevent_property_delete;` first
create or replace function public.prevent_property_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Properties cannot be deleted; set is_active = false instead'
    using errcode = 'restrict_violation';
end;
$$;

drop trigger if exists prevent_property_delete on public.properties;
create trigger prevent_property_delete
  before delete on public.properties
  for each row execute function public.prevent_property_delete();
