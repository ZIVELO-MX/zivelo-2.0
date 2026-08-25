"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/logo";

export function AdminHeader({ backToDashboard }: { backToDashboard: string }) {
  const pathname = usePathname();
  const isDashboard = /\/admin\/dashboard\/?$/.test(pathname);

  return (
    <header className="admin-bar admin-simple-header">
      {!isDashboard && <Link className="btn btn--secondary btn--sm" href="/admin/dashboard">← {backToDashboard}</Link>}
      <Link className="admin-brand" href="/admin/dashboard" aria-label="ZIVELO">
        <Logo />
      </Link>
    </header>
  );
}
