/* =========================================================================
   ZIVELO — Blog data layer  (blog-data.js)
   -------------------------------------------------------------------------
   PROTOTIPO: los posts viven en localStorage para que todo funcione en el
   navegador sin backend. La API imita la forma de Supabase, así que migrar
   a producción es cambiar SÓLO el cuerpo de estas funciones.

   ➜ PARA CONECTAR SUPABASE REAL (más adelante):
     1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     2. const sb = supabase.createClient(URL, ANON_KEY);
     3. list()  -> await sb.from('posts').select('*')
                     .eq('status','published').order('published_at',{ascending:false})
        get(slug)-> await sb.from('posts').select('*').eq('slug',slug).single()
        upsert(p)-> await sb.from('posts').upsert(p, { onConflict:'slug' })
        remove(id)-> await sb.from('posts').delete().eq('id',id)
        Imágenes de portada -> sb.storage.from('covers').upload(...)
        Auth del panel -> sb.auth.signInWithPassword(...)
   La UI (Blog / Post / Admin) NO cambia: ya llama a estos métodos.
   ========================================================================= */
(function () {
  "use strict";
  var KEY = "zivelo-blog-posts";

  function slugify(s) {
    return (s || "").toString().toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function readAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; }
    catch (e) { return null; }
  }
  function writeAll(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }

  /* ---- Seed content (contenido de ejemplo, editable/borrable) ---- */
  var SEED = [
    {
      id: "seed-1", slug: "como-elegir-punto-de-venta",
      title: "Cómo elegir un punto de venta que no te frene",
      title_en: "How to choose a POS that won't slow you down",
      tag: "Punto de Venta", tag_en: "Point of Sale",
      summary: "Tres preguntas simples que te ahorran meses de dolor antes de comprar cualquier sistema de POS.",
      summary_en: "Three simple questions that save you months of pain before buying any POS system.",
      cover_url: "", author: "Equipo ZIVELO", read_min: 6,
      status: "published", published_at: "2026-07-15",
      content_md: "## Empieza por tu operación, no por el software\n\nLa mayoría elige un POS por su lista de funciones. Error. El mejor sistema es el que **encaja en cómo ya trabajas** — no el que te obliga a cambiar todo.\n\n> Un POS lento no es un problema técnico: es una fila de clientes esperando.\n\n### Las tres preguntas\n\n- ¿Cuántos segundos toma cobrar una venta típica?\n- ¿Qué pasa cuando se cae el internet?\n- ¿Puedo ver mis números sin llamar a soporte?\n\nSi el proveedor no responde estas tres con claridad, sigue buscando.\n\n```js\n// Un buen POS te da tus datos, no te los secuestra\nconst ventas = await pos.export({ formato: 'csv' });\n```\n\nEn ZIVELO diseñamos el flujo de cobro para que quepa en **tres toques** — porque cada toque extra se multiplica por miles de ventas al mes."
    },
    {
      id: "seed-2", slug: "tres-errores-en-menus-digitales",
      title: "Tres errores comunes en menús digitales de restaurante",
      title_en: "Three common mistakes in digital restaurant menus",
      tag: "Restaurantes", tag_en: "Restaurants",
      summary: "El QR en la mesa puede ayudar o estorbar. La diferencia está en tres decisiones de diseño.",
      summary_en: "The table QR can help or hurt. The difference is three design decisions.",
      cover_url: "", author: "Equipo ZIVELO", read_min: 4,
      status: "published", published_at: "2026-07-08",
      content_md: "## El QR no es el producto — la experiencia sí\n\nUn menú digital mal hecho es peor que uno de papel. Estos son los tres tropiezos que vemos más seguido.\n\n### 1. Obligar a descargar una app\n\nNadie quiere instalar algo para ver la carta. El menú debe abrir en el navegador, al instante.\n\n### 2. Fotos pesadas que no cargan\n\nUna foto de 8 MB en una mesa con mala señal = cliente frustrado. Optimizamos cada imagen antes de subirla.\n\n### 3. No mostrar qué se acabó\n\nPedir algo que no hay disponible arruina la experiencia. El menú debe reflejar el inventario en tiempo real."
    },
    {
      id: "seed-3", slug: "por-que-elegimos-tecnologia-aburrida",
      title: "Por qué elegimos tecnología \"aburrida\" a propósito",
      title_en: "Why we choose \"boring\" technology on purpose",
      tag: "Dev · Ingeniería", tag_en: "Dev · Engineering",
      summary: "La herramienta más nueva rara vez es la mejor decisión para un negocio que quiere durar años.",
      summary_en: "The newest tool is rarely the best decision for a business meant to last years.",
      cover_url: "", author: "Equipo ZIVELO", read_min: 5,
      status: "published", published_at: "2026-06-30",
      content_md: "## Aburrido significa probado\n\nCuando construimos algo que vas a usar por cinco años, la novedad es un riesgo, no una ventaja.\n\n> Tecnología aburrida, desplegada con cuidado, le gana a tecnología emocionante desplegada con esperanza.\n\nElegimos herramientas con una década de vida por delante y talento disponible para contratarlas. Así, el día que necesites otro equipo, lo encuentras."
    }
  ];

  function ensureSeed() {
    var cur = readAll();
    if (!cur) { writeAll(SEED); return SEED.slice(); }
    return cur;
  }

  /* ---- Public API (async, para que el swap a Supabase sea directo) ---- */
  var BlogDB = {
    slugify: slugify,

    list: async function (opts) {
      opts = opts || {};
      var all = ensureSeed().filter(function (p) { return p.status === "published"; });
      if (opts.tag && opts.tag !== "*") all = all.filter(function (p) { return p.tag === opts.tag; });
      all.sort(function (a, b) { return (b.published_at || "").localeCompare(a.published_at || ""); });
      return all;
    },

    listAll: async function () {
      var all = ensureSeed();
      all.sort(function (a, b) { return (b.published_at || "").localeCompare(a.published_at || ""); });
      return all;
    },

    get: async function (slug) {
      return ensureSeed().find(function (p) { return p.slug === slug; }) || null;
    },

    tags: async function () {
      var all = ensureSeed().filter(function (p) { return p.status === "published"; });
      var set = [];
      all.forEach(function (p) { if (p.tag && set.indexOf(p.tag) < 0) set.push(p.tag); });
      return set;
    },

    upsert: async function (post) {
      var all = ensureSeed();
      if (!post.slug) post.slug = slugify(post.title);
      if (!post.id) post.id = "post-" + Date.now();
      if (!post.published_at) post.published_at = new Date().toISOString().slice(0, 10);
      if (!post.author) post.author = "Equipo ZIVELO";
      if (!post.read_min) { var _t = post.content_md || (post.content_html || "").replace(/<[^>]+>/g, " "); post.read_min = Math.max(1, Math.round(_t.split(/\s+/).length / 200)); }
      var i = all.findIndex(function (p) { return p.id === post.id || p.slug === post.slug; });
      if (i >= 0) all[i] = Object.assign(all[i], post); else all.unshift(post);
      writeAll(all);
      return post;
    },

    remove: async function (id) {
      var all = ensureSeed().filter(function (p) { return p.id !== id; });
      writeAll(all);
      return true;
    },

    resetSeed: async function () { writeAll(SEED.slice()); return true; }
  };

  /* ---- Parser de frontmatter para archivos .md subidos ----
     Formato esperado:
       ---
       title: Mi título
       tag: Punto de Venta
       summary: Un resumen corto
       ---
       # Cuerpo en Markdown...
  */
  BlogDB.parseMarkdownFile = function (text) {
    var meta = {}, body = text;
    var m = text.match(/^\uFEFF?---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (m) {
      m[1].split("\n").forEach(function (line) {
        var idx = line.indexOf(":");
        if (idx > 0) {
          var k = line.slice(0, idx).trim().toLowerCase();
          var v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
          meta[k] = v;
        }
      });
      body = m[2];
    }
    // Si no hay title en frontmatter, usa el primer # del cuerpo
    if (!meta.title) {
      var h = body.match(/^#\s+(.+)$/m);
      if (h) meta.title = h[1].trim();
    }
    return {
      title: meta.title || "Sin título",
      tag: meta.tag || meta.category || "General",
      summary: meta.summary || meta.description || "",
      content_md: body.trim(),
      status: "published"
    };
  };

  window.BlogDB = BlogDB;
})();
