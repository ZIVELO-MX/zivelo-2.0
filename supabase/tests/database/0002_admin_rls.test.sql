begin;

create schema if not exists tests;
grant usage on schema tests to public;

select plan(6);

-- Helper function to set authenticated user with email
create or replace function tests.set_local_user(uid uuid, user_email text default '')
  returns void
  language plpgsql security definer
as $$
begin
  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claims', format('{"sub":"%s","email":"%s"}', uid, user_email), true);
end;
$$;

-- Helper: clear auth context (act as anon)
create or replace function tests.set_anon()
  returns void
  language plpgsql security definer
as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
  perform set_config('request.jwt.claims', '{}', true);
end;
$$;

-- Test 1: Anon can read published posts
select tests.set_anon();
set local role anon;
select results_eq(
  'select count(*)::int from public.posts where status = ''published''',
  $$ values (3) $$,
  'Anon can read published posts'
);

-- Test 2: Anon cannot read drafts
select results_eq(
  'select count(*)::int from public.posts where status = ''draft''',
  $$ values (0) $$,
  'Anon cannot read draft posts'
);

-- Test 3: Admin (benrod) can insert a post
select tests.set_local_user('00000000-0000-0000-0000-000000000001', 'benjamin.rodriguez@zivelo.dev');
set local role authenticated;

select lives_ok(
  $$ insert into public.posts (slug, tag_es, tag_en, title_es, title_en, summary_es, summary_en)
     values ('admin-test', 'Tag', 'Tag', 'Admin Test', 'Admin Test', 'Summary', 'Summary') $$,
  'Admin (benrod) can insert a post'
);

-- Cleanup test insert
delete from public.posts where slug = 'admin-test';

-- Test 4: Admin can update a post
select lives_ok(
  $$ update public.posts set title_es = 'Actualizado' where slug = 'como-elegir-punto-de-venta' $$,
  'Admin can update a post'
);

-- Test 5: Admin can delete a post (insert temp then delete)
insert into public.posts (slug, tag_es, tag_en, title_es, title_en, summary_es, summary_en)
values ('to-delete', 'T', 'T', 'T', 'T', 'S', 'S');

select lives_ok(
  $$ delete from public.posts where slug = 'to-delete' $$,
  'Admin can delete a post'
);

-- Test 6: Intruder (not in allowlist) cannot insert
select tests.set_local_user('00000000-0000-0000-0000-000000000003', 'intruder@zivelo.dev');
set local role authenticated;

select throws_ok(
  $$ insert into public.posts (slug, tag_es, tag_en, title_es, title_en, summary_es, summary_en)
     values ('intruder-test', 'Tag', 'Tag', 'Intruder', 'Intruder', 'Sum', 'Sum') $$,
  'new row violates row-level security policy for table "posts"',
  'Intruder (not in allowlist) cannot insert a post'
);

-- Cleanup
set local role postgres;
drop function if exists tests.set_local_user;
drop function if exists tests.set_anon;

select * from finish();
rollback;
