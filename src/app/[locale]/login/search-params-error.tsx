"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function SearchParamsError() {
  const t = useTranslations("Login");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;
  const messageKey = ["no_code", "auth_failed", "AccessDenied"].includes(error)
    ? error
    : "auth_failed";

  return (
    <p className="login-error show" role="alert" aria-live="assertive">
      {t(`errors.${messageKey}`)}
    </p>
  );
}
