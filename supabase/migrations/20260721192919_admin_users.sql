create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

grant select on public.admin_users to authenticated;

drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self" on public.admin_users
  for select
  using (user_id = auth.uid());

-- Solo writes desde service_role, no desde la API pública
