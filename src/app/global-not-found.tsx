import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans, Inter } from "next/font/google";
import "./[locale]/globals.css";

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

export const metadata: Metadata = {
  title: "Página no encontrada | ZIVELO",
  description: "El enlace puede estar roto o la página se movió.",
};

export default function GlobalNotFound() {
  return (
    <html lang="es-MX" data-theme="dark" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">404</span>
            <h1 className="page-hero__title">Esta página no existe.</h1>
            <p className="lead page-hero__lead">
              El enlace puede estar roto o la página se movió. Revisa la dirección o vuelve al inicio.
            </p>
            <div style={{ marginTop: 32 }}>
              <Link className="btn btn--primary" href="/">
                Volver al inicio <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>
      </body>
    </html>
  );
}
