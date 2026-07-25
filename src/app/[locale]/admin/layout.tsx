import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { Link, redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const locale = await getLocale();
  if (!session?.user) redirect({ href: "/login", locale });
  const t = await getTranslations("Admin");

  return (
    <div className="admin-shell">
      <div className="container admin-container">
        <header className="admin-bar">
          <div>
            <span className="eyebrow">Tu blog</span>
            <h1 className="h2" style={{ marginTop: 10 }}>{t("writeAndPublish")}</h1>
          </div>
          <div className="admin-bar__actions">
            <Link className="btn btn--ghost btn--sm" href="/blog" target="_blank">{t("viewBlog")} <span aria-hidden="true">↗</span></Link>
            <LogoutButton />
          </div>
        </header>
        <nav className="admin-tabs" aria-label={t("navigation")}>
          <Link href="/admin/dashboard" className="admin-tab">{t("dashboard")}</Link>
          <Link href="/admin/posts" className="admin-tab">{t("publications")}</Link>
          <Link href="/admin/posts/new" className="admin-tab admin-tab--accent">{t("write")}</Link>
        </nav>
        <div className="admin-mobile-menu">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="sm" />}>
              <MenuIcon aria-hidden="true" />
              <span>{t("navigation")}</span>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{t("navigation")}</SheetTitle>
              </SheetHeader>
              <nav className="admin-mobile-links" aria-label={t("navigation")}>
                <SheetClose render={<Link href="/admin/dashboard" />}>{t("dashboard")}</SheetClose>
                <SheetClose render={<Link href="/admin/posts" />}>{t("publications")}</SheetClose>
                <SheetClose render={<Link href="/admin/posts/new" />}>{t("write")}</SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
