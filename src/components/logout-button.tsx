"use client";

import { signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import type { VariantProps } from "class-variance-authority";

type LogoutButtonProps = {
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
};

export function LogoutButton({ className, variant = "outline", size = "sm" }: LogoutButtonProps = {}) {
  const t = useTranslations("Admin");
  const { locale } = useParams<{ locale: string }>();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
    >
      {t("logout")}
    </Button>
  );
}
