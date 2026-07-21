import type { Page } from "@playwright/test";

export type CaptureTarget = {
  key: string;
  title: string;
  capture(page: Page): Promise<Buffer>;
};

async function waitForPageReady(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.locator("body").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

export const captureTargets: CaptureTarget[] = [
  {
    key: "home",
    title: "Página principal",
    async capture(page) {
      await page.goto("/es", { waitUntil: "commit" });
      await waitForPageReady(page);
      return page.screenshot({ type: "png", animations: "disabled", fullPage: true });
    },
  },
  {
    key: "services",
    title: "Servicios",
    async capture(page) {
      await page.goto("/es/services", { waitUntil: "commit" });
      await waitForPageReady(page);
      return page.screenshot({ type: "png", animations: "disabled", fullPage: true });
    },
  },
  {
    key: "projects",
    title: "Proyectos",
    async capture(page) {
      await page.goto("/es/projects", { waitUntil: "commit" });
      await waitForPageReady(page);
      return page.screenshot({ type: "png", animations: "disabled", fullPage: true });
    },
  },
  {
    key: "about",
    title: "Sobre nosotros",
    async capture(page) {
      await page.goto("/es/about", { waitUntil: "commit" });
      await waitForPageReady(page);
      return page.screenshot({ type: "png", animations: "disabled", fullPage: true });
    },
  },
  {
    key: "contact",
    title: "Contacto",
    async capture(page) {
      await page.goto("/es/contact", { waitUntil: "commit" });
      await waitForPageReady(page);
      return page.screenshot({ type: "png", animations: "disabled", fullPage: true });
    },
  },
];
