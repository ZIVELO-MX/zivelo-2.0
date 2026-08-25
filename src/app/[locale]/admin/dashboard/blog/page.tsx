import { auth } from "@/lib/auth";
import { getDashboardStats, listAllPosts } from "@/lib/admin-data";
import { Link, redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DashboardBlogPage() {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect({ href: "/login", locale });
  const t = await getTranslations("Admin");
  const [stats, posts] = await Promise.all([getDashboardStats(), listAllPosts()]);

  return (
    <div className="admin-page">
      <div className="admin-stats" aria-label={t("statistics")}>
        <StatCard label={t("posts")} value={stats.total} />
        <StatCard label={t("published")} value={stats.published} tone="success" />
        <StatCard label={t("drafts")} value={stats.drafts} tone="warning" />
      </div>
      <section className="admin-section" aria-labelledby="recent-posts">
        <div className="admin-section__head">
          <div>
            <span className="eyebrow eyebrow--plain">Archivo</span>
            <h2 className="h3 admin-section__title" id="recent-posts">{t("recentPosts")}</h2>
          </div>
        </div>
        <PostTable posts={posts} locale={locale} t={t} />
      </section>
    </div>
  );
}

function StatCard({ label, value, tone = "default" }: { label: string; value: number; tone?: string }) {
  return (
    <Card className={`admin-stat admin-stat--${tone}`}>
      <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
      <CardContent><strong>{value}</strong></CardContent>
    </Card>
  );
}

function PostTable({
  posts,
  locale,
  t,
}: {
  posts: Awaited<ReturnType<typeof listAllPosts>>;
  locale: string;
  t: (key: string) => string;
}) {
  if (!posts.length) return <div className="admin-empty"><strong>{t("emptyTitle")}</strong><p>{t("emptyBody")}</p></div>;
  return (
    <div className="admin-table-wrap">
      <Table className="admin-table">
        <TableCaption className="sr-only">{t("recentPosts")}</TableCaption>
        <TableHeader><TableRow><TableHead>{t("title")}</TableHead><TableHead>{t("status")}</TableHead><TableHead>{t("updated")}</TableHead><TableHead><span className="sr-only">{t("actions")}</span></TableHead></TableRow></TableHeader>
        <TableBody>{posts.map((post) => <TableRow key={post.id}>
          <TableCell><Link className="admin-post-title" href={{ pathname: "/admin/posts/[id]/edit", params: { id: post.id } }}>{post.title_es}</Link><small>{post.slug}</small></TableCell>
          <TableCell><Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status === "published" ? t("published") : t("draft")}</Badge></TableCell>
          <TableCell className="admin-meta">{new Date(post.updated_at).toLocaleDateString(locale)}</TableCell>
          <TableCell><Link className="admin-row-action" href={{ pathname: "/admin/posts/[id]/edit", params: { id: post.id } }}>{t("edit")}</Link></TableCell>
        </TableRow>)}</TableBody>
      </Table>
    </div>
  );
}
