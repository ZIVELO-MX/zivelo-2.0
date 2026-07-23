import { auth } from "@/lib/auth";
import { getPostById } from "@/lib/admin-data";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { PostForm } from "@/components/admin/post-form";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import type { PostInput } from "@/lib/actions/posts";

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  const { id } = await props.params;
  const post = await getPostById(id);

  if (!post) {
    redirect({ href: "/admin/dashboard", locale });
    return;
  }

  const initial: PostInput = {
    slug: post.slug,
    status: post.status as "draft" | "published",
    title_es: post.title_es,
    title_en: post.title_en,
    summary_es: post.summary_es,
    summary_en: post.summary_en,
    content_html_es: post.content_html_es,
    content_html_en: post.content_html_en,
    tag_es: post.tag_es,
    tag_en: post.tag_en,
    cover_url: post.cover_url,
    cover_alt_es: post.cover_alt_es,
    cover_alt_en: post.cover_alt_en,
    author: post.author,
    read_min: post.read_min,
    published_at: post.published_at,
  };

  return (
    <div className="admin-page">
      <div className="admin-section__head"><div><span className="eyebrow eyebrow--plain">Archivo</span><h2 className="h3" style={{ marginTop: 8 }}>Editar post</h2></div><DeletePostButton postId={id} /></div>
      <PostForm postId={id} initial={initial} />
    </div>
  );
}
