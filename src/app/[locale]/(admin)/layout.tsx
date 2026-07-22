import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return redirect({ href: "/login", locale });

  const user = data.user;

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  const isAdmin = !!adminUser;

  return (
    <div className="flex min-h-dvh">
      <aside className="w-64 border-r bg-zinc-50 p-6 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-zinc-500">
          Admin
        </h2>
        {isAdmin && (
          <p className="text-xs text-green-600 font-medium">Administrador</p>
        )}
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
