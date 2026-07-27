import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { buildMetadata } from "@/lib/seo";
import { PROJECT_LINKS, PROJECT_COVERS } from "@/lib/site-constants";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const t = await getTranslations({ locale, namespace: "Projects" });
  return buildMetadata({
    locale,
    path: "/projects",
    title: `${t("heroEyebrow")} | ZIVELO`,
    description: t("heroLead"),
  });
}

export default async function Projects({ params }: PageParams) {
  const { locale } = await resolveParams(params);
  const t = await getTranslations("Projects");

  return (
    <>
      <section className="page-hero" data-screen-label="Projects Hero">
        <div className="container">
          <span className="eyebrow">{t("heroEyebrow")}</span>
          <h1 className="page-hero__title">{t("heroTitle")}</h1>
          <p className="lead page-hero__lead">{t("heroLead")}</p>
        </div>
      </section>

      <section
        className="section--tight divider-top"
        style={{ paddingBlock: "clamp(40px,5vw,72px)" }}
        data-screen-label="Project List"
      >
        <div className="container">
          <Reveal className="proj" style={{ borderTop: "none", paddingTop: 0 }}>
            <div>
              <div className="proj__head">
                <span className="proj__tag">{t("projKodaTag")}</span>
                <span className="badge badge--live"><span className="dot" />Live</span>
              </div>
              <h2 className="proj__title" style={{ marginTop: 14 }}>
                <a href={PROJECT_LINKS.kodaFidelity} target="_blank" rel="noopener">Koda Fidelity</a>
              </h2>
              <p className="proj__desc">{t("projKodaDesc")}</p>
              <a className="proj__extlink" href={PROJECT_LINKS.kodaFidelity} target="_blank" rel="noopener">fidelity.zivelo.dev <span className="arrow">↗</span></a>
            </div>
            <div className="proj__media" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
              <Image src={PROJECT_COVERS.kodaFidelity} alt={t("projKodaImageAlt")} fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            </div>
          </Reveal>

          <Reveal className="proj">
            <div className="proj__media" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
              <Image src={PROJECT_COVERS.stickio} alt={t("projStickioImageAlt")} fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            </div>
            <div>
              <div className="proj__head">
                <span className="proj__tag">{t("projStickioTag")}</span>
                <span className="badge badge--live"><span className="dot" />Live</span>
              </div>
              <h2 className="proj__title" style={{ marginTop: 14 }}>
                <a href={PROJECT_LINKS.stickio} target="_blank" rel="noopener">Stickio</a>
              </h2>
              <p className="proj__desc">{t("projStickioDesc")}</p>
              <a className="proj__extlink" href={PROJECT_LINKS.stickio} target="_blank" rel="noopener">stickio.vercel.app <span className="arrow">↗</span></a>
            </div>
          </Reveal>

          <Reveal className="proj">
            <div>
              <div className="proj__head">
                <span className="proj__tag">{t("projQuotesTag")}</span>
                <span className="badge badge--live"><span className="dot" />Live</span>
              </div>
              <h2 className="proj__title" style={{ marginTop: 14 }}>
                <a href={PROJECT_LINKS.ziveloQuotes} target="_blank" rel="noopener">ZIVELO Quotes</a>
              </h2>
              <p className="proj__desc">{t("projQuotesDesc")}</p>
              <a className="proj__extlink" href={PROJECT_LINKS.ziveloQuotes} target="_blank" rel="noopener">quotes.zivelo.dev <span className="arrow">↗</span></a>
            </div>
            <div className="proj__media" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
              <Image src={PROJECT_COVERS.ziveloQuotes} alt={t("projQuotesImageAlt")} fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            </div>
          </Reveal>

          <Reveal className="proj">
            <div className="proj__media" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
              <Image src={PROJECT_COVERS.prompt2git} alt={t("projP2gImageAlt")} fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: "cover" }} />
            </div>
            <div>
              <div className="proj__head">
                <span className="proj__tag">{t("projP2gTag")}</span>
                <span className="badge badge--soon">{t("badgeSoon")}</span>
              </div>
              <h2 className="proj__title" style={{ marginTop: 14 }}>
                <a href={PROJECT_LINKS.prompt2git} target="_blank" rel="noopener">Prompt2Git</a>
              </h2>
              <p className="proj__desc">{t("projP2gDesc")}</p>
              <a className="proj__extlink" href={PROJECT_LINKS.prompt2git} target="_blank" rel="noopener">prompt2git.zivelo.dev <span className="arrow">↗</span></a>
            </div>
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
              {t("ctaAction")} <span className="arrow">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
