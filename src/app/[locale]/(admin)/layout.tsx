import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

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

  return (
    <div className="flex min-h-dvh">
      <aside className="w-64 border-r bg-zinc-50 p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-zinc-500">
          Admin
        </h2>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
