import { auth } from "@/lib/auth";
import { Link, redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button-variants";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect({ href: "/login", locale });
  const user = session!.user!;
  const t = await getTranslations("Admin");
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "admin";

  return (
    <div className="admin-page">
      <div className="admin-welcome">
        <p>{t("welcome")} <strong className="admin-welcome__name">{displayName}</strong></p>
        <h2 className="h3">{t("dashboardSummary")}</h2>
      </div>
      <section className="admin-section admin-overview-links" aria-labelledby="overview-links">
        <div className="admin-section__head">
          <div>
            <span className="eyebrow eyebrow--plain">Zivelo</span>
            <h2 className="h3 admin-section__title" id="overview-links">{t("overviewTitle")}</h2>
          </div>
        </div>
        <div className="admin-overview-links__grid">
          <Link className={`${buttonVariants({ variant: "outline" })} admin-overview-link`} href="/admin/dashboard/blog">{t("blog")} <span aria-hidden="true">→</span></Link>
          <Link className={`${buttonVariants({ variant: "outline" })} admin-overview-link`} href="/admin/dashboard/config">{t("configuration")} <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <div className="admin-dashboard-actions">
        <Link className={buttonVariants()} href="/">{t("back")}</Link>
        <LogoutButton className="admin-dashboard-logout" variant="outline" size="default" />
      </div>
    </div>
  );
}
