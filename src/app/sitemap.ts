import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, resolvePathname } from "@/lib/seo";

const CANONICAL_ROUTES = [
  "",
  "/about",
  "/services",
  "/projects",
  "/process",
  "/technologies",
  "/contact",
  "/privacy",
  "/terms",
  "/blog",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return CANONICAL_ROUTES.flatMap((canonicalPath) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${resolvePathname(canonicalPath, locale)}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}/${l}${resolvePathname(canonicalPath, l)}`])
        ),
      },
    }))
  );
}
