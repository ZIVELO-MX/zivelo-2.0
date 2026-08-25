import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/site-constants";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitch } from "./locale-switch";
import { MobileNav } from "./mobile-nav";
import { getPublicSectionVisibility } from "@/lib/site-sections";

const NAV_LINKS = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/services", key: "services" as const },
  { href: "/projects", key: "projects" as const },
  { href: "/process", key: "process" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/contact", key: "contact" as const },
] as const;

export async function SiteHeader() {
  const [t, topbar, sections] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Topbar"),
    getPublicSectionVisibility(),
  ]);
  const visibleLinks = NAV_LINKS.filter((link) => link.key === "home" || link.key === "contact" || sections[link.key as keyof typeof sections]);

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__meta">
            <span>{topbar("tagline")}</span>
          </div>
          <div className="topbar__meta">
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={`tel:${CONTACT.phoneTel}`}>{CONTACT.phoneDisplay}</a>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container nav">
          <Link className="brand" href="/" aria-label="ZIVELO">
            <span className="brand__logo-full">
              <Logo />
            </span>
            <span className="brand__logo-compact" aria-hidden="true">
              <Logo compact />
            </span>
          </Link>
          <nav className="nav__links" aria-label={t("home")}>
            {visibleLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                {t(l.key)}
              </Link>
            ))}
          </nav>
          <div className="nav__cta">
            <ThemeToggle />
            <LocaleSwitch />
            <Link className="btn btn--primary btn--sm" href="/contact">
              {t("getInTouch")}
            </Link>
            <MobileNav sections={sections} />
          </div>
        </div>
      </header>
    </>
  );
}
