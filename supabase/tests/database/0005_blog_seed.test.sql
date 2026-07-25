begin;

select plan(7);

select is(
  (select count(*)::integer from public.posts),
  4,
  'seed contains three published posts and one draft'
);

select is(
  (select count(*)::integer from public.posts where status = 'published'),
  3,
  'seed contains exactly three published posts'
);

select is(
  (select count(*)::integer from public.posts where status = 'draft'),
  1,
  'seed contains exactly one draft post'
);

select is(
  (select id::text from public.posts where slug = 'como-elegir-punto-de-venta'),
  '10000000-0000-4000-8000-000000000001',
  'POS post has a deterministic id'
);

select is(
  (select id::text from public.posts where slug = 'borrador-ejemplo'),
  '10000000-0000-4000-8000-000000000004',
  'draft post has a deterministic id'
);

select ok(
  (select content_markdown_es <> '' and content_markdown_en <> ''
   from public.posts where slug = 'borrador-ejemplo'),
  'draft contains bilingual Markdown sources'
);

select ok(
  (select published_at is null from public.posts where slug = 'borrador-ejemplo'),
  'draft has no publication date'
);

select * from finish();
rollback;
