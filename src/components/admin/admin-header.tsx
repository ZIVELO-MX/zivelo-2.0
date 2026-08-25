"use client";

import { Link, usePathname } from "@/i18n/navigation";

export function AdminHeader({ title, viewBlog, backToDashboard, blogEnabled }: { title: string; viewBlog: string; backToDashboard: string; blogEnabled: boolean }) {
  const pathname = usePathname();
  const isStandaloneAdminPage = pathname.endsWith("/admin/dashboard") || pathname.endsWith("/admin/dashboard/config");
  const isBlogDashboard = pathname.endsWith("/admin/dashboard/blog");
  if (isStandaloneAdminPage) return null;

  return (
    <>
      {isBlogDashboard && <Link className="admin-back-link" href="/admin/dashboard">← {backToDashboard}</Link>}
      <header className="admin-bar">
        <div>
          <span className="eyebrow">ZIVELO</span>
          <h1 className="h2 admin-bar__title">{title}</h1>
        </div>
        <div className="admin-bar__actions">
          {blogEnabled && <Link className="btn btn--secondary btn--sm" href="/blog" target="_blank">{viewBlog} <span aria-hidden="true">↗</span></Link>}
        </div>
      </header>
    </>
  );
}
