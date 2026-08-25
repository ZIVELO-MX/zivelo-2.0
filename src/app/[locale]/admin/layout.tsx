import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect({ href: "/login", locale });
  const t = await getTranslations("Admin");

  return (
    <div className="admin-shell">
      <div className="container admin-container">
        <AdminHeader backToDashboard={t("backToDashboard")} />
        <AdminNav labels={{ navigation: t("navigation"), blog: t("blog"), publications: t("publications"), write: t("write") }} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
