begin;

create schema if not exists tests;
grant usage on schema tests to public;

select plan(6);

create or replace function tests.set_user(uid uuid, user_email text default '')
  returns void
  language plpgsql security definer
as $$
begin
  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claims', format('{"sub":"%s","email":"%s"}', uid, user_email), true);
end;
$$;

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

select tests.set_anon();
set local role anon;

select throws_ok(
  $$ insert into public.posts (slug, tag_es, tag_en, title_es, title_en, summary_es, summary_en)
     values ('anon-insert', 'T', 'T', 'T', 'T', 'S', 'S') $$,
  '42501',
  'permission denied for table posts',
  'Anon cannot insert a post'
);

select throws_ok(
  $$ update public.posts set title_es = 'hacked' where slug = 'post-de-prueba' $$,
  '42501',
  'permission denied for table posts',
  'Anon cannot update a post'
);

select throws_ok(
  $$ delete from public.posts where slug = 'post-de-prueba' $$,
  '42501',
  'permission denied for table posts',
  'Anon cannot delete a post'
);

select tests.set_user('00000000-0000-0000-0000-000000000003', 'intruder@zivelo.dev');
set local role authenticated;

select results_eq(
  'select exists (select 1 from public.users where email = current_setting(''request.jwt.claims'', true)::json->>''email'')::int',
  $$ values (0) $$,
  'Intruder is not recognized as admin'
);

select results_eq(
  $$ with updated as (
       update public.posts set title_es = 'hacked'
        where slug = 'post-de-prueba'
        returning 1
     ) select count(*)::int from updated $$,
  $$ values (0) $$,
  'Intruder update affects 0 rows'
);

select results_eq(
  $$ with deleted as (
       delete from public.posts
        where slug = 'post-de-prueba'
        returning 1
     ) select count(*)::int from deleted $$,
  $$ values (0) $$,
  'Intruder delete affects 0 rows'
);

set local role postgres;
drop function if exists tests.set_user;
drop function if exists tests.set_anon;

select * from finish();
rollback;
