import { getServerSession, type NextAuthOptions } from "next-auth";
import Zoho from "next-auth/providers/zoho";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { authConfig } from "./config";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function isAdminUser(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    console.error({
      operation: "auth.admin_lookup",
      category: "database",
      providerCode: error.code || "UNKNOWN",
      providerMessage: error.message || "Unknown Supabase error",
    });
    return false;
  }

  return Boolean(data);
}

export const authOptions: NextAuthOptions = {
  ...authConfig,
  providers: [
    Zoho({
      clientId: process.env.ZOHO_CLIENT_ID!,
      clientSecret: process.env.ZOHO_CLIENT_SECRET!,
      issuer: "https://accounts.zoho.com",
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "zoho") return false;
      if (!user.email) return false;
      return isAdminUser(user.email);
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
