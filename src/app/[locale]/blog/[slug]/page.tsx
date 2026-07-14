import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageParams, resolveParams } from "@/lib/params";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { buildMetadata } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import { getPost, listPosts, listSlugs } from "@/lib/blog-data";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    listSlugs().map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: PageParams<{ slug: string }>): Promise<Metadata> {
  const { locale, slug } = await resolveParams(params);
  const post = getPost(slug);
  if (!post) return {};
  const key = locale === "en" ? "en" : "es";
  return buildMetadata({
    locale,
    path: "/blog/[slug]",
    params: { slug },
    title: `${post.title[key]} | ZIVELO`,
    description: post.summary[key],
  });
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

export default async function BlogPostPage({
  params,
}: PageParams<{ slug: string }>) {
  const { locale, slug } = await resolveParams(params);
  const t = await getTranslations("Blog");
  const post = getPost(slug);
  if (!post) notFound();

  const key = locale === "en" ? "en" : "es";
  const initials = post.author
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const related = listPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <section className="section--tight" style={{ paddingBlock: "clamp(40px,5vw,64px)" }}>
      <div className="container">
        <article className="article">
          <Link href="/blog" className="article__back">
            ← {t("backToBlog")}
          </Link>

          <Reveal as="div" style={{ marginTop: 20 }}>
            <div className="article__head">
              <div className="article__meta-top">
                <span className="blog-tagchip">{post.tag[key]}</span>
                <span className="blog-row__date">
                  {formatDate(post.publishedAt, locale)} · {post.readMin} min
                </span>
              </div>
              <h1 className="article__title">{post.title[key]}</h1>
              <p className="article__sum">{post.summary[key]}</p>
              <div className="article__author">
                <span className="av">{initials}</span>
                <div>
                  <b>{post.author}</b>
                  <span>{t("productTeam")}</span>
                </div>
              </div>
            </div>

            <div className="prose" dangerouslySetInnerHTML={{ __html: post.contentHtml[key] }} />

            <div className="article__cta">
              <div>
                <h4>{t("ctaTitle")}</h4>
                <p>{t("ctaBody")}</p>
              </div>
              <Link className="btn btn--primary" href="/contact">
                {t("ctaAction")} <span className="arrow">→</span>
              </Link>
            </div>

            {related.length > 0 && (
              <div className="article__more">
                <div className="article__more-label">{t("keepReading")}</div>
                <div className="article__more-grid">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={{ pathname: "/blog/[slug]", params: { slug: r.slug } }}
                      className="article__more-card"
                    >
                      <span className="blog-tagchip">{r.tag[key]}</span>
                      <b>{r.title[key]}</b>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Reveal>
        </article>
      </div>
    </section>
  );
}
