import { expect, test } from "@playwright/test";

test.describe("interactive laptop hero", () => {
  test("loads one desktop canvas and keeps the lid control in sync", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/es", { waitUntil: "domcontentloaded" });

    const laptop = page.getByTestId("hero-laptop");
    const canvas = laptop.locator("canvas");
    const toggle = page.getByRole("button", { name: "Abrir / cerrar tapa" });

    await expect(canvas).toHaveCount(1, { timeout: 15_000 });
    await expect(toggle).toBeEnabled();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await page.goto("/es/about", { waitUntil: "domcontentloaded" });
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(laptop.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
  });

  test("serves the static fallback without loading Three.js on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/es", { waitUntil: "domcontentloaded" });

    const laptop = page.getByTestId("hero-laptop");
    await expect(laptop.getByTestId("hero-laptop-fallback")).toBeVisible();
    await expect(laptop.locator("canvas")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Abrir / cerrar tapa" })).toHaveCount(0);
  });
});
