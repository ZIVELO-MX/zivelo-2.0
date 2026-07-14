# Roadmap de Migración — ZIVELO (prototipo HTML → Next.js + Vercel + Supabase)

## 0. Contexto — léelo antes de tocar código

Todo lo que hay en este proyecto es un **prototipo funcional en HTML/CSS/JS puro**, sin build step, hecho para diseñar y validar la experiencia — **no es código de producción y no debe copiarse/pegarse tal cual** a Next.js. El trabajo de esta migración es *recrear* estas pantallas y comportamientos dentro de Next.js (App Router), usando sus propios patrones (componentes React, rutas, server actions, etc.), y conectar los sistemas que hoy son simulados (auth, base de datos) a servicios reales.

**Stack destino confirmado por el cliente:** Next.js (App Router) + Vercel (hosting/deploy) + Supabase (base de datos, auth, storage).

**Fidelidad:** hi-fi. Colores, tipografía, espaciado, textos y layout ya están definidos — replícalos con precisión (ver §5 Design Tokens). No rediseñes.

---

## 1. Mapa de archivos → rutas Next.js

| Archivo prototipo | Ruta Next.js sugerida | Notas |
|---|---|---|
| `ZIVELO.html` | `/[locale]/page.tsx` (home) | 3 variantes de hero existen vía Tweaks — usar solo la variante A (split) como definitiva, a menos que el cliente pida lo contrario |
| `About.html` | `/[locale]/nosotros/page.tsx` | Misión, visión, 7 valores |
| `Servicios.html` | `/[locale]/servicios/page.tsx` | Incluye la sección de "tipos de web" en filas editoriales |
| `Projects.html` | `/[locale]/proyectos/page.tsx` | 4 proyectos reales con enlaces externos + placeholder de testimonio |
| `Process.html` | `/[locale]/proceso/page.tsx` | 8 pasos |
| `Technologies.html` | `/[locale]/tecnologias/page.tsx` | Stack real, incluye SQLite |
| `Contact.html` | `/[locale]/contacto/page.tsx` | Formulario + FAQ + WhatsApp CTA |
| `Privacy.html` / `Terms.html` | `/[locale]/privacidad`, `/[locale]/terminos` | **Tienen texto genérico marcado explícitamente para revisión legal — no publicar sin que un abogado los revise** |
| `Blog.html` | `/[locale]/blog/page.tsx` | Listado con post destacado + filtros por categoría |
| `Post.html` | `/[locale]/blog/[slug]/page.tsx` | Usar Server Component + `generateStaticParams` para SSG/ISR |
| `Login.html` | `/admin/login/page.tsx` | **Sin locale** — el panel es interno, no necesita ES/EN público |
| `Admin.html` | `/admin/page.tsx` (protegida) | Ver §4 |
| `assets/styles.css` | Migra a Tailwind config + `globals.css` con las custom properties tal cual (ver §5) | No hace falta reescribir todo a utility classes; las custom properties CSS funcionan igual en Next |
| `assets/app.js` | Reparte su lógica en componentes: sticky header → layout client component; reveal-on-scroll → hook `useInView`; tabs de casos → ya no aplica (no hay tabs en la versión actual) |
| `assets/lang.js` | **Reemplázalo por completo** — ver §2, el toggle de idioma actual es un parche de prototipo, no el patrón real de Next |
| `assets/theme.js` | Puede mantenerse conceptualmente igual: atributo `data-theme` en `<html>`, cookie o localStorage + script anti-flash en `<head>` (Next permite esto con `next/script` `beforeInteractive`) |
| `assets/auth.js` | **Reemplázalo por completo** — ver §4, es un mock con contraseña fija |
| `assets/blog-data.js` | **Reemplázalo por completo** — ver §3, hoy vive en localStorage con datos semilla |
| `assets/image-slot.js` | No migra — era un placeholder de diseño. Usar `next/image` con URLs reales de Supabase Storage |

---

## 2. Internacionalización — `/es/` y `/en/`

El prototipo usa un toggle client-side (localStorage + reemplazo de `innerHTML` vía `data-en`/`data-es`). **Esto no debe pasar a producción tal cual.** En Next.js:

1. Usar **App Router con segmento `[locale]`**: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, etc. Esto genera automáticamente `/es/...` y `/en/...`.
2. Librería recomendada: **`next-intl`** (o `next-i18next` si el equipo ya lo conoce).
3. `middleware.ts` debe:
   - Detectar el idioma del navegador (`Accept-Language`) en la primera visita.
   - Redirigir `/` → `/es` (español MX es el default, confirmado por el cliente).
   - Persistir la elección del usuario en cookie para visitas futuras.
4. **Extracción de contenido:** cada elemento con `data-en="..."` en el HTML actual es, en la práctica, un par `{clave: {es, en}}`. Al portar cada página, crea:
   - `messages/es.json`
   - `messages/en.json`

   Pide el archivo de traducciones extraídas — puedo generarlo a partir del HTML actual para acelerar esto (par clave→texto ES/EN por página), evitando retipear contenido.
5. Agregar `<link rel="alternate" hreflang="es">` / `hreflang="en"` vía la Metadata API de Next para SEO.
6. El toggle visual (botones ES/EN en el header) se mantiene igual en diseño — solo cambia su implementación interna a `next/link` con el locale en la ruta, en vez de reescribir el DOM.

---

## 3. Blog — migrar de localStorage a Supabase

Hoy `assets/blog-data.js` simula una base de datos en `localStorage` con una API ya diseñada para parecerse a Supabase (`list`, `get`, `upsert`, `remove`, `tags`). El archivo **documenta en sus propios comentarios** cómo hacer el swap — sigue esa guía. Resumen:

### Esquema sugerido (Supabase / Postgres)

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  title_en text,
  tag text not null,
  tag_en text,
  summary text,
  summary_en text,
  content_html text,          -- viene del editor visual (contentEditable actual)
  content_md text,             -- modo avanzado / import de .md
  cover_url text,               -- Supabase Storage
  author text default 'Equipo ZIVELO',
  read_min int,
  status text default 'draft', -- 'draft' | 'published'
  published_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: lectura pública solo de publicados; escritura solo autenticado
alter table posts enable row level security;
create policy "public read published" on posts for select using (status = 'published');
create policy "authenticated full access" on posts for all using (auth.role() = 'authenticated');
```

### Storage
- Bucket `covers` (público en lectura) para las imágenes de portada — hoy el campo `cover_url` en el prototipo acepta una URL pegada a mano; en producción debe subir el archivo a este bucket y guardar la URL pública resultante.

### Páginas afectadas
- `Blog.html` → Server Component con `fetch` a Supabase (o `@supabase/ssr`), revalidar con ISR (`revalidate: 60` o on-demand al publicar).
- `Post.html` → `generateStaticParams` desde los slugs publicados + `generateMetadata` para SEO/OG dinámico por post.
- `Admin.html` → Client Component que llama a Supabase directamente (con RLS protegiendo escritura).

### El editor visual (WYSIWYG)
El prototipo usa `contenteditable` nativo del navegador — funcional para el prototipo, **no recomendado para producción** (inconsistencias de HTML entre navegadores, sin sanitización). Para producción, migrar a un editor real tipo:
- **Tiptap** (recomendado — headless, basado en ProseMirror, fácil de mapear a los mismos botones: negrita, cursiva, título, lista, cita, enlace, imagen) o
- **Lexical** (de Meta, alternativa sólida).

Sanitizar el HTML resultante en el servidor antes de guardar (`sanitize-html` o similar) — nunca confiar en HTML crudo del cliente.

El "modo avanzado" (Markdown + carga de archivo `.md`) puede mantenerse casi igual: `marked` (ya usado en el prototipo) o migrar a `remark`/`react-markdown` que es más idiomático en el ecosistema React.

---

## 4. Autenticación del panel

Hoy `assets/auth.js` es un mock: una sola credencial fija (`admin@zivelo.dev` / `zivelo`), guardada en `sessionStorage`/`localStorage`. **Reemplazar por completo con Supabase Auth:**

1. `supabase.auth.signInWithPassword({ email, password })` en `Login.html` → `/admin/login/page.tsx`.
2. Proteger `/admin/**` con middleware que verifique la sesión de Supabase (cookies de sesión vía `@supabase/ssr`) y redirija a `/admin/login` si no hay sesión — mismo comportamiento que `ZiveloAuth.requireAuth()` hoy, pero con sesión real.
3. Logout → `supabase.auth.signOut()`.
4. Crear el usuario admin real en el dashboard de Supabase (o vía invitación) — no hay registro público, es panel interno.
5. El diseño de `Login.html` (tarjeta centrada, credenciales de demo visibles, checkbox "mantener sesión", link de "olvidé mi contraseña") se mantiene tal cual — solo cambia la lógica detrás del formulario. Quitar el bloque de "credenciales de prueba" visible en producción.

---

## 5. Design tokens (referencia exacta)

### Tipografía
- Display / headings: `"IBM Plex Sans"`
- Cuerpo: `"Inter"`
- Mono (labels, eyebrows, meta): `"IBM Plex Mono"`
- Cargar vía `next/font/google` en vez del `<link>` a Google Fonts del prototipo.

### Color — tema claro (`:root`)
```
--ink: #1b1a18       --paper: #ffffff      --accent: #d72228
--ink-2: #46433e      --surface: #f7f5f1    --accent-d: #a8161b
--ink-3: #78736b      --surface-2: #efece5  --accent-l: #e04a4a
--ink-4: #a59f95      --surface-3: #e7e2d9
                       --line: #e3ded4
                       --line-2: #d6d0c4
```

### Color — tema oscuro (`[data-theme="dark"]`, default de marca)
```
--ink: #f4f0e8        --paper: #141310      --accent: #e5342f
--ink-2: #c7c1b6      --surface: #1c1a16    --accent-d: #c1211d
--ink-3: #948d82      --surface-2: #242019  --accent-l: #f26b63
--ink-4: #6d675d      --line: #2c2922
                       --line-2: #3b372e
```

Estas custom properties pueden copiarse literal a `globals.css` y consumirse desde Tailwind vía `theme.extend.colors` referenciando `var(--...)`, o usarse directo sin Tailwind para el color. No hace falta traducir todo el sistema a una paleta de Tailwind — es válido mantener CSS variables.

### Otros
- Radio de borde: prácticamente todo en `2px`–`4px` (marca deliberadamente cuadrada, no "rounded-xl" genérico).
- El logo tiene 4 variantes en `assets/*.svg` (dark-full, dark-compact, white-full, white-compact) — úsalas tal cual, ya están optimizadas y con los colores de marca correctos. El logo compacto blanco (`logo-white-compact.svg`) se usa como favicon.

---

## 6. Formulario de contacto

Hoy el formulario de `Contact.html` valida en el cliente pero **no envía nada a ningún lado** (es un prototipo). En producción:
- Server Action de Next.js o Route Handler (`/api/contact`) que envíe el correo (Resend, SendGrid, o Supabase Edge Function + servicio de correo).
- Mantener la validación de cliente actual (nombre, correo, mensaje requeridos) como primera capa, pero validar también en servidor.
- Confirmar destinatario real: hoy referencia `contacto@zivelo.dev`.

---

## 7. SEO y metadata

- El `<head>` de cada página ya tiene OpenGraph, Twitter Card, y descripción — migrar a la **Metadata API** de Next (`generateMetadata` por página/locale).
- Generar `sitemap.xml` y `robots.txt` con `next-sitemap` o los archivos especiales de App Router (`app/sitemap.ts`, `app/robots.ts`).
- Asegurar `hreflang` recíproco entre `/es/...` y `/en/...` (ver §2).
- El favicon y la imagen OG deben reemplazarse por assets reales de marca — hoy usan el logo compacto como placeholder de favicon y una URL absoluta a `zivelo.dev/opengraph-image` para OG que debe confirmarse que sigue siendo válida.

---

## 8. Contenido pendiente de decisión del cliente (no inventar)

Estas piezas están **intencionalmente marcadas como placeholder** en el prototipo — no rellenar con contenido inventado al migrar:

- **Testimonios de clientes** (`Projects.html`): hay un espacio reservado explícito, sin cita ni nombre falsos. Pedir al cliente una cita real antes de publicar.
- **Imágenes de proyectos/hero**: hoy son `image-slot` (drag-and-drop) con textos de marcador. Reemplazar por capturas/fotos reales antes de lanzar.
- **Textos legales** (`Privacy.html`, `Terms.html`): plantillas genéricas, marcadas explícitamente para revisión de un abogado antes de publicarse.

---

## 9. Orden de trabajo sugerido

1. Setup del proyecto Next.js + Vercel + Tailwind/CSS vars + fuentes.
2. Enrutamiento `[locale]` + `next-intl` + middleware de detección/redirect (§2). Confirmar que el toggle ES/EN visual funciona en todas las páginas antes de seguir.
3. Portar las páginas estáticas de marketing (home, nosotros, servicios, proyectos, proceso, tecnologías) — sin datos dinámicos todavía, solo layout + contenido fijo.
4. Supabase: crear el proyecto, tabla `posts`, bucket `covers`, políticas RLS (§3).
5. Blog público (`/blog`, `/blog/[slug]`) leyendo de Supabase.
6. Supabase Auth + panel `/admin` protegido, con Tiptap/Lexical reemplazando el `contenteditable` (§4).
7. Formulario de contacto conectado a envío real de correo (§6).
8. SEO: metadata dinámica, sitemap, hreflang, favicon/OG reales (§7).
9. QA bilingüe completo (ES/EN en las 8+ rutas), ambos temas (claro/oscuro), responsive, Lighthouse.
10. Reemplazar todo el contenido marcado como placeholder (§8) con material real del cliente antes de lanzar a producción.

---

## 10. Assets a llevar tal cual (no rehacer)

- `assets/logo-dark-full.svg`, `logo-dark-compact.svg`, `logo-white-full.svg`, `logo-white-compact.svg` — logo oficial en las 4 variantes necesarias.
- Paleta y tipografía (§5).
- Todo el copy en español ya escrito en las páginas — es contenido real del cliente (extraído de zivelo.dev), no relleno.
