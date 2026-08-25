import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, resolvePathname } from "@/lib/seo";
import { getPublicSectionVisibility, type SectionKey } from "@/lib/site-sections";

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

const SECTION_BY_ROUTE: Partial<Record<string, SectionKey>> = {
  "/about": "about",
  "/services": "services",
  "/projects": "projects",
  "/process": "process",
  "/blog": "blog",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sections = await getPublicSectionVisibility();
  return CANONICAL_ROUTES.filter((canonicalPath) => {
    const section = SECTION_BY_ROUTE[canonicalPath];
    return !section || sections[section];
  }).flatMap((canonicalPath) =>
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
