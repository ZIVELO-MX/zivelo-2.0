import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const user = session?.user;

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const t = await getTranslations("Admin");
  const email = user.email ?? "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
      <p className="text-zinc-600">{t("welcome", { email })}</p>
    </div>
  );
}
