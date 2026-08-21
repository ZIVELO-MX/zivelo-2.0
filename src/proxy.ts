import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/^\/(es|en)/, "");
  const locale = request.nextUrl.pathname.match(/^\/(es|en)/)?.[1] ?? "es";
  const url = request.nextUrl.clone();

  if (path.startsWith("/admin")) {
    const sessionToken = request.cookies.get("next-auth.session-token")?.value
      ?? request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|_next/static|.*\\..*).*)"],
};
