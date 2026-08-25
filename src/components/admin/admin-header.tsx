"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { LogoutButton } from "@/components/logout-button";
import { buttonVariants } from "@/components/ui/button-variants";

export function AdminHeader({ title, viewBlog, blogEnabled }: { title: string; viewBlog: string; blogEnabled: boolean }) {
  const pathname = usePathname();
  const isStandaloneAdminPage = pathname.endsWith("/admin/dashboard") || pathname.endsWith("/admin/dashboard/config");
  if (isStandaloneAdminPage) return null;

  return (
    <header className="admin-bar">
      <div>
        <span className="eyebrow">ZIVELO</span>
        <h1 className="h2 admin-bar__title">{title}</h1>
      </div>
      <div className="admin-bar__actions">
        {blogEnabled && <Link className={buttonVariants({ variant: "outline", size: "sm" })} href="/blog" target="_blank">{viewBlog} <span aria-hidden="true">↗</span></Link>}
        <LogoutButton />
      </div>
    </header>
  );
}
