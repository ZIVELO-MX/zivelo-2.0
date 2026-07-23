-- Replace admin_users with full-featured users table
-- Safe to run even if admin_users table doesn't exist yet (fresh deploy)

drop policy if exists "posts_admin_all" on public.posts;
drop policy if exists "covers_admin_delete" on storage.objects;
drop policy if exists "covers_admin_insert" on storage.objects;
drop policy if exists "covers_admin_update" on storage.objects;

do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'admin_users') then
    alter table public.admin_users disable row level security;
    drop policy if exists "admin_users_select_self" on public.admin_users;
    drop table if exists public.admin_users cascade;
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  username text not null,
  email text not null unique,
  "avatarUrl" text not null default '',
  "passwordHash" text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

revoke all on public.users from anon, authenticated;
grant all on public.users to service_role;

create policy "posts_admin_all" on public.posts
  for all
  using (exists (select 1 from public.users
    where email = current_setting('request.jwt.claims', true)::json->>'email'))
  with check (exists (select 1 from public.users
    where email = current_setting('request.jwt.claims', true)::json->>'email'));

create policy "covers_admin_delete" on storage.objects
  for delete
  using ((bucket_id = 'covers') and (exists (select 1 from public.users
    where email = current_setting('request.jwt.claims', true)::json->>'email')));

create policy "covers_admin_insert" on storage.objects
  for insert
  with check ((bucket_id = 'covers') and (exists (select 1 from public.users
    where email = current_setting('request.jwt.claims', true)::json->>'email')));

create policy "covers_admin_update" on storage.objects
  for update
  using ((bucket_id = 'covers') and (exists (select 1 from public.users
    where email = current_setting('request.jwt.claims', true)::json->>'email')))
  with check ((bucket_id = 'covers') and (exists (select 1 from public.users
    where email = current_setting('request.jwt.claims', true)::json->>'email')));
