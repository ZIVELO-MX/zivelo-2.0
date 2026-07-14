/**
 * Temporary in-repo data layer for the blog, shaped to match what the real
 * Supabase `posts` table will look like (slug, tag, summary, content_html,
 * author, read_min, published_at). When Supabase is wired up, only this
 * file changes — swap the body of each function for the equivalent
 * `supabase.from("posts")` query; every page that calls these functions
 * stays the same.
 *
 * Seed content is placeholder copy on topics ZIVELO actually works in
 * (POS, restaurant tech, engineering practice) — meant to be replaced or
 * edited once real posts exist, not presented as real customer content.
 */

export type BlogPost = {
  slug: string;
  tag: { es: string; en: string };
  title: { es: string; en: string };
  summary: { es: string; en: string };
  contentHtml: { es: string; en: string };
  author: string;
  readMin: number;
  publishedAt: string; // ISO date
};

const POSTS: BlogPost[] = [
  {
    slug: "como-elegir-punto-de-venta",
    tag: { es: "Punto de Venta", en: "Point of Sale" },
    title: {
      es: "Cómo elegir un punto de venta que no te frene",
      en: "How to choose a POS that won't slow you down",
    },
    summary: {
      es: "Tres preguntas simples que te ahorran meses de dolor antes de comprar cualquier sistema de POS.",
      en: "Three simple questions that save you months of pain before buying any POS system.",
    },
    contentHtml: {
      es: `<h2>Empieza por tu operación, no por el software</h2>
<p>La mayoría elige un POS por su lista de funciones. Error. El mejor sistema es el que <strong>encaja en cómo ya trabajas</strong>, no el que te obliga a cambiar todo.</p>
<blockquote><p>Un POS lento no es un problema técnico: es una fila de clientes esperando.</p></blockquote>
<h3>Las tres preguntas</h3>
<ul>
<li>¿Cuántos segundos toma cobrar una venta típica?</li>
<li>¿Qué pasa cuando se cae el internet?</li>
<li>¿Puedo ver mis números sin llamar a soporte?</li>
</ul>
<p>Si el proveedor no responde estas tres con claridad, sigue buscando.</p>
<pre><code>// Un buen POS te da tus datos, no te los secuestra
const ventas = await pos.export({ formato: "csv" });</code></pre>
<p>En ZIVELO diseñamos el flujo de cobro para que quepa en <strong>tres toques</strong>, porque cada toque extra se multiplica por miles de ventas al mes.</p>`,
      en: `<h2>Start with your operation, not the software</h2>
<p>Most people pick a POS based on its feature list. That's a mistake. The best system is the one that <strong>fits how you already work</strong>, not the one that forces you to change everything.</p>
<blockquote><p>A slow POS isn't a technical problem: it's a line of customers waiting.</p></blockquote>
<h3>The three questions</h3>
<ul>
<li>How many seconds does a typical sale take to ring up?</li>
<li>What happens when the internet goes down?</li>
<li>Can you see your numbers without calling support?</li>
</ul>
<p>If the vendor can't answer all three clearly, keep looking.</p>
<pre><code>// A good POS gives you your data, it doesn't hold it hostage
const sales = await pos.export({ format: "csv" });</code></pre>
<p>At ZIVELO we design the checkout flow to fit in <strong>three taps</strong>, because every extra tap multiplies across thousands of sales a month.</p>`,
    },
    author: "Equipo ZIVELO",
    readMin: 6,
    publishedAt: "2026-07-15",
  },
  {
    slug: "tres-errores-en-menus-digitales",
    tag: { es: "Restaurantes", en: "Restaurants" },
    title: {
      es: "Tres errores comunes en menús digitales de restaurante",
      en: "Three common mistakes in digital restaurant menus",
    },
    summary: {
      es: "El QR en la mesa puede ayudar o estorbar. La diferencia está en tres decisiones de diseño.",
      en: "The table QR can help or hurt. The difference is three design decisions.",
    },
    contentHtml: {
      es: `<h2>El QR no es el producto, la experiencia sí</h2>
<p>Un menú digital mal hecho es peor que uno de papel. Estos son los tres tropiezos que vemos más seguido.</p>
<h3>1. Obligar a descargar una app</h3>
<p>Nadie quiere instalar algo para ver la carta. El menú debe abrir en el navegador, al instante.</p>
<h3>2. Fotos pesadas que no cargan</h3>
<p>Una foto de 8 MB en una mesa con mala señal significa un cliente frustrado. Optimizamos cada imagen antes de subirla.</p>
<h3>3. No mostrar qué se acabó</h3>
<p>Pedir algo que no hay disponible arruina la experiencia. El menú debe reflejar el inventario en tiempo real.</p>`,
      en: `<h2>The QR isn't the product, the experience is</h2>
<p>A badly built digital menu is worse than a paper one. These are the three stumbles we see most often.</p>
<h3>1. Forcing an app download</h3>
<p>Nobody wants to install something just to see the menu. It should open in the browser, instantly.</p>
<h3>2. Heavy photos that won't load</h3>
<p>An 8 MB photo on a table with weak signal means a frustrated customer. We optimize every image before it goes up.</p>
<h3>3. Not showing what's sold out</h3>
<p>Ordering something that isn't available ruins the experience. The menu should reflect real-time inventory.</p>`,
    },
    author: "Equipo ZIVELO",
    readMin: 4,
    publishedAt: "2026-07-08",
  },
  {
    slug: "por-que-elegimos-tecnologia-aburrida",
    tag: { es: "Dev · Ingeniería", en: "Dev · Engineering" },
    title: {
      es: "Por qué elegimos tecnología “aburrida” a propósito",
      en: "Why we choose “boring” technology on purpose",
    },
    summary: {
      es: "La herramienta más nueva rara vez es la mejor decisión para un negocio que quiere durar años.",
      en: "The newest tool is rarely the best decision for a business meant to last years.",
    },
    contentHtml: {
      es: `<h2>Aburrido significa probado</h2>
<p>Cuando construimos algo que vas a usar por cinco años, la novedad es un riesgo, no una ventaja.</p>
<blockquote><p>Tecnología aburrida, desplegada con cuidado, le gana a tecnología emocionante desplegada con esperanza.</p></blockquote>
<p>Elegimos herramientas con una década de vida por delante y talento disponible para contratarlas. Así, el día que necesites otro equipo, lo encuentras.</p>`,
      en: `<h2>Boring means proven</h2>
<p>When we build something you'll use for five years, novelty is a risk, not an advantage.</p>
<blockquote><p>Boring technology, deployed carefully, beats exciting technology deployed on hope.</p></blockquote>
<p>We pick tools with a decade of runway ahead and talent available to hire for them. That way, the day you need another team, you can find one.</p>`,
    },
    author: "Equipo ZIVELO",
    readMin: 5,
    publishedAt: "2026-06-30",
  },
];

export function listPosts(tag?: string): BlogPost[] {
  const sorted = [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  if (!tag || tag === "*") return sorted;
  return sorted.filter((p) => p.tag.es === tag || p.tag.en === tag);
}

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function listTags(locale: string): string[] {
  const key = locale === "en" ? "en" : "es";
  const seen = new Set<string>();
  for (const p of POSTS) seen.add(p.tag[key]);
  return Array.from(seen);
}

export function listSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}
