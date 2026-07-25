begin;

select plan(4);

select ok(
  has_table_privilege('service_role', 'public.posts', 'SELECT'),
  'service_role can select posts'
);

select ok(
  has_table_privilege('service_role', 'public.posts', 'INSERT'),
  'service_role can insert posts'
);

select ok(
  has_table_privilege('service_role', 'public.posts', 'UPDATE'),
  'service_role can update posts'
);

select ok(
  has_table_privilege('service_role', 'public.posts', 'DELETE'),
  'service_role can delete posts'
);

select * from finish();
rollback;
