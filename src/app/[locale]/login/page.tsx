"use client";

import { createClient } from "@/lib/supabase/client";
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
    const supabase = createClient();
    const locale = params.locale as string;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "custom:zoho",
      options: {
        redirectTo: `${window.location.origin}/${locale}/api/auth/callback?next=/${locale}/admin`,
      },
    });
    if (error) setLoading(false);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Suspense fallback={null}>
          <SearchParamsError />
        </Suspense>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full rounded bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {loading ? t("signingIn") : t("signInWithZoho")}
        </button>
      </div>
    </main>
  );
}
