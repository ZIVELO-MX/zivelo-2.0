import { setRequestLocale } from "next-intl/server";

/**
 * Shared prop shape for every [locale] page: `params` is always an async
 * object containing at least the locale segment, plus whatever dynamic
 * segments the route adds (e.g. `{ slug: string }` for blog posts).
 */
export type PageParams<T extends object = object> = {
  params: Promise<{ locale: string } & T>;
};

/**
 * Resolves the async route params and registers the locale with next-intl
 * (required for static rendering — see routing.ts). Every [locale] page
 * does exactly this pair of steps before reading any translation; this
 * collapses the repeated `const { locale } = await params; setRequestLocale(locale);`
 * pattern that showed up in generateMetadata and the page component of all
 * 9 marketing pages plus the blog routes.
 */
export async function resolveParams<T extends object = object>(
  params: Promise<{ locale: string } & T>
): Promise<{ locale: string } & T> {
  const resolved = await params;
  setRequestLocale(resolved.locale);
  return resolved;
}
