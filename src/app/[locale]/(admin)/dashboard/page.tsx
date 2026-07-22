import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.getUser();
  const user = auth.user;

  if (error || !user) {
    return redirect({ href: "/login", locale });
  }

  const email = user.email ?? "";

  const { count: posts } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  const t = await getTranslations("Admin");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
      <p className="text-zinc-600">
        {t("welcome", { email })}
      </p>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t("posts")} value={posts ?? 0} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border p-4 bg-white">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}
