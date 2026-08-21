-- Seed data for local development and CI
-- Real production data is managed separately via Supabase Dashboard

insert into public.posts (slug, status, tag_es, tag_en, title_es, title_en, summary_es, summary_en, content_markdown_es, content_markdown_en, content_html_es, content_html_en, published_at) values
  (
    'como-elegir-punto-de-venta',
    'published',
    'Punto de Venta',
    'Point of Sale',
    'Cómo elegir un punto de venta que no te frene',
    'How to choose a POS that won''t slow you down',
    'Tres preguntas simples que te ahorran meses de dolor antes de comprar cualquier sistema de POS.',
    'Three simple questions that save you months of pain before buying any POS system.',
    E'## Empieza por tu operación, no por el software\n\nLa mayoría elige un POS por su lista de funciones. Error. El mejor sistema es el que **encaja en cómo ya trabajas**, no el que te obliga a cambiar todo.\n\n> Un POS lento no es un problema técnico: es una fila de clientes esperando.\n\n### Las tres preguntas\n\n- ¿Cuántos segundos toma cobrar una venta típica?\n- ¿Qué pasa cuando se cae el internet?\n- ¿Puedo ver mis números sin llamar a soporte?\n\nSi el proveedor no responde estas tres con claridad, sigue buscando.\n\n```\n// Un buen POS te da tus datos, no te los secuestra\nconst ventas = await pos.export({ formato: "csv" });\n```\n\nEn ZIVELO diseñamos el flujo de cobro para que quepa en **tres toques**, porque cada toque extra se multiplica por miles de ventas al mes.',
    E'## Start with your operation, not the software\n\nMost people pick a POS based on its feature list. That’s a mistake. The best system is the one that **fits how you already work**, not the one that forces you to change everything.\n\n> A slow POS isn’t a technical problem: it’s a line of customers waiting.\n\n### The three questions\n\n- How many seconds does a typical sale take to ring up?\n- What happens when the internet goes down?\n- Can you see your numbers without calling support?\n\nIf the vendor can’t answer all three clearly, keep looking.\n\n```\n// A good POS gives you your data, it doesn’t hold it hostage\nconst sales = await pos.export({ format: "csv" });\n```\n\nAt ZIVELO we design the checkout flow to fit in **three taps**, because every extra tap multiplies across thousands of sales a month.',
    E'<h2>Empieza por tu operación, no por el software</h2>\n<p>La mayoría elige un POS por su lista de funciones. Error. El mejor sistema es el que <strong>encaja en cómo ya trabajas</strong>, no el que te obliga a cambiar todo.</p>\n<blockquote><p>Un POS lento no es un problema técnico: es una fila de clientes esperando.</p></blockquote>\n<h3>Las tres preguntas</h3>\n<ul>\n<li>¿Cuántos segundos toma cobrar una venta típica?</li>\n<li>¿Qué pasa cuando se cae el internet?</li>\n<li>¿Puedo ver mis números sin llamar a soporte?</li>\n</ul>\n<p>Si el proveedor no responde estas tres con claridad, sigue buscando.</p>\n<pre><code>// Un buen POS te da tus datos, no te los secuestra\nconst ventas = await pos.export({ formato: "csv" });</code></pre>\n<p>En ZIVELO diseñamos el flujo de cobro para que quepa en <strong>tres toques</strong>, porque cada toque extra se multiplica por miles de ventas al mes.</p>',
    E'<h2>Start with your operation, not the software</h2>\n<p>Most people pick a POS based on its feature list. That’s a mistake. The best system is the one that <strong>fits how you already work</strong>, not the one that forces you to change everything.</p>\n<blockquote><p>A slow POS isn’t a technical problem: it’s a line of customers waiting.</p></blockquote>\n<h3>The three questions</h3>\n<ul>\n<li>How many seconds does a typical sale take to ring up?</li>\n<li>What happens when the internet goes down?</li>\n<li>Can you see your numbers without calling support?</li>\n</ul>\n<p>If the vendor can’t answer all three clearly, keep looking.</p>\n<pre><code>// A good POS gives you your data, it doesn’t hold it hostage\nconst sales = await pos.export({ format: "csv" });</code></pre>\n<p>At ZIVELO we design the checkout flow to fit in <strong>three taps</strong>, because every extra tap multiplies across thousands of sales a month.</p>',
    '2026-07-15'
  ),
  (
    'tres-errores-en-menus-digitales',
    'published',
    'Restaurantes',
    'Restaurants',
    'Tres errores comunes en menús digitales de restaurante',
    'Three common mistakes in digital restaurant menus',
    'El QR en la mesa puede ayudar o estorbar. La diferencia está en tres decisiones de diseño.',
    'The table QR can help or hurt. The difference is three design decisions.',
    E'## El QR no es el producto, la experiencia sí\n\nUn menú digital mal hecho es peor que uno de papel. Estos son los tres tropiezos que vemos más seguido.\n\n### 1. Obligar a descargar una app\n\nNadie quiere instalar algo para ver la carta. El menú debe abrir en el navegador, al instante.\n\n### 2. Fotos pesadas que no cargan\n\nUna foto de 8 MB en una mesa con mala señal significa un cliente frustrado. Optimizamos cada imagen antes de subirla.\n\n### 3. No mostrar qué se acabó\n\nPedir algo que no hay disponible arruina la experiencia. El menú debe reflejar el inventario en tiempo real.',
    E'## The QR isn’t the product, the experience is\n\nA badly built digital menu is worse than a paper one. These are the three stumbles we see most often.\n\n### 1. Forcing an app download\n\nNobody wants to install something just to see the menu. It should open in the browser, instantly.\n\n### 2. Heavy photos that won’t load\n\nAn 8 MB photo on a table with weak signal means a frustrated customer. We optimize every image before it goes up.\n\n### 3. Not showing what’s sold out\n\nOrdering something that isn’t available ruins the experience. The menu should reflect real-time inventory.',
    E'<h2>El QR no es el producto, la experiencia sí</h2>\n<p>Un menú digital mal hecho es peor que uno de papel. Estos son los tres tropiezos que vemos más seguido.</p>\n<h3>1. Obligar a descargar una app</h3>\n<p>Nadie quiere instalar algo para ver la carta. El menú debe abrir en el navegador, al instante.</p>\n<h3>2. Fotos pesadas que no cargan</h3>\n<p>Una foto de 8 MB en una mesa con mala señal significa un cliente frustrado. Optimizamos cada imagen antes de subirla.</p>\n<h3>3. No mostrar qué se acabó</h3>\n<p>Pedir algo que no hay disponible arruina la experiencia. El menú debe reflejar el inventario en tiempo real.</p>',
    E'<h2>The QR isn’t the product, the experience is</h2>\n<p>A badly built digital menu is worse than a paper one. These are the three stumbles we see most often.</p>\n<h3>1. Forcing an app download</h3>\n<p>Nobody wants to install something just to see the menu. It should open in the browser, instantly.</p>\n<h3>2. Heavy photos that won’t load</h3>\n<p>An 8 MB photo on a table with weak signal means a frustrated customer. We optimize every image before it goes up.</p>\n<h3>3. Not showing what’s sold out</h3>\n<p>Ordering something that isn’t available ruins the experience. The menu should reflect real-time inventory.</p>',
    '2026-07-08'
  ),
  (
    'por-que-elegimos-tecnologia-aburrida',
    'published',
    'Dev · Ingeniería',
    'Dev · Engineering',
    'Por qué elegimos tecnología “aburrida” a propósito',
    'Why we choose “boring” technology on purpose',
    'La herramienta más nueva rara vez es la mejor decisión para un negocio que quiere durar años.',
    'The newest tool is rarely the best decision for a business meant to last years.',
    E'## Aburrido significa probado\n\nCuando construimos algo que vas a usar por cinco años, la novedad es un riesgo, no una ventaja.\n\n> Tecnología aburrida, desplegada con cuidado, le gana a tecnología emocionante desplegada con esperanza.\n\nElegimos herramientas con una década de vida por delante y talento disponible para contratarlas. Así, el día que necesites otro equipo, lo encuentras.',
    E'## Boring means proven\n\nWhen we build something you’ll use for five years, novelty is a risk, not an advantage.\n\n> Boring technology, deployed carefully, beats exciting technology deployed on hope.\n\nWe pick tools with a decade of runway ahead and talent available to hire for them. That way, the day you need another team, you can find one.',
    E'<h2>Aburrido significa probado</h2>\n<p>Cuando construimos algo que vas a usar por cinco años, la novedad es un riesgo, no una ventaja.</p>\n<blockquote><p>Tecnología aburrida, desplegada con cuidado, le gana a tecnología emocionante desplegada con esperanza.</p></blockquote>\n<p>Elegimos herramientas con una década de vida por delante y talento disponible para contratarlas. Así, el día que necesites otro equipo, lo encuentras.</p>',
    E'<h2>Boring means proven</h2>\n<p>When we build something you’ll use for five years, novelty is a risk, not an advantage.</p>\n<blockquote><p>Boring technology, deployed carefully, beats exciting technology deployed on hope.</p></blockquote>\n<p>We pick tools with a decade of runway ahead and talent available to hire for them. That way, the day you need another team, you can find one.</p>',
    '2026-06-30'
  )
on conflict (slug) do update set
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
  published_at = excluded.published_at;
