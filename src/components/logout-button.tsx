"use client";

import { signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations("Admin");
  const { locale } = useParams<{ locale: string }>();

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectTo: `/${locale}/login` })}
      className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
    >
      {t("logout")}
    </button>
  );
}
