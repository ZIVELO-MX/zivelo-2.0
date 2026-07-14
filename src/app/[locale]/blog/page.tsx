import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { buildMetadata } from "@/lib/seo";
import { listPosts, listTags } from "@/lib/blog-data";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await resolveParams(params);
  const t = await getTranslations({ locale, namespace: "Blog" });
  return buildMetadata({
    locale,
    path: "/blog",
    title: `${t("eyebrow")} | ZIVELO`,
    description: t("heroLead"),
  });
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

export default async function BlogIndex({
  params,
  searchParams,
}: PageParams & { searchParams: Promise<{ tag?: string }> }) {
  const { locale } = await resolveParams(params);
  const t = await getTranslations("Blog");
  const { tag } = await searchParams;
  const activeTag = tag || "*";

  const key = locale === "en" ? "en" : "es";
  const tags = listTags(locale);
  const posts = listPosts(activeTag).map((p) => ({
    slug: p.slug,
    title: p.title[key],
    summary: p.summary[key],
    tag: p.tag[key],
    readMin: p.readMin,
    publishedAt: p.publishedAt,
  }));

  const showFeatured = activeTag === "*" && posts.length > 1;
  const featured = showFeatured ? posts[0] : null;
  const rest = showFeatured ? posts.slice(1) : posts;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="page-hero__title">{t("heroTitle")}</h1>
          <p className="lead page-hero__lead">{t("heroLead")}</p>
          <div className="blog-filter">
            <Link href={{ pathname: "/blog" }} className={activeTag === "*" ? "is-active" : ""}>
              {t("allTag")}
            </Link>
            {tags.map((tg) => (
              <Link
                key={tg}
                href={{ pathname: "/blog", query: { tag: tg } }}
                className={activeTag === tg ? "is-active" : ""}
              >
                {tg}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section--tight divider-top" style={{ paddingBlock: "clamp(40px,5vw,72px)" }}>
        <div className="container" style={{ maxWidth: 900 }}>
          {posts.length === 0 ? (
            <p className="muted" style={{ padding: "40px 0", textAlign: "center" }}>
              {t("noPosts")}
            </p>
          ) : (
            <>
              <div className="blog-count">
                {posts.length} {posts.length === 1 ? t("postCountOne") : t("postCountOther")}
              </div>

              {featured && (
                <Reveal as="div">
                  <Link href={{ pathname: "/blog/[slug]", params: { slug: featured.slug } }} className="blog-featured">
                    <div>
                      <div className="blog-featured__flag">{t("latestFlag")}</div>
                      <h2 className="blog-featured__title">{featured.title}</h2>
                      <div className="blog-featured__sum">{featured.summary}</div>
                      <div className="blog-featured__meta">
                        <span className="blog-tagchip">{featured.tag}</span>
                        <span className="blog-dot" />
                        <span className="blog-row__read">{featured.readMin} min</span>
                        <span className="blog-dot" />
                        <span className="blog-row__date">{formatDate(featured.publishedAt, locale)}</span>
                      </div>
                    </div>
                    <span className="blog-featured__cta">
                      {t("readMore")} <span className="arrow">→</span>
                    </span>
                  </Link>
                </Reveal>
              )}

              <div className="blog-list">
                {rest.map((p) => (
                  <Reveal as="div" key={p.slug}>
                    <Link href={{ pathname: "/blog/[slug]", params: { slug: p.slug } }} className="blog-row">
                      <div className="blog-row__main">
                        <h2 className="blog-row__title">{p.title}</h2>
                        <div className="blog-row__sum">{p.summary}</div>
                      </div>
                      <div className="blog-row__meta">
                        <span className="blog-tagchip">{p.tag}</span>
                        <span className="blog-row__read">{p.readMin} min</span>
                        <span className="blog-row__date">{formatDate(p.publishedAt, locale)}</span>
                        <span className="blog-row__arrow">→</span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </>
          )}
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
