import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  if (supabaseResponse.status === 302) {
    return supabaseResponse;
  }

  const response = intlMiddleware(request);

  const cacheHeaders = new Set(["cache-control", "expires", "pragma"]);
  for (const [key, value] of supabaseResponse.headers.entries()) {
    if (cacheHeaders.has(key.toLowerCase())) {
      response.headers.set(key, value);
    }
  }

  const cookieHeader = supabaseResponse.headers.get("set-cookie");
  if (cookieHeader) {
    response.headers.append("Set-Cookie", cookieHeader);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|_next/static|.*\\..*).*)"],
};
