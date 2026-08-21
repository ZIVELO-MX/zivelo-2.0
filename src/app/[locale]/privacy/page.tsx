import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return buildMetadata({
    locale,
    path: "/privacy",
    title: `${t("title")} | ZIVELO`,
    description: t("intro"),
  });
}

export default async function Privacidad() {
  const t = await getTranslations("Privacy");

  return (
    <>
      <section className="page-hero" data-screen-label="Legal Hero">
        <div className="container">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="page-hero__title" style={{ fontSize: "clamp(2rem,3.6vw,3rem)" }}>
            {t("title")}
          </h1>
          <p className="muted" style={{ marginTop: 18 }}>
            {t("lastUpdated")}
          </p>
        </div>
      </section>
      <section
        className="section--tight divider-top"
        style={{ paddingBlock: "clamp(48px,6vw,80px)" }}
        data-screen-label="Legal Body"
      >
        <div className="container cs-prose" style={{ maxWidth: 760 }}>
          <p>{t("intro")}</p>
          <h2>{t("collectTitle")}</h2>
          <p>{t("collectBody")}</p>
          <h2>{t("useTitle")}</h2>
          <p>{t("useBody")}</p>
          <h2>{t("rightsTitle")}</h2>
          <p>{t("rightsBody")}</p>
          <p className="muted" style={{ marginTop: 32, fontSize: "0.88rem" }}>
            {t("disclaimer")}
          </p>
        </div>
      </section>
    </>
  );
}
