import type { NextAuthOptions } from "next-auth";

export const authConfig: NextAuthOptions = {
  providers: [],
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};
