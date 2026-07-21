-- Seed data for local development and CI
-- Real production data is managed separately via Supabase Dashboard

-- Test users for RLS verification
insert into auth.users (id, email, instance_id, aud, role) values
  ('00000000-0000-0000-0000-000000000001', 'benrod@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000002', 'rulaxx@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', 'intruder@test.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into public.admin_users (user_id) values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002')
on conflict (user_id) do nothing;

insert into public.posts (slug, status, tag_es, tag_en, title_es, title_en, summary_es, summary_en, content_html_es, content_html_en, published_at) values
  (
    'post-de-prueba', 'published', 'Dev · Ingeniería', 'Dev · Engineering',
    'Post de prueba', 'Test post',
    'Verifica que el blog funciona.', 'Verifies the blog works.',
    '<p>Contenido de prueba.</p>', '<p>Test content.</p>',
    current_date
  ),
  (
    'borrador-ejemplo', 'draft', 'General', 'General',
    'Borrador ejemplo', 'Draft example',
    'Este post no deberia ser visible al publico.', 'This post should not be publicly visible.',
    '<p>Borrador.</p>', '<p>Draft.</p>',
    null
  )
on conflict (slug) do nothing;
