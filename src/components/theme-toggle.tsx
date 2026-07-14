"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const KEY = "zivelo-theme";

export function ThemeToggle() {
  const t = useTranslations("Nav");
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Actively re-apply the stored theme on every mount, not just read it.
    // The layout's <html> deliberately has no literal data-theme prop (so
    // React never resets it on unrelated re-renders — see layout.tsx) — but
    // that means nothing re-applies the attribute after a client-side
    // remount either (e.g. switching locale remounts this whole tree,
    // since / and /en are effectively different static routes). The
    // beforeInteractive anti-flash script only runs once per real page
    // load, so this effect is what keeps the theme correct across those
    // in-app remounts too.
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {}
    const resolved = stored === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", resolved);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(resolved);
  }, []);

  function apply(next: "dark" | "light") {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    setThemeState(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={t("toggleTheme")}
      aria-pressed={theme === "dark"}
      onClick={() => apply(theme === "dark" ? "light" : "dark")}
    >
      <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
      </svg>
      <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.6M12 18.9v2.6M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
      </svg>
    </button>
  );
}
