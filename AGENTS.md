<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN AGENTS SUMMARY -->
## Objective
- Initiate Supabase environment (WEB-0001) and model posts/admin_users tables with RLS (WEB-0002) for the Zivelo corporate website.
- Fix the screenshot pipeline so it skips gracefully (exit 0) when env vars are missing, but still fails (exit 1) on real capture/upload errors.

## Important Details
- Supabase project ref: `yauzyuewbhzodzkynond` (remote, linked via CLI)
- Architecture: `@supabase/supabase-js` + `@supabase/ssr` (no Prisma); RLS-enforced public reads
- Supabase CLI v2.109.1 via npx, DB password exported as `SUPABASE_DB_PASSWORD`, access token exported as `SUPABASE_ACCESS_TOKEN`
- ZIPFORM_TOKEN for mission tracking is available at `zipform.zivelo.dev`
- Never push directly to `main` — always use feature branches and PRs
- Pipeline `Publish Mission screenshots` now has: (a) early check step that skips build+playwright when `TLOZ_MISSION_ID` or `ZIPFORM_TOKEN` unset, (b) `publish.ts` returns exit 0 when env vars missing, exit 1 on real errors

## Work State
### Completed
- WEB-0001: Supabase clients created (`client.ts`, `server.ts`, `service.ts`), `.env.example` committed, project `yauzyuewbhzodzkynond` linked, types generated, build green
- WEB-0001 marked `completed` (100%) in Zipform; PR #3 created from `feat/WEB-0001-supabase-bootstrap`
- Fix pushed as PR #4 (`fix/screenshot-pipeline-skip`), merged into `main` at `1ceff8f`
- PR #3 rebased on latest `main` and force-pushed
- Migrations written: `20260721192919_admin_users.sql` and `20260721192934_posts.sql`
- `seed.sql` updated with test users (benrod, rulaxx, intruder) and two sample posts
- pgTAP test file created: `0002_admin_rls.test.sql` (6 tests: anon reads, anon drafts hidden, admin CRUD, intruder deny)
- `supabase start` completed, `supabase db reset` executed locally, `supabase test db` passed
- Database TypeScript types regenerated and pushed to production
- PR #5 created from `feat/WEB-0002-posts-admin-rls`
- Auth error handling and GitHub OAuth integration
- Feature plan for company blog (posts CRUD with admin RLS)

### Active
- WEB-0005 branch `feat/WEB-0005-serve-blog-from-supabase` — ready for PR

### Blocked
- (none)

## Next Move
1. Push `feat/WEB-0005-serve-blog-from-supabase` and create PR
2. Continue with WEB-0006 (Supabase Auth in proxy) or WEB-0007 (HTML sanitization)

## Relevant Files
- `supabase/migrations/20260721192919_admin_users.sql`: admin_users table + SELFSELECT policy
- `supabase/migrations/20260721192934_posts.sql`: posts table + public_read/admin_all policies + moddatetime trigger
- `supabase/migrations/20260721202900_covers_storage.sql`: covers bucket + 4 storage RLS policies
- `supabase/seed.sql`: test auth.users, admin_users, and 3 seed blog posts
- `supabase/tests/database/0002_admin_rls.test.sql`: pgTAP RLS verification (6 tests, passing)
- `supabase/tests/database/0003_unauth_rls_negative.test.sql`: pgTAP negative RLS tests (6 tests, passing)
- `src/lib/blog-data.ts`: async Supabase queries (replaced mocks)
- `src/lib/supabase/client.ts`, `server.ts`, `service.ts`: Supabase clients
- `.env.example`: env var template
- `.github/workflows/publish-mission-screenshots.yml`: resolves WEB-XXXX from PR body
- `scripts/screenshots/resolve-mission.mjs`, `publish.ts`, `config.ts`, `zipform.ts`
<!-- END AGENTS SUMMARY -->
