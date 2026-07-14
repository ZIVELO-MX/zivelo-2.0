import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

export const alt = "ZIVELO";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COPY = {
  es: {
    tagline: "Estudio de Ingeniería de Software · México",
    heroTitle: "Más ventas, mejores soluciones.",
  },
  en: {
    tagline: "Software Engineering Studio · Mexico",
    heroTitle: "More sales, better solutions.",
  },
} as const;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
  const { tagline, heroTitle } = COPY[locale as keyof typeof COPY];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#1c1a16",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 14, height: 14, background: "#e5342f" }} />
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 4,
              color: "#f4f0e8",
              textTransform: "uppercase",
            }}
          >
            ZIVELO
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 920 }}>
          <span
            style={{
              fontSize: 64,
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#f4f0e8",
            }}
          >
            {heroTitle}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 4, background: "#e5342f" }} />
            <span style={{ fontSize: 26, color: "#c7c1b6" }}>{tagline}</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
