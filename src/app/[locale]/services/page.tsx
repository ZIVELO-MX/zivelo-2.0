import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const t = await getTranslations({ locale, namespace: "Services" });
  return buildMetadata({
    locale,
    path: "/services",
    title: `${t("heroEyebrow")} | ZIVELO`,
    description: t("heroLead"),
  });
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M2.5 8.5l3.5 3.5 7.5-8" />
    </svg>
  );
}

const webTypeIncludeKeys = [
  ["webType1Inc1", "webType1Inc2", "webType1Inc3", "webType1Inc4"],
  ["webType2Inc1", "webType2Inc2", "webType2Inc3", "webType2Inc4"],
  ["webType3Inc1", "webType3Inc2", "webType3Inc3", "webType3Inc4"],
  ["webType4Inc1", "webType4Inc2", "webType4Inc3", "webType4Inc4"],
] as const;

const restaurantIncludeKeys = [
  "restaurantInc1",
  "restaurantInc2",
  "restaurantInc3",
  "restaurantInc4",
] as const;

const posIncludeKeys = ["posInc1", "posInc2", "posInc3", "posInc4"] as const;

export default async function Services({ params }: PageParams) {
  const { locale } = await resolveParams(params);
  const t = await getTranslations("Services");

  return (
    <>
      <section className="page-hero" data-screen-label="Services Hero">
        <div className="container">
          <span className="eyebrow">{t("heroEyebrow")}</span>
          <h1 className="page-hero__title">{t("heroTitle")}</h1>
          <p className="lead page-hero__lead">{t("heroLead")}</p>
        </div>
      </section>

      <section
        className="section--tight divider-top"
        id="web"
        style={{ paddingBlock: "clamp(56px,7vw,88px)" }}
        data-screen-label="Web Development"
      >
        <div className="container">
          <div className="sec-head">
            <Reveal>
              <h2 className="h2 sec-head__title">
                <span>{t("webTitle")}</span>
              </h2>
            </Reveal>
            <Reveal as="p" delay={1} className="sec-head__aside">
              {t("webAside")}
            </Reveal>
          </div>

          <Reveal className="webtypes">
            <div className="webrow">
              <div>
                <div className="webrow__head">
                  <span className="webrow__n">01</span>
                  <h3 className="webrow__title">{t("webType1Title")}</h3>
                </div>
                <p className="webrow__desc">{t("webType1Desc")}</p>
                <p className="webrow__ideal">
                  {t.rich("webType1Ideal", { b: (chunks) => <b>{chunks}</b> })}
                </p>
              </div>
              <div>
                <div className="webrow__inc-label">{t("canInclude")}</div>
                <ul className="webrow__inc">
                  {webTypeIncludeKeys[0].map((key) => (
                    <li key={key}>
                      <CheckIcon />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="webrow">
              <div>
                <div className="webrow__head">
                  <span className="webrow__n">02</span>
                  <h3 className="webrow__title">{t("webType2Title")}</h3>
                </div>
                <p className="webrow__desc">{t("webType2Desc")}</p>
                <p className="webrow__ideal">
                  {t.rich("webType2Ideal", { b: (chunks) => <b>{chunks}</b> })}
                </p>
              </div>
              <div>
                <div className="webrow__inc-label">{t("canInclude")}</div>
                <ul className="webrow__inc">
                  {webTypeIncludeKeys[1].map((key) => (
                    <li key={key}>
                      <CheckIcon />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="webrow">
              <div>
                <div className="webrow__head">
                  <span className="webrow__n">03</span>
                  <h3 className="webrow__title">{t("webType3Title")}</h3>
                </div>
                <p className="webrow__desc">{t("webType3Desc")}</p>
                <p className="webrow__ideal">
                  {t.rich("webType3Ideal", { b: (chunks) => <b>{chunks}</b> })}
                </p>
              </div>
              <div>
                <div className="webrow__inc-label">{t("canInclude")}</div>
                <ul className="webrow__inc">
                  {webTypeIncludeKeys[2].map((key) => (
                    <li key={key}>
                      <CheckIcon />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="webrow">
              <div>
                <div className="webrow__head">
                  <span className="webrow__n">04</span>
                  <h3 className="webrow__title">{t("webType4Title")}</h3>
                </div>
                <p className="webrow__desc">{t("webType4Desc")}</p>
                <p className="webrow__ideal">
                  {t.rich("webType4Ideal", { b: (chunks) => <b>{chunks}</b> })}
                </p>
              </div>
              <div>
                <div className="webrow__inc-label">{t("canInclude")}</div>
                <ul className="webrow__inc">
                  {webTypeIncludeKeys[3].map((key) => (
                    <li key={key}>
                      <CheckIcon />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal
            style={{
              marginTop: 40,
              padding: "28px 30px",
              border: "1px solid var(--line)",
              borderRadius: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3 className="h4">{t("webBannerTitle")}</h3>
              <p className="muted" style={{ marginTop: 6, fontSize: "0.96rem" }}>
                {t("webBannerBody")}
              </p>
            </div>
            <Link className="btn btn--primary" href="/contact" style={{ flexShrink: 0 }}>
              {t("webBannerCta")} <span className="arrow">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section bg-surface" id="restaurant" data-screen-label="Restaurant Solutions">
        <div className="container">
          <div className="svc-body">
            <Reveal delay={1} style={{ order: 2 }}>
              <span className="eyebrow">{t("whatsIncluded")}</span>
              <ul className="check-list" style={{ marginTop: 20 }}>
                {restaurantIncludeKeys.map((key) => (
                  <li key={key}>
                    <CheckIcon />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal>
              <h2 className="h2">
                <span>{t("restaurantTitle")}</span>
              </h2>
              <div className="overview__body" style={{ marginTop: 20 }}>
                <p>{t("restaurantBody")}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" id="pos" data-screen-label="Point of Sale">
        <div className="container">
          <div className="svc-body">
            <Reveal>
              <h2 className="h2">
                <span>{t("posTitle")}</span>
              </h2>
              <div className="overview__body" style={{ marginTop: 20 }}>
                <p>{t("posBody")}</p>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <span className="eyebrow">{t("whatsIncluded")}</span>
              <ul className="check-list" style={{ marginTop: 20 }}>
                {posIncludeKeys.map((key) => (
                  <li key={key}>
                    <CheckIcon />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
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
              {t("ctaTell")} <span className="arrow">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
