-- Deterministic blog fixtures shared by local/CI reset and the explicit
-- production importer. The three published rows are created by seed.sql.

update public.posts
set id = '10000000-0000-4000-8000-000000000001',
    author = 'Equipo ZIVELO',
    read_min = 4
where slug = 'como-elegir-punto-de-venta';

update public.posts
set id = '10000000-0000-4000-8000-000000000002',
    author = 'Equipo ZIVELO',
    read_min = 3
where slug = 'tres-errores-en-menus-digitales';

update public.posts
set id = '10000000-0000-4000-8000-000000000003',
    author = 'Equipo ZIVELO',
    read_min = 2
where slug = 'por-que-elegimos-tecnologia-aburrida';

insert into public.posts (
  id, slug, status, tag_es, tag_en, title_es, title_en,
  summary_es, summary_en, content_markdown_es, content_markdown_en,
  content_html_es, content_html_en, author, read_min, published_at
) values (
  '10000000-0000-4000-8000-000000000004',
  'borrador-ejemplo',
  'draft',
  'Operación',
  'Operations',
  'Borrador de ejemplo para el equipo',
  'Example draft for the team',
  'Fixture privado para validar el flujo de revisión del panel.',
  'Private fixture for validating the admin review flow.',
  E'## Borrador en revisión\n\nEste contenido existe para probar el flujo de edición y publicación.\n\n- [ ] Revisar título y resumen\n- [ ] Confirmar enlaces antes de publicar',
  E'## Draft under review\n\nThis content exists to exercise the editing and publishing workflow.\n\n- [ ] Review title and summary\n- [ ] Confirm links before publishing',
  '<h2>Borrador en revisión</h2><p>Este contenido existe para probar el flujo de edición y publicación.</p><ul><li>Revisar título y resumen</li><li>Confirmar enlaces antes de publicar</li></ul>',
  '<h2>Draft under review</h2><p>This content exists to exercise the editing and publishing workflow.</p><ul><li>Review title and summary</li><li>Confirm links before publishing</li></ul>',
  'Equipo ZIVELO',
  1,
  null
)
on conflict (slug) do update set
  id = excluded.id,
  status = excluded.status,
  tag_es = excluded.tag_es,
  tag_en = excluded.tag_en,
  title_es = excluded.title_es,
  title_en = excluded.title_en,
  summary_es = excluded.summary_es,
  summary_en = excluded.summary_en,
  content_markdown_es = excluded.content_markdown_es,
  content_markdown_en = excluded.content_markdown_en,
  content_html_es = excluded.content_html_es,
  content_html_en = excluded.content_html_en,
  author = excluded.author,
  read_min = excluded.read_min,
  published_at = excluded.published_at;
