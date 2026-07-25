import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { Link, redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect({ href: "/login", locale });
  const t = await getTranslations("Admin");

  return (
    <div className="admin-shell">
      <div className="container admin-container">
        <header className="admin-bar">
          <div>
            <span className="eyebrow">Tu blog</span>
            <h1 className="h2 admin-bar__title">{t("writeAndPublish")}</h1>
          </div>
          <div className="admin-bar__actions">
            <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/blog" target="_blank">{t("viewBlog")} <span aria-hidden="true">↗</span></Link>
            <LogoutButton />
          </div>
        </header>
        <AdminNav labels={{ navigation: t("navigation"), dashboard: t("dashboard"), publications: t("publications"), write: t("write") }} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
