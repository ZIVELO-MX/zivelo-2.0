import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = "https://www.zivelo.dev";
export const FAVICON_PATH = "/assets/logo-white-clean.svg";

/**
 * Resolves a canonical path (the key used in routing.pathnames and in
 * <Link href>, e.g. "/about") to the actual localized slug for a given
 * locale (e.g. "/nosotros" for es, "/about" for en).
 */
export function resolvePathname(
  canonicalPath: string,
  locale: string,
  params?: Record<string, string>
): string {
  if (canonicalPath === "") return ""; // home — no extra segment beyond the locale root
  const entry = routing.pathnames[canonicalPath as keyof typeof routing.pathnames];
  let resolved: string;
  if (!entry) resolved = canonicalPath;
  else if (typeof entry === "string") resolved = entry;
  else resolved = entry[locale as keyof typeof entry] ?? canonicalPath;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      resolved = resolved.replace(`[${key}]`, value);
    }
  }
  return resolved;
}

/**
 * Builds per-page Metadata with canonical + hreflang alternates and OG/Twitter
 * tags. `canonicalPath` is the locale-less key from routing.pathnames
 * (e.g. "/about", or "" for home) — NOT the localized slug.
 */
export function buildMetadata({
  locale,
  path: canonicalPath,
  params,
  title,
  description,
  noIndex,
}: {
  locale: string;
  path: string;
  params?: Record<string, string>;
  title: string;
  description: string;
  noIndex?: boolean;
}): Metadata {
  const localizedPath = resolvePathname(canonicalPath, locale, params);

  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${resolvePathname(canonicalPath, l, params)}`])
  );

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}${localizedPath}`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}${localizedPath}`,
      siteName: "ZIVELO",
      locale: locale === "en" ? "en_US" : "es_MX",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
