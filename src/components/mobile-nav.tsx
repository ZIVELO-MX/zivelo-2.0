"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/site-constants";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitch } from "./locale-switch";
import { Logo } from "./logo";

type NavKey = "home" | "about" | "services" | "projects" | "process" | "blog" | "contact";

const LINKS = [
  { href: "/", key: "home" as NavKey, n: "01" },
  { href: "/about", key: "about" as NavKey, n: "02" },
  { href: "/services", key: "services" as NavKey, n: "03" },
  { href: "/projects", key: "projects" as NavKey, n: "04" },
  { href: "/process", key: "process" as NavKey, n: "05" },
  { href: "/blog", key: "blog" as NavKey, n: "06" },
  { href: "/contact", key: "contact" as NavKey, n: "07" },
] as const;

export function MobileNav() {
  const t = useTranslations("Nav");
  const drawerId = useId();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const drawer = drawerRef.current;
    const main = document.getElementById("main-content");
    if (!drawer) return;

    if (open) {
      drawer.showPopover?.();
      if (main) main.inert = true;
      sheetRef.current?.focus();
    } else {
      if (main) main.inert = false;
      drawer.hidePopover?.();
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className={`nav__toggle${open ? " is-open" : ""}`}
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div id={drawerId} ref={drawerRef} className="mobile-nav" popover="manual" aria-hidden={!open}>
        <div className="mobile-nav__head">
          <Link className="brand" href="/" aria-label="ZIVELO" onClick={() => setOpen(false)}>
            <Logo />
          </Link>
          <button type="button" className="mobile-nav__close" aria-label={t("closeMenu")} onClick={() => setOpen(false)}>
            &times;
          </button>
        </div>
        <nav className="mobile-nav__links" aria-label={t("openMenu")} ref={sheetRef as never} tabIndex={-1}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              <span>{t(l.key)}</span>
              <span>{l.n}</span>
            </Link>
          ))}
        </nav>
        <div className="mobile-nav__foot">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <ThemeToggle />
            <LocaleSwitch />
          </div>
          <Link className="btn btn--primary" href="/contact" onClick={() => setOpen(false)}>
            {t("getInTouch")}
          </Link>
          <span className="nav__phone">{CONTACT.email}</span>
        </div>
      </div>
    </>
  );
}
