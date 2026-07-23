import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    return redirect({ href: "/login", locale });
  }

  const email = session.user.email ?? "";

  const t = await getTranslations("Admin");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
      <p className="text-zinc-600">
        {t("welcome", { email })}
      </p>
    </div>
  );
}
