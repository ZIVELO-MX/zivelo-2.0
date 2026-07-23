import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  const t = await getTranslations("Admin");

  return (
    <div className="flex min-h-dvh">
      <aside className="w-64 border-r bg-zinc-50 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-zinc-500">
            Admin
          </h2>
          <LogoutButton />
        </div>
        <nav className="flex flex-col gap-1">
          <Link
            href="/admin/dashboard"
            className="rounded px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
          >
            {t("dashboard")}
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
