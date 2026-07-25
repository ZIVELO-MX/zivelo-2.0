"use client";

import { signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const t = useTranslations("Admin");
  const { locale } = useParams<{ locale: string }>();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => signOut({ redirectTo: `/${locale}/login` })}
    >
      {t("logout")}
    </Button>
  );
}
