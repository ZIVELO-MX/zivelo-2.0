# ZIVELO Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This plan assumes you have zero context on this project beyond this file — read the "Read this first" section below before Task 1.

**Goal:** Take `zivelo-2.0` (a complete, audited Next.js 16 frontend with zero backend) to a fully working Supabase-backed blog, admin panel, and contact form — nothing left mocked.

**Architecture:** Supabase (Postgres + Auth + Storage) as the only backend. No separate API server. Public pages read through Server Components hitting Supabase directly (RLS-enforced, anon key). The admin panel is a plain, non-localized route tree at `src/app/admin/**`, gated by Supabase Auth + middleware, using Server Actions for all writes. `src/lib/blog-data.ts` stays the single seam between pages and data — its four functions get real query bodies but keep their names and parameters.

**Tech Stack:** Next.js 16.2.10 (App Router, Server Actions), React 19.2.4, TypeScript strict, `@supabase/supabase-js` + `@supabase/ssr`, Tiptap (rich text), `sanitize-html` (XSS defense), Resend (transactional email). Node 24.14.0, npm. No test framework is installed yet — see Global Constraints for the testing approach this plan uses instead of adding one.

## Read this first

- `README.md` and `AVANCE-PROYECTO.md` (repo root) — current project status. Frontend is 100% done and audited; backend is 0%.
- `SKILLS.md` (repo root) — skills already installed on this machine, including `supabase-senior` and `postgres-dba`, which you should load for anything touching schema/RLS/Auth in this plan.
- **One thing worth 30 seconds of human confirmation before you start Task 9 (the editor):** this plan builds ONE post editor screen with Spanish content in the left half and English content in the right half, edited together as a single save — not two separately-routed locale variants. This is inferred from `.editor-grid`'s two-column CSS (already built, never wired) matching the `{es, en}` field pairs on every post. If that's wrong, stop before Task 9 and ask; everything through Task 8 (schema, auth, RLS, dashboard) is correct either way.

## Global Constraints

- Package manager is **npm** (`package-lock.json` present) — every install command in this plan uses `npm install`.
- The admin route tree lives at `src/app/admin/**`, **outside** the `[locale]` segment. Reasoning: it's internal ZIVELO-team tooling, not a public bilingual surface, so it doesn't need next-intl routing, `resolveParams`, or `buildMetadata` at all.
- **No middleware.ts exists in this repo today** (confirmed by direct inspection — this Next.js 16 + next-intl setup doesn't need one for locale routing). The admin-auth middleware this plan adds is scoped to `matcher: ["/admin/:path*"]` only, so it cannot affect any existing route.
- **Schema shape decision — flat locale columns, not JSONB.** `posts` gets `title_es`/`title_en` (etc.) as separate `text` columns rather than a single JSONB column keyed by locale. Reasoning: this app has exactly two hardcoded locales (`src/i18n/routing.ts`: `locales: ["es", "en"]`) with no near-term plan for a third — flat columns are simpler to index, filter, and write RLS policies against than JSON operators. Tradeoff: adding a third locale later means a migration adding columns, not just a new JSON key. Acceptable given the whole app is bilingual-only by design.
- **`blog-data.ts` signatures become `Promise`-returning, not literally unchanged.** The mock functions are synchronous; real Supabase queries are inherently async. "Same signature" in practice means: same function names, same parameters, same resolved shape, now wrapped in a `Promise`. This touches exactly 3 call sites (`src/app/[locale]/blog/page.tsx`, `src/app/[locale]/blog/[slug]/page.tsx`) with a one-line `await` added at each call — not a rewrite. Task 5 makes this precise.
- **No sign-up route.** The admin team is small and closed. Admin users are created directly in the Supabase dashboard (Authentication → Users → Add User) or via `supabase.auth.admin.createUser` run once from the SQL/JS editor — never build a public `/admin/signup`.
- **RLS admin policy is "any authenticated user = admin."** For a small internal team this is the right default (see `posts_admin_all` in Task 2). Tradeoff: it doesn't distinguish roles within the team. If that's ever needed, add an `admins` allowlist table and change the policy's `USING`/`WITH CHECK` from `true` to a membership check — out of scope for "100% of the backend" as currently defined, noted here so it isn't forgotten.
- **Testing approach — no new test framework.** The repo has no Jest/Vitest/RTL today, and this plan is dominated by infrastructure (schema, RLS, auth, storage) that's verified more reliably against a real Supabase project than mocked. Default: `npm run build` after every task as the baseline check, plus small standalone Node scripts (run with `node`, zero new dependencies — Node 24 has a built-in test runner and `--env-file`) for the two things that need real assertions: the HTML sanitizer (a pure function — Task 7 uses `node:test`) and RLS behavior (integration checks against the live database — Tasks 3 and 13). Bootstrapping Vitest for one pure-function test would be scope creep; revisit if the admin UI grows enough logic to need component tests.
- Every SQL migration in this plan is idempotent (`if not exists` / `on conflict do nothing`) so re-running the plan against a partially-set-up project doesn't error.

## Environment variables

| Variable | Used in | Where it's set |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` | `.env.local` (dev), Vercel Project Settings → Environment Variables (prod) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same as above | same as above |
| `RESEND_API_KEY` | `src/app/actions/contact.ts` (Task 14) | `.env.local` (dev), Vercel Project Settings (prod) — **never** `NEXT_PUBLIC_*`, this one stays server-only |

`NEXT_PUBLIC_*` vars are safe to expose (RLS is what actually protects the data — the anon key alone grants nothing beyond what policies allow). `RESEND_API_KEY` must never get a `NEXT_PUBLIC_` prefix or it ships to the browser bundle. **Reminder: adding a var to `.env.local` only fixes `npm run dev`/`npm run build` locally — the deployed site needs the same three variables added in Vercel's dashboard, or the production build will fail at the first Supabase call.**

## File Structure

```
src/lib/supabase/
  client.ts          # browser Supabase client (Task 1)
  server.ts          # server Supabase client, cookie-aware (Task 1)
src/lib/sanitize.ts   # HTML allowlist sanitizer (Task 7)
src/lib/blog-data.ts  # MODIFIED: swapped to real queries (Task 5)
src/middleware.ts     # new: admin route auth guard (Task 6)
src/app/admin/
  layout.tsx          # admin shell, auth-checked, .admin-bar/.admin-tabs (Task 8/9)
  login/page.tsx       # .login-* markup (Task 8)
  page.tsx              # dashboard, .admin-list (Task 9)
  actions.ts             # Server Actions: signIn, signOut, savePost, deletePost (Task 6/10/13)
  posts/new/page.tsx        # create editor (Task 12)
  posts/[id]/edit/page.tsx  # edit editor (Task 12)
src/components/admin/
  editor-toolbar.tsx    # .vtoolbar, Tiptap toolbar (Task 11)
  post-editor.tsx        # .editor-grid, bilingual Tiptap panes (Task 12)
src/app/actions/contact.ts  # contact form Server Action (Task 14)
supabase/migrations/
  0001_posts.sql        # posts table + RLS (Task 2)
  0002_storage_covers.sql  # covers bucket + policies (Task 4)
  0003_contact_submissions.sql  # contact_submissions table (Task 14)
scripts/
  verify-posts-rls-anon.mjs   # Task 3
  verify-posts-rls-admin.mjs  # Task 13
```

---

### Task 1: Supabase client bootstrap

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `.env.example`
- Modify: `package.json` (via npm install)

**Interfaces:**
- Produces: `createClient()` (sync) from `src/lib/supabase/client.ts` — for Client Components.
- Produces: `createClient()` (async, `Promise<SupabaseClient>`) from `src/lib/supabase/server.ts` — for Server Components, Server Actions, Route Handlers.

- [ ] **Step 1: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create the browser client**

`src/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Create the server client**

`src/lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — middleware (Task 6)
            // refreshes the session cookie instead, so this is safe to ignore.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create `.env.example` and your real `.env.local`**

`.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
```

Copy it to `.env.local` and fill in the real values from your Supabase project's Settings → API page. `.env.local` is already gitignored (see `.gitignore`).

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: build succeeds (these files aren't imported anywhere yet, so this only proves no syntax errors).

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/ .env.example package.json package-lock.json
git commit -m "feat: add Supabase client setup"
```

---

### Task 2: `posts` table schema + RLS

**Files:**
- Create: `supabase/migrations/0001_posts.sql`

**Interfaces:**
- Produces: table `public.posts` with columns consumed by Task 5's rewrite of `blog-data.ts`.

- [ ] **Step 1: Write the migration**

`supabase/migrations/0001_posts.sql`:
```sql
create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  tag_es text not null,
  tag_en text not null,
  title_es text not null,
  title_en text not null,
  summary_es text not null,
  summary_en text not null,
  content_html_es text not null default '',
  content_html_en text not null default '',
  cover_url text,
  author text not null default 'Equipo ZIVELO',
  read_min integer not null default 5,
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);

alter table public.posts enable row level security;

drop policy if exists "posts_public_select" on public.posts;
create policy "posts_public_select" on public.posts
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "posts_admin_all" on public.posts;
create policy "posts_admin_all" on public.posts
  for all
  to authenticated
  using (true)
  with check (true);
```

- [ ] **Step 2: Apply it**

Run via the Supabase SQL Editor (paste and execute), or with the Supabase CLI if the project is linked:

```bash
supabase db push
```

Expected: no errors; `select * from public.posts;` in the SQL editor returns an empty result set with all 16 columns.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0001_posts.sql
git commit -m "feat: add posts table with RLS"
```

---

### Task 3: Verify anon key cannot write to `posts`

**Files:**
- Create: `scripts/verify-posts-rls-anon.mjs`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`.

- [ ] **Step 1: Write the check**

`scripts/verify-posts-rls-anon.mjs`:
```js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { error } = await supabase.from("posts").insert({
  slug: "rls-probe-should-fail",
  tag_es: "x",
  tag_en: "x",
  title_es: "x",
  title_en: "x",
  summary_es: "x",
  summary_en: "x",
});

if (!error) {
  console.error("FAIL: anon key was able to insert into posts — RLS policy is broken.");
  process.exit(1);
}

console.log("PASS: anon insert rejected as expected —", error.message);
```

- [ ] **Step 2: Run it**

Run: `node --env-file=.env.local scripts/verify-posts-rls-anon.mjs`
Expected: `PASS: anon insert rejected as expected — new row violates row-level security policy for table "posts"`

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-posts-rls-anon.mjs
git commit -m "test: verify anon cannot write to posts"
```

---

### Task 4: `covers` storage bucket + policies

**Files:**
- Create: `supabase/migrations/0002_storage_covers.sql`

- [ ] **Step 1: Write the migration**

`supabase/migrations/0002_storage_covers.sql`:
```sql
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'covers');

drop policy if exists "covers_admin_write" on storage.objects;
create policy "covers_admin_write" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'covers');

drop policy if exists "covers_admin_update" on storage.objects;
create policy "covers_admin_update" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'covers');

drop policy if exists "covers_admin_delete" on storage.objects;
create policy "covers_admin_delete" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'covers');
```

- [ ] **Step 2: Apply and verify**

Run via SQL Editor or `supabase db push`.
Expected: Storage → Buckets in the Supabase dashboard shows `covers`, marked Public.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0002_storage_covers.sql
git commit -m "feat: add covers storage bucket with public read, admin write"
```

---

### Task 5: Swap `blog-data.ts` to real Supabase queries

**Files:**
- Modify: `src/lib/blog-data.ts`
- Modify: `src/app/[locale]/blog/page.tsx:7,32-46`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx:9,11-15,20-21,44-59`

**Interfaces:**
- Consumes: `createClient()` from `src/lib/supabase/server.ts` (Task 1), `public.posts` table (Task 2).
- Produces: `listPosts(tag?: string): Promise<BlogPost[]>`, `getPost(slug: string): Promise<BlogPost | undefined>`, `listTags(locale: string): Promise<string[]>`, `listSlugs(): Promise<string[]>` — same names/params as the mock, now async. `BlogPost` type is unchanged (still the bilingual shape every page already expects) — the DB row shape maps into it inside `blog-data.ts`, so no other file needs to know about `snake_case` columns.

- [ ] **Step 1: Rewrite `blog-data.ts`**

`src/lib/blog-data.ts`:
```ts
import { createClient } from "@/lib/supabase/server";

export type BlogPost = {
  slug: string;
  tag: { es: string; en: string };
  title: { es: string; en: string };
  summary: { es: string; en: string };
  contentHtml: { es: string; en: string };
  author: string;
  readMin: number;
  publishedAt: string;
};

type PostRow = {
  slug: string;
  tag_es: string;
  tag_en: string;
  title_es: string;
  title_en: string;
  summary_es: string;
  summary_en: string;
  content_html_es: string;
  content_html_en: string;
  author: string;
  read_min: number;
  published_at: string | null;
};

function toBlogPost(row: PostRow): BlogPost {
  return {
    slug: row.slug,
    tag: { es: row.tag_es, en: row.tag_en },
    title: { es: row.title_es, en: row.title_en },
    summary: { es: row.summary_es, en: row.summary_en },
    contentHtml: { es: row.content_html_es, en: row.content_html_en },
    author: row.author,
    readMin: row.read_min,
    publishedAt: row.published_at ?? "",
  };
}

const SELECT_COLUMNS =
  "slug, tag_es, tag_en, title_es, title_en, summary_es, summary_en, content_html_es, content_html_en, author, read_min, published_at";

export async function listPosts(tag?: string): Promise<BlogPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(SELECT_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (tag && tag !== "*") {
    query = query.or(`tag_es.eq.${tag},tag_en.eq.${tag}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(toBlogPost);
}

export async function getPost(slug: string): Promise<BlogPost | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data ? toBlogPost(data) : undefined;
}

export async function listTags(locale: string): Promise<string[]> {
  const supabase = await createClient();
  const column = locale === "en" ? "tag_en" : "tag_es";
  const { data, error } = await supabase
    .from("posts")
    .select(column)
    .eq("status", "published");

  if (error) throw error;
  const seen = new Set<string>();
  for (const row of data ?? []) seen.add((row as Record<string, string>)[column]);
  return Array.from(seen);
}

export async function listSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published");

  if (error) throw error;
  return (data ?? []).map((row) => row.slug);
}
```

- [ ] **Step 2: Update `src/app/[locale]/blog/page.tsx`**

Add `export const revalidate = 3600;` after the imports (line 7), and add `await` to both call sites:

```ts
// line 7, after the existing import:
export const revalidate = 3600;
```
```ts
// line 38, was: const tags = listTags(locale);
const tags = await listTags(locale);
// line 39, was: const posts = listPosts(activeTag).map(...)
const posts = (await listPosts(activeTag)).map((p) => ({
```

- [ ] **Step 3: Update `src/app/[locale]/blog/[slug]/page.tsx`**

Add after the imports (after line 9): `export const revalidate = 3600;`

Replace the whole `generateStaticParams` function (lines 11–15) with:
```ts
export async function generateStaticParams() {
  const slugs = await listSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}
```

In `generateMetadata` (line 21), change `const post = getPost(slug);` to `const post = await getPost(slug);`.

In the page component (lines 46, 57), change:
```ts
const post = await getPost(slug);
if (!post) notFound();
```
and
```ts
const related = (await listPosts())
  .filter((p) => p.slug !== post.slug)
  .slice(0, 2);
```

- [ ] **Step 4: Seed one published row to test against**

In the Supabase SQL editor:
```sql
insert into public.posts (slug, status, tag_es, tag_en, title_es, title_en, summary_es, summary_en, content_html_es, content_html_en, published_at)
values (
  'post-de-prueba', 'published', 'Dev · Ingeniería', 'Dev · Engineering',
  'Post de prueba', 'Test post',
  'Verifica que el blog lee de Supabase.', 'Verifies the blog reads from Supabase.',
  '<p>Contenido de prueba.</p>', '<p>Test content.</p>',
  current_date
);
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: build succeeds. Then `npm run dev`, visit `/blog` and `/es/blog`/`/en/blog` — "Post de prueba" / "Test post" appears; visit `/blog/post-de-prueba` — full article renders.

- [ ] **Step 6: Commit**

```bash
git add src/lib/blog-data.ts src/app/\[locale\]/blog/
git commit -m "feat: wire blog pages to Supabase, remove mock data"
```

---

### Task 6: Supabase Auth + admin route middleware

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/admin/actions.ts`

**Interfaces:**
- Produces: `signIn(formData: FormData): Promise<{ error: string } | void>`, `signOut(): Promise<void>` — Server Actions consumed by Task 8's login page and Task 9's admin bar.

- [ ] **Step 1: Create an admin user**

In the Supabase dashboard: Authentication → Users → Add User. Set a real email and password for the first ZIVELO team member who'll publish posts. No sign-up UI is built (see Global Constraints).

- [ ] **Step 2: Create the middleware**

`src/middleware.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 3: Create the auth Server Actions**

`src/app/admin/actions.ts`:
```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
```

- [ ] **Step 4: Verify**

Run: `npm run build`, then `npm run dev`, then visit `/admin` — you should be redirected to `/admin/login` (a 404 until Task 8, but the redirect itself proves the guard works — check the Network tab for the 307).

- [ ] **Step 5: Commit**

```bash
git add src/middleware.ts src/app/admin/actions.ts
git commit -m "feat: add Supabase Auth guard for /admin routes"
```

---

### Task 7: HTML sanitizer for admin-authored content

This is the non-negotiable security task. `dangerouslySetInnerHTML` in `src/app/[locale]/blog/[slug]/page.tsx:88` is currently justified as safe because content is hardcoded by us. Once Task 12's editor lets an authenticated user author `content_html_es`/`content_html_en` freely, that assumption is gone — every gap in the editor's output, the RLS write policy, or the auth check becomes stored XSS served to every site visitor. This task closes that gap at the point of writing, before anything reaches the database.

**Files:**
- Create: `src/lib/sanitize.ts`
- Test: `src/lib/sanitize.test.mjs`

**Interfaces:**
- Produces: `sanitizeContentHtml(html: string): string` — consumed by Task 10's save Server Action, called on every write before the row is inserted/updated. Public read (Task 5) never needs to re-sanitize, since nothing reaches the table without passing through this function first.

- [ ] **Step 1: Install the sanitizer**

```bash
npm install sanitize-html
npm install -D @types/sanitize-html
```

- [ ] **Step 2: Write the failing test**

`src/lib/sanitize.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeContentHtml } from "./sanitize.ts";

test("keeps allowlisted formatting tags", () => {
  const input = "<h2>Title</h2><p>Body <strong>bold</strong> and <em>italic</em>.</p>";
  assert.equal(sanitizeContentHtml(input), input);
});

test("strips script tags entirely", () => {
  const input = '<p>Hi</p><script>alert("xss")</script>';
  assert.equal(sanitizeContentHtml(input), "<p>Hi</p>");
});

test("strips inline event handlers but keeps the element", () => {
  const input = '<p onclick="alert(1)">Click</p>';
  assert.equal(sanitizeContentHtml(input), "<p>Click</p>");
});

test("keeps safe link attributes, drops javascript: hrefs", () => {
  const safe = '<a href="https://zivelo.dev">link</a>';
  assert.equal(sanitizeContentHtml(safe), safe.replace("<a ", '<a target="_blank" rel="noopener noreferrer" '));

  const unsafe = '<a href="javascript:alert(1)">link</a>';
  assert.equal(sanitizeContentHtml(unsafe), "<a>link</a>");
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `node --experimental-strip-types --test src/lib/sanitize.test.mjs`
Expected: FAIL — `Cannot find module './sanitize.ts'`

- [ ] **Step 4: Implement the sanitizer**

`src/lib/sanitize.ts`:
```ts
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "h2", "h3", "p", "strong", "em", "blockquote",
  "ul", "ol", "li", "a", "pre", "code", "img", "br",
];

export function sanitizeContentHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
    exclusiveFilter: (frame) => frame.tag === "a" && !frame.attribs.href,
  });
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `node --experimental-strip-types --test src/lib/sanitize.test.mjs`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 6: Commit**

```bash
git add src/lib/sanitize.ts src/lib/sanitize.test.mjs package.json package-lock.json
git commit -m "feat: add server-side HTML sanitizer for admin-authored content"
```

---

### Task 8: Admin login page

**Files:**
- Create: `src/app/admin/login/page.tsx`

**Interfaces:**
- Consumes: `signIn` from `src/app/admin/actions.ts` (Task 6).

- [ ] **Step 1: Build the page reusing `.login-*` classes from `globals.css`**

`src/app/admin/login/page.tsx`:
```tsx
"use client";

import { useTransition, useState } from "react";
import { signIn } from "../actions";

export default function AdminLoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-box">
          <h1>Panel ZIVELO</h1>
          <p className="login-box__sub">Inicia sesión para administrar el blog.</p>

          <form className="login-form" action={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Correo</label>
              <input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="password">Contraseña</label>
              <input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>

            <button className="btn btn--primary login-submit" type="submit" disabled={isPending}>
              {isPending ? "Entrando…" : "Entrar"}
            </button>

            <div className={`login-error${error ? " show" : ""}`}>{error}</div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`, visit `/admin/login`, submit with the wrong password — `.login-error` appears with the message. Submit with the real admin credentials from Task 6 Step 1 — redirected to `/admin` (a 404 until Task 9, that's expected).

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/login/page.tsx
git commit -m "feat: add admin login page"
```

---

### Task 9: Admin dashboard (post list)

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `createClient()` from `src/lib/supabase/server.ts`, `signOut` from `src/app/admin/actions.ts`.

- [ ] **Step 1: Build the shared admin shell**

`src/app/admin/layout.tsx`:
```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { signOut } from "./actions";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container" style={{ paddingBlock: 40 }}>
      <div className="admin-bar">
        <b>Panel ZIVELO</b>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/admin/posts/new" className="btn btn--primary">
            Nuevo post
          </Link>
          <form action={signOut}>
            <button type="submit" className="btn">Salir</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
```

Note: `/admin/login` also sits under this tree structurally but should NOT render this shell (it has no session yet). Since `login/page.tsx` is a sibling route under `src/app/admin/`, Next.js applies `src/app/admin/layout.tsx` to it too — to avoid showing the admin bar on the login screen, move the shell markup from `layout.tsx` into the dashboard/editor pages directly, OR add a route group: rename `src/app/admin/login` to `src/app/admin/(auth)/login` and put this layout at `src/app/admin/(protected)/layout.tsx` wrapping `page.tsx`, `posts/new`, and `posts/[id]/edit` instead. Use the route-group approach — it's the standard Next.js pattern for "some routes under this prefix skip the shared shell."

- [ ] **Step 2: Build the dashboard**

`src/app/admin/page.tsx` (inside the `(protected)` group per Step 1):
```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, slug, title_es, status, published_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (
    <div className="admin-list">
      {(posts ?? []).map((post) => (
        <div key={post.id} className="admin-list__row">
          <div>
            <b>{post.title_es}</b>
            <span style={{ marginLeft: 10, color: "var(--ink-4)", fontSize: "0.8rem" }}>
              {post.status === "published" ? "Publicado" : "Borrador"}
            </span>
          </div>
          <div className="admin-list__actions">
            <Link href={`/admin/posts/${post.id}/edit`}>
              <button type="button">Editar</button>
            </Link>
          </div>
        </div>
      ))}
      {(posts ?? []).length === 0 && <p className="muted">Todavía no hay posts.</p>}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, log in at `/admin/login`, land on `/admin` — the seed post from Task 5 Step 4 ("Post de prueba") appears in `.admin-list`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(protected)" "src/app/admin/(auth)"
git commit -m "feat: add admin dashboard with post list"
```

---

### Task 10: Save-post Server Action

**Files:**
- Modify: `src/app/admin/actions.ts`

**Interfaces:**
- Consumes: `sanitizeContentHtml` (Task 7).
- Produces: `savePost(input: PostInput): Promise<{ error: string } | { id: string }>` — consumed by Task 12's editor. `deletePost(id: string): Promise<void>` — consumed by Task 13.

- [ ] **Step 1: Add the types and actions**

Append to `src/app/admin/actions.ts`:
```ts
import { sanitizeContentHtml } from "@/lib/sanitize";

export type PostInput = {
  id?: string;
  slug: string;
  status: "draft" | "published";
  tagEs: string;
  tagEn: string;
  titleEs: string;
  titleEn: string;
  summaryEs: string;
  summaryEn: string;
  contentHtmlEs: string;
  contentHtmlEn: string;
  coverUrl: string | null;
  author: string;
  readMin: number;
  publishedAt: string | null;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function savePost(input: PostInput): Promise<{ error: string } | { id: string }> {
  if (!SLUG_RE.test(input.slug)) {
    return { error: "El slug debe ser minúsculas, números y guiones, sin espacios." };
  }
  if (!input.titleEs.trim() || !input.titleEn.trim()) {
    return { error: "El título es obligatorio en ambos idiomas." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada, vuelve a iniciar sesión." };

  const row = {
    slug: input.slug,
    status: input.status,
    tag_es: input.tagEs,
    tag_en: input.tagEn,
    title_es: input.titleEs,
    title_en: input.titleEn,
    summary_es: input.summaryEs,
    summary_en: input.summaryEn,
    content_html_es: sanitizeContentHtml(input.contentHtmlEs),
    content_html_en: sanitizeContentHtml(input.contentHtmlEn),
    cover_url: input.coverUrl,
    author: input.author,
    read_min: input.readMin,
    published_at: input.publishedAt,
    updated_at: new Date().toISOString(),
  };

  const query = input.id
    ? supabase.from("posts").update(row).eq("id", input.id).select("id").single()
    : supabase.from("posts").insert(row).select("id").single();

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { id: data.id };
}

export async function deletePost(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: succeeds (no callers yet — Task 12 wires the UI to this).

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/actions.ts
git commit -m "feat: add savePost/deletePost server actions with sanitization"
```

---

### Task 11: Rich-text toolbar component (Tiptap)

**Files:**
- Create: `src/components/admin/editor-toolbar.tsx`

**Interfaces:**
- Consumes: a Tiptap `Editor` instance (from `@tiptap/react`), passed as a prop.
- Produces: `<EditorToolbar editor={editor} />` — consumed by Task 12.

- [ ] **Step 1: Install Tiptap**

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link
```

- [ ] **Step 2: Build the toolbar reusing `.vtoolbar` from `globals.css`**

`src/components/admin/editor-toolbar.tsx`:
```tsx
"use client";

import type { Editor } from "@tiptap/react";

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="vtoolbar">
      <button type="button" className="ic" onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
      <button type="button" className="ic" onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
      <span className="sep" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
      <span className="sep" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>Lista</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>Lista num.</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>Cita</button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Código</button>
      <span className="sep" />
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("URL del link:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        Link
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: succeeds (no callers yet — Task 12 wires this in).

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/editor-toolbar.tsx package.json package-lock.json
git commit -m "feat: add rich-text editor toolbar component"
```

---

### Task 12: Bilingual post editor (create + edit)

**Files:**
- Create: `src/components/admin/post-editor.tsx`
- Create: `src/app/admin/(protected)/posts/new/page.tsx`
- Create: `src/app/admin/(protected)/posts/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `EditorToolbar` (Task 11), `savePost`/`PostInput` (Task 10), `createClient` (Task 1).

- [ ] **Step 1: Build the shared editor component**

`src/components/admin/post-editor.tsx`:
```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EditorToolbar } from "./editor-toolbar";
import { savePost, type PostInput } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";

export function PostEditor({ initial }: { initial?: PostInput & { id: string } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? null);
  const [fields, setFields] = useState({
    slug: initial?.slug ?? "",
    status: initial?.status ?? "draft",
    tagEs: initial?.tagEs ?? "",
    tagEn: initial?.tagEn ?? "",
    titleEs: initial?.titleEs ?? "",
    titleEn: initial?.titleEn ?? "",
    summaryEs: initial?.summaryEs ?? "",
    summaryEn: initial?.summaryEn ?? "",
    author: initial?.author ?? "Equipo ZIVELO",
    readMin: initial?.readMin ?? 5,
  });

  const editorEs = useEditor({
    extensions: [StarterKit, Link],
    content: initial?.contentHtmlEs ?? "",
    immediatelyRender: false,
  });
  const editorEn = useEditor({
    extensions: [StarterKit, Link],
    content: initial?.contentHtmlEn ?? "",
    immediatelyRender: false,
  });

  async function handleCoverUpload(file: File) {
    const supabase = createClient();
    const path = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("covers").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    const { data } = supabase.storage.from("covers").getPublicUrl(path);
    setCoverUrl(data.publicUrl);
  }

  function handleSave() {
    setError(null);
    const input: PostInput = {
      id: initial?.id,
      ...fields,
      contentHtmlEs: editorEs?.getHTML() ?? "",
      contentHtmlEn: editorEn?.getHTML() ?? "",
      coverUrl,
      publishedAt: fields.status === "published" ? new Date().toISOString().slice(0, 10) : null,
    };
    startTransition(async () => {
      const result = await savePost(input);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/admin");
    });
  }

  return (
    <div>
      <div className="admin-fields">
        <div className="field">
          <label>Slug</label>
          <input value={fields.slug} onChange={(e) => setFields({ ...fields, slug: e.target.value })} />
        </div>
        <div className="field">
          <label>Estado</label>
          <select
            value={fields.status}
            onChange={(e) => setFields({ ...fields, status: e.target.value as "draft" | "published" })}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <div className="field">
          <label>Tag (ES)</label>
          <input value={fields.tagEs} onChange={(e) => setFields({ ...fields, tagEs: e.target.value })} />
        </div>
        <div className="field">
          <label>Tag (EN)</label>
          <input value={fields.tagEn} onChange={(e) => setFields({ ...fields, tagEn: e.target.value })} />
        </div>
        <div className="field full">
          <label>Portada</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
          {coverUrl && <img src={coverUrl} alt="" style={{ marginTop: 8, maxWidth: 200, borderRadius: 4 }} />}
        </div>
      </div>

      <div className="editor-grid" style={{ marginTop: 24 }}>
        <div className="editor-grid__side">
          <span className="editor-grid__lbl">Español</span>
          <input
            placeholder="Título"
            value={fields.titleEs}
            onChange={(e) => setFields({ ...fields, titleEs: e.target.value })}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <textarea
            placeholder="Resumen"
            value={fields.summaryEs}
            onChange={(e) => setFields({ ...fields, summaryEs: e.target.value })}
            style={{ width: "100%", marginBottom: 10, minHeight: 60 }}
          />
          <EditorToolbar editor={editorEs} />
          <EditorContent editor={editorEs} className="editor-preview" />
        </div>
        <div className="editor-grid__side">
          <span className="editor-grid__lbl">English</span>
          <input
            placeholder="Title"
            value={fields.titleEn}
            onChange={(e) => setFields({ ...fields, titleEn: e.target.value })}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <textarea
            placeholder="Summary"
            value={fields.summaryEn}
            onChange={(e) => setFields({ ...fields, summaryEn: e.target.value })}
            style={{ width: "100%", marginBottom: 10, minHeight: 60 }}
          />
          <EditorToolbar editor={editorEn} />
          <EditorContent editor={editorEn} className="editor-preview" />
        </div>
      </div>

      <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={handleSave} disabled={isPending}>
        {isPending ? "Guardando…" : "Guardar"}
      </button>
      {error && <p style={{ color: "#c0392b", marginTop: 10 }}>{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Create the "new post" route**

`src/app/admin/(protected)/posts/new/page.tsx`:
```tsx
import { PostEditor } from "@/components/admin/post-editor";

export default function NewPostPage() {
  return <PostEditor />;
}
```

- [ ] **Step 3: Create the "edit post" route**

`src/app/admin/(protected)/posts/[id]/edit/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostEditor } from "@/components/admin/post-editor";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (!post) notFound();

  return (
    <PostEditor
      initial={{
        id: post.id,
        slug: post.slug,
        status: post.status,
        tagEs: post.tag_es,
        tagEn: post.tag_en,
        titleEs: post.title_es,
        titleEn: post.title_en,
        summaryEs: post.summary_es,
        summaryEn: post.summary_en,
        contentHtmlEs: post.content_html_es,
        contentHtmlEn: post.content_html_en,
        coverUrl: post.cover_url,
        author: post.author,
        readMin: post.read_min,
        publishedAt: post.published_at,
      }}
    />
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run dev`, log in, go to `/admin/posts/new`, fill both language panes, click Guardar → redirected to `/admin`, new row visible. Click Editar on it → both panes pre-filled with the saved content. Change status to Publicado, save, then visit the public `/blog/<slug>` route → the post renders with sanitized HTML.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/post-editor.tsx "src/app/admin/(protected)/posts"
git commit -m "feat: add bilingual post editor with Tiptap and cover upload"
```

---

### Task 13: Verify an authenticated admin CAN write, and wire delete

**Files:**
- Create: `scripts/verify-posts-rls-admin.mjs`
- Modify: `src/app/admin/page.tsx` (dashboard) — add a delete button calling `deletePost`

**Interfaces:**
- Consumes: `deletePost` (Task 10).

- [ ] **Step 1: Write the positive RLS check**

`scripts/verify-posts-rls-admin.mjs`:
```js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { error: signInError } = await supabase.auth.signInWithPassword({
  email: process.env.TEST_ADMIN_EMAIL,
  password: process.env.TEST_ADMIN_PASSWORD,
});
if (signInError) {
  console.error("FAIL: could not sign in test admin —", signInError.message);
  process.exit(1);
}

const { data, error } = await supabase
  .from("posts")
  .insert({
    slug: "rls-probe-should-succeed",
    tag_es: "x", tag_en: "x", title_es: "x", title_en: "x",
    summary_es: "x", summary_en: "x",
  })
  .select("id")
  .single();

if (error) {
  console.error("FAIL: authenticated admin insert was rejected —", error.message);
  process.exit(1);
}

await supabase.from("posts").delete().eq("id", data.id);
console.log("PASS: authenticated admin insert succeeded and cleanup ran.");
```

Add `TEST_ADMIN_EMAIL` and `TEST_ADMIN_PASSWORD` to `.env.local` (the admin credentials from Task 6 Step 1) — not to `.env.example`, since these are real secrets, not placeholders.

- [ ] **Step 2: Run it**

Run: `node --env-file=.env.local scripts/verify-posts-rls-admin.mjs`
Expected: `PASS: authenticated admin insert succeeded and cleanup ran.`

- [ ] **Step 3: Wire delete into the dashboard**

In `src/app/admin/(protected)/page.tsx`, replace the `.admin-list__actions` block with:
```tsx
<div className="admin-list__actions">
  <Link href={`/admin/posts/${post.id}/edit`}>
    <button type="button">Editar</button>
  </Link>
  <form action={async () => { "use server"; await deletePost(post.id); revalidatePath("/admin"); }}>
    <button type="submit" className="del">Eliminar</button>
  </form>
</div>
```
Add the imports: `import { deletePost } from "./actions";` and `import { revalidatePath } from "next/cache";`.

- [ ] **Step 4: Verify**

Run: `npm run dev`, on `/admin` click Eliminar on the test post from Task 5 Step 4 — it disappears from the list and from `/blog`.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-posts-rls-admin.mjs "src/app/admin/(protected)/page.tsx"
git commit -m "test: verify authenticated admin can write; wire post deletion"
```

---

### Task 14: Real contact form submission

**Files:**
- Create: `supabase/migrations/0003_contact_submissions.sql`
- Create: `src/app/actions/contact.ts`
- Modify: `src/components/contact-form.tsx:1-3,50-72`

**Interfaces:**
- Produces: `submitContact(input: ContactInput): Promise<{ error: string } | { ok: true }>` — consumed by `ContactForm`'s `handleSubmit`.

- [ ] **Step 1: Create the audit-trail table**

`supabase/migrations/0003_contact_submissions.sql`:
```sql
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  topic text,
  message text not null,
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

drop policy if exists "contact_submissions_insert_anon" on public.contact_submissions;
create policy "contact_submissions_insert_anon" on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "contact_submissions_select_admin" on public.contact_submissions;
create policy "contact_submissions_select_admin" on public.contact_submissions
  for select
  to authenticated
  using (true);
```

Apply via SQL Editor or `supabase db push`.

- [ ] **Step 2: Install Resend**

```bash
npm install resend
```

Add `RESEND_API_KEY` to `.env.local` (get it from resend.com after verifying the `zivelo.dev` sending domain) and to `.env.example` as an empty placeholder (already added in Task 1's `.env.example` — confirm it's still there).

- [ ] **Step 3: Write the Server Action**

`src/app/actions/contact.ts`:
```ts
"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { CONTACT } from "@/lib/site-constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactInput = {
  name: string;
  company: string;
  email: string;
  topic: string;
  message: string;
  honeypot: string;
};

export async function submitContact(input: ContactInput): Promise<{ error: string } | { ok: true }> {
  if (input.honeypot) {
    return { ok: true };
  }

  if (!input.name.trim() || !EMAIL_RE.test(input.email) || !input.message.trim()) {
    return { error: "Faltan campos obligatorios o el correo no es válido." };
  }

  const supabase = await createClient();
  const { data, error: insertError } = await supabase
    .from("contact_submissions")
    .insert({
      name: input.name,
      company: input.company || null,
      email: input.email,
      topic: input.topic || null,
      message: input.message,
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: "No se pudo guardar tu mensaje, intenta de nuevo." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "ZIVELO <noreply@zivelo.dev>",
      to: CONTACT.email,
      replyTo: input.email,
      subject: `Nuevo contacto: ${input.name}`,
      text: `Nombre: ${input.name}\nEmpresa: ${input.company || "-"}\nCorreo: ${input.email}\nTema: ${input.topic || "-"}\n\n${input.message}`,
    });
    await supabase.from("contact_submissions").update({ email_sent: true }).eq("id", data.id);
  } catch {
    // Row is already saved — the email failure doesn't block the user from
    // seeing success. Follow up from `contact_submissions` where email_sent = false.
  }

  return { ok: true };
}
```

- [ ] **Step 4: Wire it into `ContactForm`**

In `src/components/contact-form.tsx`, add the import and a honeypot field, and replace `handleSubmit`:
```ts
// line 3, add:
import { submitContact } from "@/app/actions/contact";
```
```ts
// replace handleSubmit (lines 50-72):
async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const nameVal = (nameRef.current?.value || "").trim();
  const emailVal = (emailRef.current?.value || "").trim();
  const messageVal = (messageRef.current?.value || "").trim();

  const nameBad = !nameVal;
  const emailBad = !emailVal || !EMAIL_RE.test(emailVal);
  const messageBad = !messageVal;

  setErrors({ name: nameBad, email: emailBad, message: messageBad });

  if (nameBad || emailBad || messageBad) {
    if (nameBad) nameRef.current?.focus();
    else if (emailBad) emailRef.current?.focus();
    else if (messageBad) messageRef.current?.focus();
    return;
  }

  setStatus("fading");
  const form = e.currentTarget;
  const result = await submitContact({
    name: nameVal,
    company: String(new FormData(form).get("company") || ""),
    email: emailVal,
    topic: String(new FormData(form).get("topic") || ""),
    message: messageVal,
    honeypot: String(new FormData(form).get("website") || ""),
  });

  if ("error" in result) {
    setStatus("idle");
    return;
  }

  window.setTimeout(() => setStatus("done"), 240);
}
```

Add a hidden honeypot input inside `<form className="cform__form">` (any spot before the submit button):
```tsx
<input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
```

- [ ] **Step 5: Verify**

Run: `npm run dev`, submit the contact form on `/contact` with a real email — success panel shows, a row appears in `contact_submissions` with `email_sent = true`, and the inbox at `CONTACT.email` receives the message. Submit again with devtools setting the hidden `website` field to any value — form appears to succeed but no row is written (honeypot caught it).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0003_contact_submissions.sql src/app/actions/contact.ts src/components/contact-form.tsx package.json package-lock.json
git commit -m "feat: wire contact form to Resend with Supabase audit trail and honeypot"
```

---

## Self-Review

**Spec coverage:**
- Supabase wiring → Task 1. ✅
- `posts` table + RLS + `blog-data.ts` swap → Tasks 2, 3, 5. ✅
- Storage bucket → Task 4. ✅
- Admin auth + admin UI (login, dashboard, bilingual editor) → Tasks 6, 8, 9, 11, 12, 13. ✅
- Contact form real submission → Task 14. ✅
- Dedicated sanitization task, not folded into another → Task 7 (standalone), consumed by Task 10. ✅
- RLS verified both directions (reject anon, accept admin) → Tasks 3 and 13. ✅
- Env var checklist + Vercel reminder → present above, before Task 1. ✅
- Bilingual-editor assumption flagged for human confirmation → present in "Read this first," before Task 9/12. ✅

**Placeholder scan:** No "TBD"/"add appropriate error handling"/"similar to Task N" found — every step has complete code. One intentional exception: Task 9 Step 1 flags a real Next.js structural decision (route group for the shell) with reasoning rather than silently picking one, because it changes file paths used by every later task — Tasks 9, 12, and 13 all use the `(protected)` paths consistently after that point.

**Type/signature consistency:**
- `BlogPost` (Task 5) matches the shape every existing page (`blog/page.tsx`, `blog/[slug]/page.tsx`) already destructures — verified against the actual current file contents, not assumed.
- `PostInput` (Task 10) fields match exactly what `PostEditor` (Task 12) constructs and what `EditPostPage` (Task 12) maps from `snake_case` DB columns — cross-checked field names (`tagEs`/`tag_es`, `contentHtmlEs`/`content_html_es`, etc.) both directions.
- `sanitizeContentHtml` (Task 7) signature (`(html: string): string`) matches its two call sites in Task 10's `savePost`.
- `deletePost(id: string): Promise<void>` (Task 10) matches its Task 13 call site.
- `signIn`/`signOut` (Task 6) match their Task 8 and Task 9 call sites.
