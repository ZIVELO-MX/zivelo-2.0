import type { BrowserContext, Page } from "@playwright/test";

export type CaptureTheme = "dark" | "light";
export type CaptureProfileName = "public" | "login" | "admin";
export type CaptureViewportName = "desktop" | "mobile";

export type CaptureTarget = {
  key: string;
  title: string;
  path: string;
};

export type CaptureProfile = {
  name: CaptureProfileName;
  version: 1;
  requiresAuth: boolean;
  themes: CaptureTheme[];
  viewports: CaptureViewportName[];
  targets: CaptureTarget[];
};

export const captureProfiles: Record<CaptureProfileName, CaptureProfile> = {
  public: {
    name: "public",
    version: 1,
    requiresAuth: false,
    themes: ["dark"],
    viewports: ["desktop"],
    targets: [
      { key: "home", title: "Página principal", path: "/es" },
      { key: "services", title: "Servicios", path: "/en/services" },
      { key: "projects", title: "Proyectos", path: "/en/projects" },
      { key: "about", title: "Sobre nosotros", path: "/en/about" },
      { key: "contact", title: "Contacto", path: "/en/contact" },
    ],
  },
  login: {
    name: "login",
    version: 1,
    requiresAuth: false,
    themes: ["dark", "light"],
    viewports: ["desktop", "mobile"],
    targets: [
      { key: "login-es", title: "Inicio de sesión (ES)", path: "/es/login" },
      { key: "login-en", title: "Login (EN)", path: "/en/login" },
    ],
  },
  admin: {
    name: "admin",
    version: 1,
    requiresAuth: true,
    themes: ["dark", "light"],
    viewports: ["desktop", "mobile"],
    targets: [
      { key: "admin-dashboard", title: "Dashboard administrativo", path: "/es/admin/dashboard" },
      { key: "admin-posts", title: "Publicaciones administrativas", path: "/es/admin/posts" },
      { key: "admin-new-post", title: "Nuevo post", path: "/es/admin/posts/nuevo" },
    ],
  },
};

export function getCaptureProfile(name: string): CaptureProfile {
  const profile = captureProfiles[name.trim().toLowerCase() as CaptureProfileName];
  if (!profile) throw new Error(`Unknown screenshot profile: ${name}`);
  return profile;
}

export function getViewport(name: CaptureViewportName) {
  return name === "mobile"
    ? { width: 390, height: 844 }
    : { width: 1440, height: 900 };
}

export async function preparePage(
  context: BrowserContext,
  page: Page,
  theme: CaptureTheme,
  path: string,
) {
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem("zivelo-theme", selectedTheme);
    document.documentElement.setAttribute("data-theme", selectedTheme);
  }, theme);
  const response = await page.goto(path, { waitUntil: "commit" });
  if (!response) throw new Error(`No HTTP response received for ${path}`);
  if (!response.ok()) throw new Error(`Capture target ${path} returned HTTP ${response.status()}`);
  await page.waitForLoadState("networkidle");
  await page.locator("body").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

export function captureKey(
  profile: CaptureProfileName,
  target: CaptureTarget,
  theme: CaptureTheme,
  viewport: CaptureViewportName,
) {
  return `${profile}-v1-${target.key}-${theme}-${viewport}`;
}
