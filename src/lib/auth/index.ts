import NextAuth from "next-auth";
import Zoho from "next-auth/providers/zoho";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { authConfig } from "./config";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function isAdminUser(email: string): Promise<boolean> {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("email", email.toLowerCase().trim());

  return (count ?? 0) > 0;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
});
