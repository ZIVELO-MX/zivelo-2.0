"use client";

import { signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps = {}) {
  const t = useTranslations("Admin");
  const { locale } = useParams<{ locale: string }>();

  return (
    <button
      type="button"
      className={cn("btn btn--secondary", className)}
      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
    >
      {t("logout")}
    </button>
  );
}
