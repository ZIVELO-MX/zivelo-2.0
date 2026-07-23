import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  // Localized, professional URL slugs per language — no shared Spanish-only
  // slugs under /en/*. Keys are the canonical path used in <Link href> and
  // in the app/[locale]/<key> folder structure; values are what's actually
  // shown in the browser per locale.
  pathnames: {
    "/": "/",
    "/about": { es: "/nosotros", en: "/about" },
    "/services": { es: "/servicios", en: "/services" },
    "/projects": { es: "/proyectos", en: "/projects" },
    "/process": { es: "/proceso", en: "/process" },
    "/technologies": { es: "/tecnologias", en: "/technologies" },
    "/contact": { es: "/contacto", en: "/contact" },
    "/privacy": { es: "/privacidad", en: "/privacy" },
    "/terms": { es: "/terminos", en: "/terms" },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/admin": "/admin",
    "/admin/dashboard": { es: "/admin/dashboard", en: "/admin/dashboard" },
    "/login": "/login",
  },
});
