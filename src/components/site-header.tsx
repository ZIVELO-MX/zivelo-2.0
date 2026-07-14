import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/site-constants";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitch } from "./locale-switch";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/services", key: "services" as const },
  { href: "/projects", key: "projects" as const },
  { href: "/process", key: "process" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/contact", key: "contact" as const },
] as const;

export function SiteHeader() {
  const t = useTranslations("Nav");
  const topbar = useTranslations("Topbar");

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
            {NAV_LINKS.map((l) => (
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
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  );
}
