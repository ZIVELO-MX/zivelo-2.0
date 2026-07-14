"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LocaleSwitch() {
  const locale = useLocale();
  // usePathname() returns the canonical route key (e.g. "/blog/[slug]"), and
  // useParams() gives the actual values to fill it in — needed since the
  // typed Link can't take a dynamic-segment pattern as a plain string href.
  const pathname = usePathname();
  const params = useParams<Record<string, string | string[]>>();
  const t = useTranslations("Nav");
  // The pathname/params pairing is only known at runtime here (this is a
  // generic component mounted on every route), so the two can't be
  // statically narrowed to next-intl's per-pattern discriminated union —
  // the values themselves are always correctly paired since both come from
  // the current route.
  const href = { pathname, params } as Parameters<typeof Link>[0]["href"];

  return (
    <div className="lang-toggle" role="group" aria-label={t("language")}>
      <Link href={href} locale="es" className={locale === "es" ? "is-active" : ""} aria-current={locale === "es" ? "true" : undefined}>
        ES
      </Link>
      <Link href={href} locale="en" className={locale === "en" ? "is-active" : ""} aria-current={locale === "en" ? "true" : undefined}>
        EN
      </Link>
    </div>
  );
}
