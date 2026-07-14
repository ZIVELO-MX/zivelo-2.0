import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const t = await getTranslations({ locale, namespace: "About" });
  return buildMetadata({
    locale,
    path: "/about",
    title: `${t("eyebrow")} | ZIVELO`,
    description: t("heroLead"),
  });
}

export default async function About({ params }: PageParams) {
  const { locale } = await resolveParams(params);
  const t = await getTranslations("About");

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
          <div className="overview__grid">
            <Reveal>
              <p className="overview__statement">
                {t.rich("whoStatement", { em: (chunks) => <em>{chunks}</em> })}
              </p>
            </Reveal>
            <Reveal delay={1}>
              <div className="overview__body">
                <p>{t("whoBody")}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container">
          <div className="svc-body">
            <Reveal>
              <span className="eyebrow">{t("missionEyebrow")}</span>
              <p className="overview__statement" style={{ marginTop: 18, fontSize: "clamp(1.3rem,1.9vw,1.7rem)" }}>
                {t("missionText")}
              </p>
            </Reveal>
            <Reveal delay={1}>
              <span className="eyebrow">{t("visionEyebrow")}</span>
              <p className="overview__statement" style={{ marginTop: 18, fontSize: "clamp(1.3rem,1.9vw,1.7rem)" }}>
                {t("visionText")}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sec-head">
            <Reveal>
              <h2 className="h2 sec-head__title">{t("valuesTitle")}</h2>
            </Reveal>
            <Reveal as="p" delay={1} className="sec-head__aside">
              {t("valuesAside")}
            </Reveal>
          </div>
          <Reveal className="values__grid">
            <div className="value">
              <div className="value__n">01</div>
              <h3 className="value__title">{t("value1Title")}</h3>
              <p className="value__desc">{t("value1Desc")}</p>
            </div>
            <div className="value">
              <div className="value__n">02</div>
              <h3 className="value__title">{t("value2Title")}</h3>
              <p className="value__desc">{t("value2Desc")}</p>
            </div>
            <div className="value">
              <div className="value__n">03</div>
              <h3 className="value__title">{t("value3Title")}</h3>
              <p className="value__desc">{t("value3Desc")}</p>
            </div>
            <div className="value">
              <div className="value__n">04</div>
              <h3 className="value__title">{t("value4Title")}</h3>
              <p className="value__desc">{t("value4Desc")}</p>
            </div>
            <div className="value">
              <div className="value__n">05</div>
              <h3 className="value__title">{t("value5Title")}</h3>
              <p className="value__desc">{t("value5Desc")}</p>
            </div>
            <div className="value">
              <div className="value__n">06</div>
              <h3 className="value__title">{t("value6Title")}</h3>
              <p className="value__desc">{t("value6Desc")}</p>
            </div>
            <div className="value value--wide">
              <div>
                <div className="value__n">07</div>
                <h3 className="value__title">{t("value7Title")}</h3>
              </div>
              <p className="value__desc">{t("value7Desc")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container" style={{ maxWidth: 960 }}>
          <Reveal className="manifesto">
            <p>{t("manifestoQuote")}</p>
            <cite style={{ display: "block", marginTop: 16, fontStyle: "normal", fontSize: "0.9rem", color: "var(--ink-3)", fontFamily: "var(--font-body)" }}>
              ZIVELO
            </cite>
          </Reveal>
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
            <Link className="btn btn--on-dark-ghost" href="/projects">
              {t("ctaProjects")}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
