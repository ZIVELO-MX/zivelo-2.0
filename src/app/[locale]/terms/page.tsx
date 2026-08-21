import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const t = await getTranslations({ locale, namespace: "Terms" });
  return buildMetadata({
    locale,
    path: "/terms",
    title: `${t("title")} | ZIVELO`,
    description: t("intro"),
  });
}

export default async function Terminos() {
  const t = await getTranslations("Terms");

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
          <h2>{t("scopeTitle")}</h2>
          <p>{t("scopeBody")}</p>
          <h2>{t("ownershipTitle")}</h2>
          <p>{t("ownershipBody")}</p>
          <h2>{t("supportTitle")}</h2>
          <p>{t("supportBody")}</p>
          <p className="muted" style={{ marginTop: 32, fontSize: "0.88rem" }}>
            {t("disclaimer")}
          </p>
        </div>
      </section>
    </>
  );
}
