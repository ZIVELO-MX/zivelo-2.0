"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState, Suspense } from "react";
import { SearchParamsError } from "./search-params-error";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const t = useTranslations("Login");
  const params = useParams();
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const locale = params.locale as string;
    await signIn("zoho", { callbackUrl: `/${locale}/admin` });
  }

  return (
    <main className="login-shell">
      <div className="login-card">
        <Card className="login-box" aria-labelledby="login-title">
          <CardHeader>
            <span className="eyebrow" style={{ display: "flex", justifyContent: "center" }}>{t("eyebrow")}</span>
            <CardTitle><h1 id="login-title" style={{ marginTop: 16 }}>{t("title")}</h1></CardTitle>
            <CardDescription className="login-box__sub">{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="login-demo" id="login-provider-note">{t("providerNote")}</div>
          <div className="login-form">
            <Suspense fallback={null}>
              <SearchParamsError />
            </Suspense>
            <Button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="btn--primary login-submit"
              aria-describedby="login-provider-note"
            >
              {loading ? t("signingIn") : t("signInWithZoho")} <span className="arrow" aria-hidden="true">→</span>
            </Button>
          </div>
          </CardContent>
        </Card>
        <a className="login-back" href={`/${params.locale}`}>← {t("backToSite")}</a>
      </div>
    </main>
  );
}
