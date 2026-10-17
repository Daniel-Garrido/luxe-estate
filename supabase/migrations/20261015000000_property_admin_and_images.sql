-- Fields edited from the admin property form, drafts, and the image bucket.
-- Requires 20261014000000_create_profiles_with_roles.sql (public.is_admin()).
-- Run once in the Supabase SQL Editor (or with `supabase db push`); it is safe to run again.

-- 1. New columns ----------------------------------------------------------------
-- The backfills only run when the column is created, so re-running keeps admin edits
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'properties' and column_name = 'parking'
  ) then
    alter table public.properties add column parking integer not null default 0;
    -- The detail page showed 2 parking spots for every property until now
    update public.properties set parking = 2;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'properties' and column_name = 'amenities'
  ) then
    alter table public.properties add column amenities text[] not null default '{}';
    -- Keys from `property.features.amenityList` in i18n/locales/*.json, previously hardcoded
    update public.properties
      set amenities = array['smartHome', 'pool', 'climate', 'evCharging', 'gym', 'wineCellar'];
  end if;
end $$;

alter table public.properties add column if not exists year_built integer;

-- Drafts are only visible to admins
alter table public.properties add column if not exists is_published boolean not null default true;
create index if not exists idx_properties_is_published on public.properties (is_published);

-- 2. Row Level Security --------------------------------------------------------
-- Replace whatever policies the table had with the ones below
do $$
declare
  policy record;
begin
  for policy in
    select policyname from pg_policies where schemaname = 'public' and tablename = 'properties'
  loop
    execute format('drop policy %I on public.properties', policy.policyname);
  end loop;
end $$;

alter table public.properties enable row level security;

create policy "Anyone can read published properties"
  on public.properties for select
  to anon, authenticated
  using (is_published or public.is_admin());

create policy "Admins can create properties"
  on public.properties for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update properties"
  on public.properties for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete properties"
  on public.properties for delete
  to authenticated
  using (public.is_admin());

grant select on public.properties to anon, authenticated;
grant insert, update, delete on public.properties to authenticated;

-- 3. Image bucket --------------------------------------------------------------
-- Public bucket: the site loads photos through their public URL
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can read property images" on storage.objects;
create policy "Anyone can read property images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'property-images');

drop policy if exists "Admins can upload property images" on storage.objects;
create policy "Admins can upload property images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "Admins can update property images" on storage.objects;
create policy "Admins can update property images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-images' and public.is_admin())
  with check (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "Admins can delete property images" on storage.objects;
create policy "Admins can delete property images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images' and public.is_admin());
