"use client";

import { MenuIcon } from "lucide-react";
import { usePathname, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type AdminNavProps = {
  labels: { navigation: string; dashboard: string; publications: string; write: string };
};

const links = [
  { key: "dashboard", href: "/admin/dashboard" as const },
  { key: "publications", href: "/admin/posts" as const },
  { key: "write", href: "/admin/posts/new" as const },
];

export function AdminNav({ labels }: AdminNavProps) {
  const pathname = usePathname();
  const labelFor = (key: string) => labels[key as keyof typeof labels];
  const active = (href: string) => pathname === href || (href === "/admin/posts" && pathname.startsWith("/admin/posts/"));

  return (
    <>
      <nav className="admin-tabs" aria-label={labels.navigation}>
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={`admin-tab${active(link.href) ? " admin-tab--active" : ""}`}
            aria-current={active(link.href) ? "page" : undefined}
          >
            {labelFor(link.key)}
          </Link>
        ))}
      </nav>
      <div className="admin-mobile-menu">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="sm" />}>
            <MenuIcon aria-hidden="true" />
            <span>{labels.navigation}</span>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader><SheetTitle>{labels.navigation}</SheetTitle></SheetHeader>
            <nav className="admin-mobile-links" aria-label={labels.navigation}>
              {links.map((link) => (
                <SheetClose key={link.key} render={<Link href={link.href} aria-current={active(link.href) ? "page" : undefined} className={active(link.href) ? "is-active" : undefined} />}>
                  {labelFor(link.key)}
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
