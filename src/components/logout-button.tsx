"use client";

import { signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string } = {}) {
  const t = useTranslations("Admin");
  const { locale } = useParams<{ locale: string }>();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
    >
      {t("logout")}
    </Button>
  );
}
