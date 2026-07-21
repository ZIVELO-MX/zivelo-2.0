create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  tag_es text not null,
  tag_en text not null,
  title_es text not null,
  title_en text not null,
  summary_es text not null,
  summary_en text not null,
  content_html_es text not null default '',
  content_html_en text not null default '',
  cover_url text,
  cover_alt_es text,
  cover_alt_en text,
  author text not null default 'Equipo ZIVELO',
  read_min integer not null default 5,
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);

create extension if not exists moddatetime schema extensions;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row
  execute function extensions.moddatetime(updated_at);

alter table public.posts enable row level security;

grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;

drop policy if exists "posts_public_select" on public.posts;
create policy "posts_public_select" on public.posts
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "posts_admin_all" on public.posts;
create policy "posts_admin_all" on public.posts
  for all
  to authenticated
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
