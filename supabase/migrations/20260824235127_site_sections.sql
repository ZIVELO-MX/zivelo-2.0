create table if not exists public.site_sections (
  section_key text primary key check (section_key in ('about', 'services', 'projects', 'process', 'blog')),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create extension if not exists moddatetime schema extensions;

drop trigger if exists site_sections_updated_at on public.site_sections;
create trigger site_sections_updated_at
  before update on public.site_sections
  for each row
  execute function extensions.moddatetime(updated_at);

insert into public.site_sections (section_key, enabled)
values
  ('about', true),
  ('services', true),
  ('projects', true),
  ('process', true),
  ('blog', true)
on conflict (section_key) do nothing;

alter table public.site_sections enable row level security;

revoke all on public.site_sections from anon, authenticated;
grant select on public.site_sections to anon, authenticated;
grant all on public.site_sections to service_role;

drop policy if exists "site_sections_public_select" on public.site_sections;
create policy "site_sections_public_select" on public.site_sections
  for select
  to anon, authenticated
  using (true);
