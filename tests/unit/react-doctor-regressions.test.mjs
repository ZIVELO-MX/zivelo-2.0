import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readSource = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("uses stable NextAuth v4 conventions consistently", async () => {
  const [packageJson, login, logout, proxy, screenshots] = await Promise.all([
    readSource("package.json"),
    readSource("src/app/[locale]/login/page.tsx"),
    readSource("src/components/logout-button.tsx"),
    readSource("src/proxy.ts"),
    readSource("scripts/screenshots/publish.ts"),
  ]);

  assert.equal(JSON.parse(packageJson).dependencies["next-auth"], "4.24.15");
  assert.match(login, /callbackUrl/);
  assert.match(logout, /callbackUrl/);
  assert.doesNotMatch(`${login}${logout}`, /redirectTo/);
  assert.match(proxy, /next-auth\.session-token/);
  assert.match(screenshots, /next-auth\.session-token/);
  assert.doesNotMatch(`${proxy}${screenshots}`, /authjs\.session-token/);
});

test("keeps generated values and JSON-LD out of render-time hazards", async () => {
  const [contactForm, layout] = await Promise.all([
    readSource("src/components/contact-form.tsx"),
    readSource("src/app/[locale]/layout.tsx"),
  ]);

  assert.match(contactForm, /formData\.set\("f-id", crypto\.randomUUID\(\)\)/);
  assert.doesNotMatch(contactForm, /value=\{crypto\.randomUUID\(\)\}/);
  assert.match(layout, /JSON\.stringify\(organizationJsonLd\)\.replace\(\/<\/g/);
});

test("renders the sanitized preview without an HTML injection sink", async () => {
  const [editor, preview] = await Promise.all([
    readSource("src/components/admin/post-editor.tsx"),
    readSource("src/components/admin/sanitized-html-preview.tsx"),
  ]);

  assert.doesNotMatch(`${editor}${preview}`, /dangerouslySetInnerHTML/);
  assert.match(preview, /ALLOWED_TAGS/);
  assert.match(preview, /SAFE_PROTOCOLS/);
});

test("limits ZIPFORM_TOKEN to the workflow steps that require it", async () => {
  const workflow = await readSource(".github/workflows/publish-mission-screenshots.yml");
  const jobEnvironment = workflow.match(/    env:\n([\s\S]*?)    steps:/)?.[1] ?? "";

  assert.doesNotMatch(jobEnvironment, /ZIPFORM_TOKEN/);
  assert.match(workflow, /env -u ZIPFORM_TOKEN HOSTNAME=127\.0\.0\.1/);
});

test("keeps generated UI styles without the vulnerable shadcn CLI dependency", async () => {
  const [packageJson, globals] = await Promise.all([
    readSource("package.json"),
    readSource("src/app/[locale]/globals.css"),
  ]);

  assert.equal(JSON.parse(packageJson).dependencies.shadcn, undefined);
  assert.doesNotMatch(globals, /@import "shadcn\/tailwind\.css"/);
  for (const variant of ["data-open", "data-closed", "data-active", "data-horizontal", "data-vertical"]) {
    assert.match(globals, new RegExp(`@custom-variant ${variant}`));
  }
});
