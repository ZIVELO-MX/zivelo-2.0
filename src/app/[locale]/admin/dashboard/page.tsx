import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/admin-data";
import { Link, redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect({ href: "/login", locale });
  const user = session!.user!;
  const [t, stats] = await Promise.all([getTranslations("Admin"), getDashboardStats()]);
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "admin";

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
      <section className="admin-section admin-overview-links" aria-labelledby="overview-links">
        <div className="admin-section__head">
          <div>
            <span className="eyebrow eyebrow--plain">Zivelo</span>
            <h2 className="h3 admin-section__title" id="overview-links">{t("overviewTitle")}</h2>
          </div>
        </div>
        <div className="admin-overview-links__grid">
          <Link className={cn(buttonVariants({ variant: "outline" }), "admin-overview-link")} href="/admin/dashboard/blog">{t("blog")} <span aria-hidden="true">→</span></Link>
          <Link className={cn(buttonVariants({ variant: "outline" }), "admin-overview-link")} href="/admin/dashboard/config">{t("configuration")} <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <div className="admin-dashboard-actions">
        <Link className={buttonVariants()} href="/">{t("back")}</Link>
        <LogoutButton />
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "default" }: { label: string; value: number; tone?: string }) {
  return <Card className={`admin-stat admin-stat--${tone}`}><CardHeader><CardTitle>{label}</CardTitle></CardHeader><CardContent><strong>{value}</strong></CardContent></Card>;
}
