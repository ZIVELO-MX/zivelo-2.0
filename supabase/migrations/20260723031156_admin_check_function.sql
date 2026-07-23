-- Create security definer function for admin checks
-- This allows RLS policies to check user status without granting
-- direct table access to anon/authenticated roles.
-- Runs with caller's JWT claims but owner's table privileges.

create or replace function public.is_admin_user()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where email = current_setting('request.jwt.claims', true)::json->>'email'
  );
$$;

-- Now update RLS policies to use the security definer function
-- instead of inline subqueries that fail for unprivileged roles.

drop policy if exists "posts_admin_all" on public.posts;
create policy "posts_admin_all" on public.posts
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "covers_admin_delete" on storage.objects;
create policy "covers_admin_delete" on storage.objects
  for delete
  using ((bucket_id = 'covers') and public.is_admin_user());

drop policy if exists "covers_admin_insert" on storage.objects;
create policy "covers_admin_insert" on storage.objects
  for insert
  with check ((bucket_id = 'covers') and public.is_admin_user());

drop policy if exists "covers_admin_update" on storage.objects;
create policy "covers_admin_update" on storage.objects
  for update
  using ((bucket_id = 'covers') and public.is_admin_user())
  with check ((bucket_id = 'covers') and public.is_admin_user());
