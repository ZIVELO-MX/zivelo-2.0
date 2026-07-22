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
    'como-elegir-punto-de-venta',
    'published',
    'Punto de Venta',
    'Point of Sale',
    'C\u00f3mo elegir un punto de venta que no te frene',
    'How to choose a POS that won''t slow you down',
    'Tres preguntas simples que te ahorran meses de dolor antes de comprar cualquier sistema de POS.',
    'Three simple questions that save you months of pain before buying any POS system.',
    E'<h2>Empieza por tu operaci\u00f3n, no por el software</h2>\n<p>La mayor\u00eda elige un POS por su lista de funciones. Error. El mejor sistema es el que <strong>encaja en c\u00f3mo ya trabajas</strong>, no el que te obliga a cambiar todo.</p>\n<blockquote><p>Un POS lento no es un problema t\u00e9cnico: es una fila de clientes esperando.</p></blockquote>\n<h3>Las tres preguntas</h3>\n<ul>\n<li>\u00bfCu\u00e1ntos segundos toma cobrar una venta t\u00edpica?</li>\n<li>\u00bfQu\u00e9 pasa cuando se cae el internet?</li>\n<li>\u00bfPuedo ver mis n\u00fameros sin llamar a soporte?</li>\n</ul>\n<p>Si el proveedor no responde estas tres con claridad, sigue buscando.</p>\n<pre><code>// Un buen POS te da tus datos, no te los secuestra\nconst ventas = await pos.export({ formato: "csv" });</code></pre>\n<p>En ZIVELO dise\u00f1amos el flujo de cobro para que quepa en <strong>tres toques</strong>, porque cada toque extra se multiplica por miles de ventas al mes.</p>',
    E'<h2>Start with your operation, not the software</h2>\n<p>Most people pick a POS based on its feature list. That\u2019s a mistake. The best system is the one that <strong>fits how you already work</strong>, not the one that forces you to change everything.</p>\n<blockquote><p>A slow POS isn\u2019t a technical problem: it\u2019s a line of customers waiting.</p></blockquote>\n<h3>The three questions</h3>\n<ul>\n<li>How many seconds does a typical sale take to ring up?</li>\n<li>What happens when the internet goes down?</li>\n<li>Can you see your numbers without calling support?</li>\n</ul>\n<p>If the vendor can\u2019t answer all three clearly, keep looking.</p>\n<pre><code>// A good POS gives you your data, it doesn\u2019t hold it hostage\nconst sales = await pos.export({ format: "csv" });</code></pre>\n<p>At ZIVELO we design the checkout flow to fit in <strong>three taps</strong>, because every extra tap multiplies across thousands of sales a month.</p>',
    '2026-07-15'
  ),
  (
    'tres-errores-en-menus-digitales',
    'published',
    'Restaurantes',
    'Restaurants',
    'Tres errores comunes en men\u00fas digitales de restaurante',
    'Three common mistakes in digital restaurant menus',
    'El QR en la mesa puede ayudar o estorbar. La diferencia est\u00e1 en tres decisiones de dise\u00f1o.',
    'The table QR can help or hurt. The difference is three design decisions.',
    E'<h2>El QR no es el producto, la experiencia s\u00ed</h2>\n<p>Un men\u00fa digital mal hecho es peor que uno de papel. Estos son los tres tropiezos que vemos m\u00e1s seguido.</p>\n<h3>1. Obligar a descargar una app</h3>\n<p>Nadie quiere instalar algo para ver la carta. El men\u00fa debe abrir en el navegador, al instante.</p>\n<h3>2. Fotos pesadas que no cargan</h3>\n<p>Una foto de 8 MB en una mesa con mala se\u00f1al significa un cliente frustrado. Optimizamos cada imagen antes de subirla.</p>\n<h3>3. No mostrar qu\u00e9 se acab\u00f3</h3>\n<p>Pedir algo que no hay disponible arruina la experiencia. El men\u00fa debe reflejar el inventario en tiempo real.</p>',
    E'<h2>The QR isn\u2019t the product, the experience is</h2>\n<p>A badly built digital menu is worse than a paper one. These are the three stumbles we see most often.</p>\n<h3>1. Forcing an app download</h3>\n<p>Nobody wants to install something just to see the menu. It should open in the browser, instantly.</p>\n<h3>2. Heavy photos that won\u2019t load</h3>\n<p>An 8 MB photo on a table with weak signal means a frustrated customer. We optimize every image before it goes up.</p>\n<h3>3. Not showing what\u2019s sold out</h3>\n<p>Ordering something that isn\u2019t available ruins the experience. The menu should reflect real-time inventory.</p>',
    '2026-07-08'
  ),
  (
    'por-que-elegimos-tecnologia-aburrida',
    'published',
    'Dev \u00b7 Ingenier\u00eda',
    'Dev \u00b7 Engineering',
    'Por qu\u00e9 elegimos tecnolog\u00eda \u201caburrida\u201d a prop\u00f3sito',
    'Why we choose \u201cboring\u201d technology on purpose',
    'La herramienta m\u00e1s nueva rara vez es la mejor decisi\u00f3n para un negocio que quiere durar a\u00f1os.',
    'The newest tool is rarely the best decision for a business meant to last years.',
    E'<h2>Aburrido significa probado</h2>\n<p>Cuando construimos algo que vas a usar por cinco a\u00f1os, la novedad es un riesgo, no una ventaja.</p>\n<blockquote><p>Tecnolog\u00eda aburrida, desplegada con cuidado, le gana a tecnolog\u00eda emocionante desplegada con esperanza.</p></blockquote>\n<p>Elegimos herramientas con una d\u00e9cada de vida por delante y talento disponible para contratarlas. As\u00ed, el d\u00eda que necesites otro equipo, lo encuentras.</p>',
    E'<h2>Boring means proven</h2>\n<p>When we build something you\u2019ll use for five years, novelty is a risk, not an advantage.</p>\n<blockquote><p>Boring technology, deployed carefully, beats exciting technology deployed on hope.</p></blockquote>\n<p>We pick tools with a decade of runway ahead and talent available to hire for them. That way, the day you need another team, you can find one.</p>',
    '2026-06-30'
  )
on conflict (slug) do nothing;
