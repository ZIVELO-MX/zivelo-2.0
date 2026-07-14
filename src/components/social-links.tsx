const SOCIALS = [
  {
    href: "https://www.linkedin.com/company/zivelomx/",
    label: "LinkedIn",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.3c0-1.26-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21h-4z",
  },
  {
    href: "https://x.com/zivelo",
    label: "X",
    path: "M18.244 2H21.5l-7.1 8.11L22.5 22h-6.62l-5.18-6.77L4.77 22H1.5l7.59-8.67L1.5 2h6.79l4.68 6.19L18.244 2zm-1.16 18h1.83L7.02 3.9H5.06z",
  },
];

export function SocialLinks() {
  return (
    <div className="socials">
      {SOCIALS.map((s) => (
        <a key={s.label} href={s.href} target="_blank" rel="noopener" aria-label={s.label}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={s.path} />
          </svg>
        </a>
      ))}
      <a href="https://instagram.com/zivelo" target="_blank" rel="noopener" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a href="https://www.tiktok.com/@zivelo" target="_blank" rel="noopener" aria-label="TikTok">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.5 3c.3 2.1 1.5 3.7 3.5 4v2.6c-1.3 0-2.5-.35-3.5-.95V15a5.5 5.5 0 1 1-5.5-5.5c.32 0 .63.03.94.08v2.7a2.8 2.8 0 1 0 1.96 2.67V3z" />
        </svg>
      </a>
    </div>
  );
}
