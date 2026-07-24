create table if not exists public.contact_submissions (
  id uuid primary key,
  name text not null check (char_length(name) between 1 and 200),
  company text check (company is null or char_length(company) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  topic text not null check (topic in ('web', 'restaurant', 'pos', 'other')),
  message text not null check (char_length(message) between 1 and 5000),
  locale text not null check (locale in ('es', 'en')),
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sending', 'sent', 'failed')),
  delivery_attempts integer not null default 0 check (delivery_attempts >= 0),
  delivery_attempted_at timestamptz,
  email_sent_at timestamptz,
  provider_ref text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_submissions_delivery_idx
  on public.contact_submissions (delivery_status, delivery_attempts);

create index if not exists contact_submissions_created_idx
  on public.contact_submissions (created_at desc);

create extension if not exists moddatetime schema extensions;

drop trigger if exists contact_submissions_updated_at on public.contact_submissions;
create trigger contact_submissions_updated_at
  before update on public.contact_submissions
  for each row
  execute function extensions.moddatetime(updated_at);

alter table public.contact_submissions enable row level security;

-- No direct write access for anon or authenticated
revoke all on public.contact_submissions from anon, authenticated;

-- Admin read-only access
grant select on public.contact_submissions to authenticated;

drop policy if exists "contact_submissions_admin_select" on public.contact_submissions;
create policy "contact_submissions_admin_select" on public.contact_submissions
  for select
  to authenticated
  using (public.is_admin_user());