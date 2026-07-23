"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState, Suspense } from "react";
import { SearchParamsError } from "./search-params-error";

export default function LoginPage() {
  const t = useTranslations("Login");
  const params = useParams();
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    const locale = params.locale as string;
    await signIn("zoho", { redirectTo: `/${locale}/admin` });
  }

  return (
    <main className="login-shell">
      <div className="login-card">
        <div className="login-box" aria-labelledby="login-title">
          <span className="eyebrow" style={{ display: "flex", justifyContent: "center" }}>{t("eyebrow")}</span>
          <h1 id="login-title" style={{ marginTop: 16 }}>{t("title")}</h1>
          <p className="login-box__sub">{t("subtitle")}</p>
          <div className="login-demo" id="login-provider-note">{t("providerNote")}</div>
          <div className="login-form">
            <Suspense fallback={null}>
              <SearchParamsError />
            </Suspense>
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="btn btn--primary login-submit"
              aria-describedby="login-provider-note"
            >
              {loading ? t("signingIn") : t("signInWithZoho")} <span className="arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <a className="login-back" href={`/${params.locale}`}>← {t("backToSite")}</a>
      </div>
    </main>
  );
}
