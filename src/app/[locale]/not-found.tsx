import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <section className="page-hero">
      <div className="container">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1 className="page-hero__title">{t("title")}</h1>
        <p className="lead page-hero__lead">{t("body")}</p>
        <div style={{ marginTop: 32 }}>
          <Link className="btn btn--primary" href="/">
            {t("cta")} <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
