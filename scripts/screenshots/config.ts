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

async function navigateToCaptureTarget(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "commit" });
  if (!response) {
    throw new Error(`No HTTP response received for ${path}`);
  }
  if (!response.ok()) {
    throw new Error(`Capture target ${path} returned HTTP ${response.status()}`);
  }
  await waitForPageReady(page);
}

export const captureTargets: CaptureTarget[] = [
  {
    key: "home",
    title: "Página principal",
    async capture(page) {
      await navigateToCaptureTarget(page, "/es");
      return page.screenshot({ type: "png", animations: "disabled", fullPage: true });
    },
  },
  {
    key: "services",
    title: "Servicios",
    async capture(page) {
      await navigateToCaptureTarget(page, "/en/services");
      return page.screenshot({ type: "png", animations: "disabled", fullPage: true });
    },
  },
  {
    key: "projects",
    title: "Proyectos",
    async capture(page) {
      await navigateToCaptureTarget(page, "/en/projects");
      return page.screenshot({ type: "png", animations: "disabled", fullPage: true });
    },
  },
  {
    key: "about",
    title: "Sobre nosotros",
    async capture(page) {
      await navigateToCaptureTarget(page, "/en/about");
      return page.screenshot({ type: "png", animations: "disabled", fullPage: true });
    },
  },
  {
    key: "contact",
    title: "Contacto",
    async capture(page) {
      await navigateToCaptureTarget(page, "/en/contact");
      return page.screenshot({ type: "png", animations: "disabled", fullPage: true });
    },
  },
];
