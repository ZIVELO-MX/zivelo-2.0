import { auth } from "@/lib/auth";
import { Link, redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionSettingsForm } from "@/components/admin/section-settings-form";
import { getAdminSectionVisibility, type SectionKey } from "@/lib/site-sections";

export default async function DashboardConfigPage() {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect({ href: "/login", locale });

  const [sections, t] = await Promise.all([
    getAdminSectionVisibility(),
    getTranslations("Admin"),
  ]);
  const sectionKeys: SectionKey[] = ["about", "services", "projects", "process", "blog"];

  return (
    <div className="admin-settings-layout">
      <aside className="admin-settings-sidebar">
        <nav aria-label={t("configurationNavigation")}>
          <a href="#sections" aria-current="page">{t("sections")}</a>
        </nav>
      </aside>
      <section className="admin-settings-content" id="sections" aria-labelledby="sections-title">
        <Link className="admin-back-link" href="/admin/dashboard">← {t("back")}</Link>
        <div className="admin-section__head">
          <div>
            <span className="eyebrow eyebrow--plain">{t("configuration")}</span>
            <h2 className="h3 admin-section__title" id="sections-title">{t("sections")}</h2>
          </div>
        </div>
        <SectionSettingsForm
          initialSections={sections}
          labels={Object.fromEntries(sectionKeys.map((key) => [key, {
            title: t(`sectionLabels.${key}`),
            description: t(`sectionDescriptions.${key}`),
          }])) as Record<SectionKey, { title: string; description: string }>}
          copy={{
            title: t("sectionSettingsTitle"),
            description: t("sectionSettingsDescription"),
            save: t("save"),
            saving: t("saving"),
            cancel: t("cancel"),
            saved: t("saved"),
          }}
        />
      </section>
    </div>
  );
}
