import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const t = await getTranslations({ locale, namespace: "Process" });
  return buildMetadata({
    locale,
    path: "/process",
    title: `${t("eyebrow")} | ZIVELO`,
    description: t("heroLead"),
  });
}

export default async function Process({ params }: PageParams) {
  const { locale } = await resolveParams(params);
  const t = await getTranslations("Process");

  const steps = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    phase: t(`step${n}Phase`),
    title: t(`step${n}Title`),
    desc: t(`step${n}Desc`),
  }));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="page-hero__title">{t("heroTitle")}</h1>
          <p className="lead page-hero__lead">{t("heroLead")}</p>
        </div>
      </section>

      <section className="section--tight divider-top" style={{ paddingBlock: "clamp(56px,7vw,96px)" }}>
        <div className="container">
          <div className="vtl">
            {steps.map((step) => (
              <Reveal as="div" className="vtl__step" key={step.phase}>
                <div className="vtl__grid">
                  <div>
                    <div className="vtl__phase"><span>{step.phase}</span></div>
                    <h3 className="vtl__title">{step.title}</h3>
                  </div>
                  <div>
                    <p className="vtl__desc">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-band__inner">
          <Reveal>
            <h2 className="h2">{t("ctaTitle")}</h2>
            <p>{t("ctaBody")}</p>
          </Reveal>
          <Reveal delay={1} className="cta-band__actions">
            <Link className="btn btn--primary" href="/contact">
              {t("ctaTalk")} <span className="arrow">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
