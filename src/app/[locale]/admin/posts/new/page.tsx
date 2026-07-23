import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { PostForm } from "@/components/admin/post-form";

export default async function NewPostPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  return (
    <div className="admin-page">
      <div><span className="eyebrow eyebrow--plain">Editor</span><h2 className="h3" style={{ marginTop: 8 }}>Nuevo post</h2></div>
      <PostForm />
    </div>
  );
}
