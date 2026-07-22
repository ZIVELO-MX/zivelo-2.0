"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function SearchParamsError() {
  const t = useTranslations("Login");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  return (
    <p className="text-sm text-red-600 bg-red-50 rounded p-3">
      {t(`errors.${error}`)}
    </p>
  );
}
