import { auth } from "@/lib/auth";
import { getDashboardStats, listAllPosts } from "@/lib/admin-data";
import { Link, redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect({ href: "/login", locale });
  const user = session!.user!;
  const t = await getTranslations("Admin");
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "admin";
  const [stats, posts] = await Promise.all([getDashboardStats(), listAllPosts()]);

  return (
    <div className="admin-page">
      <div className="admin-welcome">
        <p>{t("welcome")} <strong className="admin-welcome__name">{displayName}</strong></p>
        <h2 className="h3">{t("dashboardSummary")}</h2>
      </div>
      <div className="admin-stats" aria-label={t("statistics")}>
        <StatCard label={t("posts")} value={stats.total} />
        <StatCard label={t("published")} value={stats.published} tone="success" />
        <StatCard label={t("drafts")} value={stats.drafts} tone="warning" />
      </div>
      <section className="admin-section" aria-labelledby="recent-posts">
        <div className="admin-section__head">
          <div>
            <span className="eyebrow eyebrow--plain">Archivo</span>
            <h2 className="h3" id="recent-posts" style={{ marginTop: 8 }}>{t("recentPosts")}</h2>
          </div>
          <Link href="/admin/posts/new" className="btn btn--primary btn--sm">{t("newPost")} <span aria-hidden="true">→</span></Link>
        </div>
        <PostTable posts={posts} locale={locale} t={t} />
      </section>
    </div>
  );
}

function StatCard({ label, value, tone = "default" }: { label: string; value: number; tone?: string }) {
  return <div className={`admin-stat admin-stat--${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function PostTable({ posts, locale, t }: { posts: Awaited<ReturnType<typeof listAllPosts>>; locale: string; t: (key: string) => string }) {
  if (!posts.length) return <div className="admin-empty"><strong>{t("emptyTitle")}</strong><p>{t("emptyBody")}</p></div>;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <caption className="sr-only">{t("recentPosts")}</caption>
        <thead><tr><th>{t("title")}</th><th>{t("status")}</th><th>{t("updated")}</th><th><span className="sr-only">{t("actions")}</span></th></tr></thead>
        <tbody>{posts.map((post) => <tr key={post.id}>
          <td><Link className="admin-post-title" href={{ pathname: "/admin/posts/[id]/edit", params: { id: post.id } }}>{post.title_es}</Link><small>{post.slug}</small></td>
          <td><span className={`admin-status admin-status--${post.status}`}>{post.status === "published" ? t("published") : t("draft")}</span></td>
          <td className="admin-meta">{new Date(post.updated_at).toLocaleDateString(locale)}</td>
          <td><Link className="admin-row-action" href={{ pathname: "/admin/posts/[id]/edit", params: { id: post.id } }}>{t("edit")}</Link></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}
