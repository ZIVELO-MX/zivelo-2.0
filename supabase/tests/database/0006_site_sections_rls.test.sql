begin;

select plan(7);

select has_table('public'::name, 'site_sections'::name, 'site_sections table exists');

select results_eq(
  $$ select string_agg(section_key, ',' order by section_key)
     from public.site_sections $$,
  $$ values ('about,blog,process,projects,services') $$,
  'all five sections are seeded'
);

set local role anon;
select results_eq(
  $$ select count(*)::int from public.site_sections where enabled $$,
  $$ values (5) $$,
  'anon can read enabled sections'
);

select throws_ok(
  $$ insert into public.site_sections (section_key, enabled) values ('about', false) $$,
  '42501',
  'permission denied for table site_sections',
  'anon cannot write section settings'
);

set local role authenticated;
select throws_ok(
  $$ update public.site_sections set enabled = false where section_key = 'about' $$,
  '42501',
  'permission denied for table site_sections',
  'authenticated cannot write section settings'
);

set local role service_role;
select lives_ok(
  $$ update public.site_sections set enabled = false where section_key = 'about' $$,
  'service_role can write section settings'
);

set local role postgres;
update public.site_sections set enabled = true where section_key = 'about';
select throws_ok(
  $$ insert into public.site_sections (section_key, enabled) values ('unknown', true) $$,
  '23514',
  'new row for relation "site_sections" violates check constraint "site_sections_section_key_check"',
  'unknown section keys are rejected'
);

select * from finish();
rollback;
