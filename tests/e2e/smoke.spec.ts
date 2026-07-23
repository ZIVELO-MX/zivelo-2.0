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

test.describe("protected admin routes", () => {
  for (const route of ["/es/admin/posts", "/es/admin/posts/nuevo"]) {
    test(`redirects unauthenticated users from ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      await expect(page).toHaveURL(/\/es\/login$/);
      await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
    });
  }
});
