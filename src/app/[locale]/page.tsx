import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { HeroLaptop } from "@/components/hero-laptop";
import { buildMetadata } from "@/lib/seo";
import { CONTACT, PROJECT_LINKS, PROJECT_COVERS } from "@/lib/site-constants";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const t = await getTranslations({ locale, namespace: "Home" });
  return buildMetadata({
    locale,
    path: "",
    title: t("metaTitle"),
    description: t("heroLead"),
  });
}

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <>
      <div className="hero-wrap" data-hero="a">
        <section className="hero-variant hero-variant--a heroA">
          <div className="container">
            <div className="heroA__grid">
              <div>
                <div className="hero-eyebrow-row">
                  <span className="eyebrow">{t("heroEyebrow")}</span>
                </div>
                <h1 className="display heroA__title">{t("heroTitle")}</h1>
                <p className="lead heroA__lead">{t("heroLead")}</p>
                <div className="heroA__actions">
                  <Link className="btn btn--primary" href="/projects">
                    {t("heroCtaProjects")} <span className="arrow">→</span>
                  </Link>
                  <Link className="btn btn--ghost" href="/contact">
                    {t("heroCtaContact")}
                  </Link>
                </div>
              </div>
              <div className="heroA__visual">
                <HeroLaptop />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="container hero-strip">
        <div className="hero-strip__grid">
          <div className="hero-strip__item"><div className="hero-strip__num"><span>4</span></div><div className="hero-strip__lbl">{t("statLive")}</div></div>
          <div className="hero-strip__item"><div className="hero-strip__num"><span>3</span></div><div className="hero-strip__lbl">{t("statLines")}</div></div>
          <div className="hero-strip__item"><div className="hero-strip__num"><span>2</span></div><div className="hero-strip__lbl">{t("statLangs")}</div></div>
          <div className="hero-strip__item"><div className="hero-strip__num"><span>1</span></div><div className="hero-strip__lbl">{t("statResponse")}</div></div>
        </div>
      </div>

      <section className="section bg-surface divider-top" id="services">
        <div className="container">
          <div className="sec-head">
            <Reveal>
              <h2 className="h2 sec-head__title">{t("servicesTitle")}</h2>
            </Reveal>
            <Reveal as="p" delay={1} className="sec-head__aside">
              {t("servicesAside")}
            </Reveal>
          </div>
          <Reveal className="services__grid">
            <article className="service service--featured">
              <div>
                <div className="service__n">1.1</div>
                <svg className="service__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="2.5" y="4" width="19" height="15" rx="1.5" /><path d="M2.5 8.5h19M6 6.3h.01M8.5 6.3h.01" /></svg>
                <h3 className="h3 service__title">{t("service1Title")}</h3>
              </div>
              <div>
                <p className="service__desc">{t("service1Desc")}</p>
                <div style={{ marginTop: 26 }}><Link className="tlink" href={{ pathname: "/services", hash: "web" }}>{t("learnMore")} <span className="arrow">→</span></Link></div>
              </div>
            </article>
            <article className="service">
              <div className="service__n">1.2</div>
              <svg className="service__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M6 3v7a3 3 0 0 0 6 0V3M9 3v18" /><path d="M17 3c-1.5 1-2 3-2 6 0 2 .5 3 2 3v9" /></svg>
              <h3 className="h3 service__title">{t("service2Title")}</h3>
              <p className="service__desc">{t("service2Desc")}</p>
              <div style={{ marginTop: 26 }}><Link className="tlink" href={{ pathname: "/services", hash: "restaurant" }}>{t("learnMore")} <span className="arrow">→</span></Link></div>
            </article>
            <article className="service">
              <div className="service__n">1.3</div>
              <svg className="service__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h4" /></svg>
              <h3 className="h3 service__title">{t("service3Title")}</h3>
              <p className="service__desc">{t("service3Desc")}</p>
              <div style={{ marginTop: 26 }}><Link className="tlink" href={{ pathname: "/services", hash: "pos" }}>{t("learnMore")} <span className="arrow">→</span></Link></div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="section" id="work">
        <div className="container">
          <div className="sec-head">
            <Reveal>
              <h2 className="h2 sec-head__title">{t("workTitle")}</h2>
            </Reveal>
            <Reveal as="p" delay={1} className="sec-head__aside">
              {t("workAside")}
            </Reveal>
          </div>

          <Reveal className="proj" style={{ borderTopColor: "var(--line-2)" }}>
            <div>
              <div className="proj__head"><span className="proj__tag">{t("projKodaTag")}</span><span className="badge badge--live"><span className="dot" />Live</span></div>
              <h3 className="proj__title" style={{ marginTop: 14 }}><a href={PROJECT_LINKS.kodaFidelity} target="_blank" rel="noopener">Koda Fidelity</a></h3>
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
              <div className="proj__head"><span className="proj__tag">{t("projStickioTag")}</span><span className="badge badge--live"><span className="dot" />Live</span></div>
              <h3 className="proj__title" style={{ marginTop: 14 }}><a href={PROJECT_LINKS.stickio} target="_blank" rel="noopener">Stickio</a></h3>
              <p className="proj__desc">{t("projStickioDesc")}</p>
              <a className="proj__extlink" href={PROJECT_LINKS.stickio} target="_blank" rel="noopener">stickio.vercel.app <span className="arrow">↗</span></a>
            </div>
          </Reveal>

          <Reveal className="proj">
            <div>
              <div className="proj__head"><span className="proj__tag">{t("projQuotesTag")}</span><span className="badge badge--live"><span className="dot" />Live</span></div>
              <h3 className="proj__title" style={{ marginTop: 14 }}><a href={PROJECT_LINKS.ziveloQuotes} target="_blank" rel="noopener">ZIVELO Quotes</a></h3>
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
              <div className="proj__head"><span className="proj__tag">{t("projP2gTag")}</span><span className="badge badge--soon">{t("badgeSoon")}</span></div>
              <h3 className="proj__title" style={{ marginTop: 14 }}><a href={PROJECT_LINKS.prompt2git} target="_blank" rel="noopener">Prompt2Git</a></h3>
              <p className="proj__desc">{t("projP2gDesc")}</p>
              <a className="proj__extlink" href={PROJECT_LINKS.prompt2git} target="_blank" rel="noopener">prompt2git.zivelo.dev <span className="arrow">↗</span></a>
            </div>
          </Reveal>

          <Reveal style={{ marginTop: 48 }}>
            <Link className="btn btn--ghost" href="/projects">{t("viewMoreProjects")} <span className="arrow">→</span></Link>
          </Reveal>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container">
          <div className="overview__grid">
            <Reveal>
              <p className="overview__statement">
                {t.rich("aboutStatement", { em: (chunks) => <em>{chunks}</em> })}
              </p>
            </Reveal>
            <Reveal delay={1}>
              <div className="overview__body">
                <p>{t("aboutBody")}</p>
              </div>
              <div style={{ marginTop: 32 }}><Link className="tlink" href="/about">{t("aboutCta")} <span className="arrow">→</span></Link></div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" id="process">
        <div className="container">
          <div className="sec-head">
            <Reveal>
              <h2 className="h2 sec-head__title">{t("processTitle")}</h2>
            </Reveal>
            <Reveal as="p" delay={1} className="sec-head__aside">
              {t("processAside")} <Link className="tlink" href="/process" style={{ fontSize: "inherit" }}>{t("processSeeAll")} <span className="arrow">→</span></Link>
            </Reveal>
          </div>
          <Reveal className="process__grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {[t("step1"), t("step2"), t("step3"), t("step4")].map((label, i) => (
              <div className="pstep" key={label}><div className="pstep__n">{String(i + 1).padStart(2, "0")}</div><h3 className="pstep__title">{label}</h3></div>
            ))}
            {[t("step5"), t("step6"), t("step7"), t("step8")].map((label, i) => (
              <div className="pstep" style={{ marginTop: 40 }} key={label}><div className="pstep__n">{String(i + 5).padStart(2, "0")}</div><h3 className="pstep__title">{label}</h3></div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section bg-surface divider-top" id="stack">
        <div className="container">
          <div className="sec-head">
            <Reveal>
              <h2 className="h2 sec-head__title">{t("stackTitle")}</h2>
            </Reveal>
            <Reveal as="p" delay={1} className="sec-head__aside">
              {t("stackAside")} <Link className="tlink" href="/technologies" style={{ fontSize: "inherit" }}>{t("stackSeeAll")} <span className="arrow">→</span></Link>
            </Reveal>
          </div>
          <Reveal className="stack-strip">
            {["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Supabase", "PostgreSQL", "SQLite", "Docker", "Linux", "Cloudflare", "GitHub"].map((chip) => (
              <span className="stack-chip" key={chip}>{chip}</span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section why">
        <div className="container">
          <div className="sec-head">
            <Reveal>
              <h2 className="h2 sec-head__title">{t("whyTitle")}</h2>
            </Reveal>
            <Reveal as="p" delay={1} className="sec-head__aside">
              {t("whyAside")}
            </Reveal>
          </div>
          <Reveal className="why__grid">
            <div className="why__item">
              <svg className="why__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 3l8 3.5v5c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5v-5L12 3z" /><path d="M9 12l2 2 4-4.5" /></svg>
              <h3 className="why__title">{t("why1Title")}</h3>
              <p className="why__desc">{t("why1Desc")}</p>
            </div>
            <div className="why__item">
              <svg className="why__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" /></svg>
              <h3 className="why__title">{t("why2Title")}</h3>
              <p className="why__desc">{t("why2Desc")}</p>
            </div>
            <div className="why__item">
              <svg className="why__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" /></svg>
              <h3 className="why__title">{t("why3Title")}</h3>
              <p className="why__desc">{t("why3Desc")}</p>
            </div>
            <div className="why__item">
              <svg className="why__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M17 20a5 5 0 0 0-10 0" /><circle cx="12" cy="9" r="4" /></svg>
              <h3 className="why__title">{t("why4Title")}</h3>
              <p className="why__desc">{t("why4Desc")}</p>
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
            <a className="btn btn--primary" href={CONTACT.whatsappUrl} target="_blank" rel="noopener">{t("ctaBook")} <span className="arrow">→</span></a>
            <Link className="btn btn--on-dark-ghost" href="/contact">{t("ctaTell")}</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
