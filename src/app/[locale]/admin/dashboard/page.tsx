import { auth } from "@/lib/auth";
import { getDashboardStats, listAllPosts } from "@/lib/admin-data";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const user = session?.user;

  if (!user) {
    redirect({ href: "/login", locale });
    return;
  }

  const t = await getTranslations("Admin");
  const email = user.email ?? "";
  const [stats, posts] = await Promise.all([
    getDashboardStats(),
    listAllPosts(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
        <p className="text-zinc-600">{t("welcome", { email })}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t("posts")} value={stats.total} />
        <StatCard
          label="Publicados"
          value={stats.published}
          className="border-green-200 bg-green-50"
        />
        <StatCard
          label="Borradores"
          value={stats.drafts}
          className="border-amber-200 bg-amber-50"
        />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">Posts recientes</h2>
        {posts.length === 0 ? (
          <div className="rounded border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            No hay posts aún.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500">
                <th className="pb-2 font-medium">Título</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium">Slug</th>
                <th className="pb-2 font-medium">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">
                    <span className="font-medium">{post.title_es}</span>
                    {post.title_en && (
                      <span className="ml-2 text-xs text-zinc-400">
                        / {post.title_en}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {post.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-zinc-500">{post.slug}</td>
                  <td className="py-2 text-zinc-500">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded border p-4 bg-white ${className ?? ""}`}
    >
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}
