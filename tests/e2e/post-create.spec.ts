import { createClient } from "@supabase/supabase-js";
import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { encode } from "next-auth/jwt";

const ADMIN_EMAIL = "benjamin.rodriguez@zivelo.dev";
const OUTSIDER_EMAIL = "intruder@example.com";
const AUTH_SECRET = process.env.AUTH_SECRET ?? "e2e-auth-secret";
const COOKIE_NAME = "authjs.session-token";

async function authenticatedContext(
  browser: Browser,
  email: string,
  baseURL = "http://127.0.0.1:3000",
): Promise<BrowserContext> {
  const token = await encode({
    secret: AUTH_SECRET,
    salt: COOKIE_NAME,
    token: {
      sub: `e2e-${email}`,
      name: "E2E user",
      email,
    },
  });
  const context = await browser.newContext({ baseURL });
  await context.addCookies([
    {
      name: COOKIE_NAME,
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    },
  ]);
  return context;
}

async function fillValidPost(page: Page, slug: string, suffix: string) {
  await page.getByLabel("Título").fill(`Artículo E2E ${suffix}`);
  await page.getByLabel("Resumen").fill("Resumen de prueba en español.");
  await page.locator("#post-content_markdown_es").fill("## Contenido ES");
  await page.getByLabel("Categoría").fill("Pruebas");

  await page.getByRole("tab", { name: "EN · English" }).click();
  await page.getByLabel("Title").fill(`E2E article ${suffix}`);
  await page.getByLabel("Summary").fill("English test summary.");
  await page.locator("#post-content_markdown_en").fill("## English content");
  await page.getByLabel("Category").fill("Testing");

  await page.getByLabel("Slug").fill(slug);
}

function localSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Local Supabase E2E variables are required");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function expectPostAbsent(slug: string) {
  const { data, error } = await localSupabase()
    .from("posts")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  expect(error).toBeNull();
  expect(data).toBeNull();
}

test.describe("authenticated post creation", () => {
  test.describe.configure({ mode: "serial" });

  test("an admin creates and reloads a persisted bilingual draft", async ({
    browser,
  }, testInfo) => {
    const context = await authenticatedContext(browser, ADMIN_EMAIL);
    const page = await context.newPage();
    const suffix = `${testInfo.workerIndex}-${Date.now()}`;
    const slug = `e2e-created-${suffix}`;

    await page.goto("/es/admin/posts/nuevo");
    await fillValidPost(page, slug, suffix);
    await page.getByRole("button", { name: "Crear borrador" }).click();

    await expect(page).toHaveURL(/\/es\/admin\/posts$/);
    await expect(page.getByText(slug)).toBeVisible();
    await page.getByRole("link", { name: `Artículo E2E ${suffix}` }).click();
    await expect(page.getByLabel("Título")).toHaveValue(`Artículo E2E ${suffix}`);

    await page.reload();
    await expect(page.getByLabel("Título")).toHaveValue(`Artículo E2E ${suffix}`);
    await page.getByRole("tab", { name: "EN · English" }).click();
    await expect(page.getByLabel("Title")).toHaveValue(`E2E article ${suffix}`);

    await context.close();
  });

  test("invalid bilingual data stays visible and does not insert", async ({
    browser,
  }, testInfo) => {
    const context = await authenticatedContext(browser, ADMIN_EMAIL);
    const page = await context.newPage();
    const slug = `e2e-invalid-${testInfo.workerIndex}-${Date.now()}`;

    await page.goto("/es/admin/posts/nuevo");
    await page.getByLabel("Título").fill("Solo español");
    await page.getByLabel("Resumen").fill("Faltan los campos en inglés.");
    await page.getByLabel("Categoría").fill("Pruebas");
    await page.getByLabel("Slug").fill(slug);
    await page.getByRole("button", { name: "Crear borrador" }).click();

    await expect(page).toHaveURL(/\/es\/admin\/posts\/nuevo$/);
    await expect(
      page.getByText("Revisa los campos marcados antes de guardar la publicación."),
    ).toBeFocused();
    await expect(page.getByRole("tab", { name: "EN · English" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.locator("#post-title_en-error")).toHaveText("Required");
    await expectPostAbsent(slug);

    await context.close();
  });

  test("a signed-in non-admin cannot create a post", async ({
    browser,
  }, testInfo) => {
    const context = await authenticatedContext(browser, OUTSIDER_EMAIL);
    const page = await context.newPage();
    const suffix = `${testInfo.workerIndex}-${Date.now()}`;
    const slug = `e2e-forbidden-${suffix}`;

    await page.goto("/es/admin/posts/nuevo");
    await fillValidPost(page, slug, suffix);
    await page.getByRole("button", { name: "Crear borrador" }).click();

    await expect(page).toHaveURL(/\/es\/admin\/posts\/nuevo$/);
    await expect(
      page.getByText("Tu cuenta no tiene permisos para gestionar publicaciones."),
    ).toBeVisible();
    await expectPostAbsent(slug);

    await context.close();
  });

  test("a Supabase failure is actionable and never reports success", async ({
    browser,
  }, testInfo) => {
    const context = await authenticatedContext(
      browser,
      ADMIN_EMAIL,
      "http://127.0.0.1:3001",
    );
    const page = await context.newPage();
    const suffix = `${testInfo.workerIndex}-${Date.now()}`;

    await page.goto("/es/admin/posts/nuevo");
    await fillValidPost(page, `e2e-db-error-${suffix}`, suffix);
    await page.getByRole("button", { name: "Crear borrador" }).click();

    await expect(page).toHaveURL(/\/es\/admin\/posts\/nuevo$/);
    await expect(
      page.getByText("No se pudo verificar tu acceso. Inténtalo de nuevo."),
    ).toBeVisible();

    await context.close();
  });
});
