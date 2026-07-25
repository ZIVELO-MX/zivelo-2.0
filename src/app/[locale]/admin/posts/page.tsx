import { auth } from "@/lib/auth";
import { listAllPosts } from "@/lib/admin-data";
import { Link, redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function PostsPage() {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect({ href: "/login", locale });
  const [posts, t] = await Promise.all([listAllPosts(), getTranslations("Admin")]);
  return (
    <div className="admin-page">
      <div className="admin-section__head">
        <div><span className="eyebrow eyebrow--plain">Archivo</span><h2 className="h3 admin-section__title">{t("publications")}</h2></div>
        <Link className={buttonVariants({ size: "sm" })} href="/admin/posts/new">{t("newPost")}</Link>
      </div>
      <div className="admin-list">
        {posts.length ? posts.map((post) => (
          <Card className="admin-list__row" key={post.id}>
            <CardContent>
              <Badge variant="outline">{post.tag_es}</Badge>
              <Link href={{ pathname: "/admin/posts/[id]/edit", params: { id: post.id } }} className="admin-post-title">{post.title_es}</Link>
              <p className="admin-meta">{new Date(post.updated_at).toLocaleDateString(locale)} · {post.slug}</p>
            </CardContent>
            <div className="admin-list__actions"><Link href={{ pathname: "/admin/posts/[id]/edit", params: { id: post.id } }} className="admin-row-action">{t("edit")}</Link></div>
          </Card>
        )) : <div className="admin-empty"><strong>{t("emptyTitle")}</strong><p>{t("emptyBody")}</p></div>}
      </div>
    </div>
  );
}
