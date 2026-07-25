import { expect, test } from "@playwright/test";

test.describe("public smoke routes", () => {
  for (const route of [
    "/es",
    "/en/services",
    "/en/projects",
    "/en/about",
    "/en/contact",
    "/en/blog",
  ]) {
    test(`renders ${route}`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("body")).toBeVisible();
      await expect(page).toHaveTitle(/.+/);
    });
  }
});

test("serves one SVG favicon on regular and global 404 pages", async ({ page, request }) => {
  for (const route of ["/es", "/route-that-does-not-exist"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });

    const icons = page.locator('link[rel="icon"]');
    await expect(icons).toHaveCount(1);
    await expect(icons).toHaveAttribute("href", "/assets/logo-white-clean.svg");
    await expect(icons).toHaveAttribute("type", "image/svg+xml");
  }

  const response = await request.get("/assets/logo-white-clean.svg");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("image/svg+xml");
});

test.describe("protected admin routes", () => {
  for (const route of ["/es/admin/posts", "/es/admin/posts/nuevo"]) {
    test(`redirects unauthenticated users from ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      await expect(page).toHaveURL(/\/es\/login$/);
      await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
    });
  }
});
