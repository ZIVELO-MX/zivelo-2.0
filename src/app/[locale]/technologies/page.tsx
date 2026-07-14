import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const t = await getTranslations({ locale, namespace: "Technologies" });
  return buildMetadata({
    locale,
    path: "/technologies",
    title: `${t("eyebrow")} | ZIVELO`,
    description: t("heroLead"),
  });
}

export default async function Technologies({ params }: PageParams) {
  const { locale } = await resolveParams(params);
  const t = await getTranslations("Technologies");

  const categories = [
    {
      n: "01",
      title: t("cat1Title"),
      why: t("cat1Why"),
      items: [
        { name: "React", desc: t("cat1Item1Desc") },
        { name: "Next.js", desc: t("cat1Item2Desc") },
        { name: "TypeScript", desc: t("cat1Item3Desc") },
        { name: "Tailwind CSS", desc: t("cat1Item4Desc") },
      ],
    },
    {
      n: "02",
      title: t("cat2Title"),
      why: t("cat2Why"),
      items: [
        { name: "Node.js", desc: t("cat2Item1Desc") },
        { name: "Supabase", desc: t("cat2Item2Desc") },
        { name: "PostgreSQL", desc: t("cat2Item3Desc") },
        { name: "SQLite", desc: t("cat2Item4Desc") },
      ],
    },
    {
      n: "03",
      title: t("cat3Title"),
      why: t("cat3Why"),
      items: [
        { name: "Docker", desc: t("cat3Item1Desc") },
        { name: "Linux", desc: t("cat3Item2Desc") },
        { name: "Cloudflare", desc: t("cat3Item3Desc") },
        { name: "GitHub", desc: t("cat3Item4Desc") },
      ],
    },
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="page-hero__title">{t("heroTitle")}</h1>
          <p className="lead page-hero__lead">{t("heroLead")}</p>
        </div>
      </section>

      <section className="section--tight" style={{ paddingTop: 0, paddingBottom: "clamp(56px,7vw,96px)" }}>
        <div className="container">
          {categories.map((cat) => (
            <Reveal className="tech-cat" key={cat.n}>
              <div>
                <div className="tech-cat__n">{cat.n}</div>
                <h2 className="tech-cat__title">{cat.title}</h2>
                <p className="tech-cat__why">{cat.why}</p>
              </div>
              <div className="tech-list">
                {cat.items.map((item) => (
                  <div className="tech-item" key={item.name}>
                    <b>{item.name}</b>
                    <span>{item.desc}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
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
