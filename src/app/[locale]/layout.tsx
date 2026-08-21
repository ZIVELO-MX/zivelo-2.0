import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { IBM_Plex_Sans, IBM_Plex_Mono, Inter } from "next/font/google";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { SkipLink } from "@/components/skip-link";
import { FAVICON_PATH, SITE_URL } from "@/lib/seo";
import { CONTACT } from "@/lib/site-constants";
import "./globals.css";

const displayFont = IBM_Plex_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ZIVELO | Soluciones de Software a Medida",
  description:
    "Desarrollamos tecnología que impulsa el crecimiento de negocios. Sitios web modernos, soluciones para restaurantes, puntos de venta y presencia digital.",
  icons: {
    icon: [{ url: FAVICON_PATH, type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ZIVELO",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo-white-full.svg`,
  email: CONTACT.email,
  telephone: CONTACT.phoneDisplay,
  sameAs: [
    "https://www.linkedin.com/company/zivelomx/",
    "https://x.com/zivelo",
    "https://instagram.com/zivelo",
    "https://www.tiktok.com/@zivelo",
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale === "en" ? "en" : "es-MX"}
      // No literal data-theme here on purpose: the anti-flash script below is
      // the sole owner of this attribute. If it were a hardcoded JSX prop,
      // React would reset it to that literal value on every re-render this
      // layout undergoes for reasons unrelated to theme (e.g. switching
      // locale re-renders the [locale] segment), stomping the user's choice.
      data-scroll-behavior="smooth"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init">
          {`(function(){try{var t=localStorage.getItem('zivelo-theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`}
        </Script>
        <script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <SkipLink />
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
