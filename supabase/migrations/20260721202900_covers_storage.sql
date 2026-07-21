-- Create public bucket for blog post covers
-- Public read, admin-only write, MIME/image only, max 5 MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'covers',
  'covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do nothing;

-- Public read: anyone can view covers
drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'covers');

-- Admin insert: only benrod and rulaxx can upload covers
drop policy if exists "covers_admin_insert" on storage.objects;
create policy "covers_admin_insert" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'covers'
    and exists (select 1 from public.admin_users where user_id = auth.uid())
  );

-- Admin update: needed for upsert (replacing a cover)
drop policy if exists "covers_admin_update" on storage.objects;
create policy "covers_admin_update" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'covers'
    and exists (select 1 from public.admin_users where user_id = auth.uid())
  )
  with check (
    bucket_id = 'covers'
    and exists (select 1 from public.admin_users where user_id = auth.uid())
  );

-- Admin delete: only admins can remove covers
drop policy if exists "covers_admin_delete" on storage.objects;
create policy "covers_admin_delete" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'covers'
    and exists (select 1 from public.admin_users where user_id = auth.uid())
  );
