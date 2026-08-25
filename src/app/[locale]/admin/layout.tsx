import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminHeader } from "@/components/admin/admin-header";
import { getPublicSectionVisibility } from "@/lib/site-sections";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect({ href: "/login", locale });
  const t = await getTranslations("Admin");
  const sections = await getPublicSectionVisibility();

  return (
    <div className="admin-shell">
      <div className="container admin-container">
        <AdminHeader title={t("writeAndPublish")} viewBlog={t("viewBlog")} backToDashboard={t("backToDashboard")} blogEnabled={sections.blog} />
        <AdminNav labels={{ navigation: t("navigation"), blog: t("blog"), publications: t("publications"), write: t("write") }} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
