import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { API } from "utils/constants";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          const { username = "", password = "" } = credentials;
          if (!username || !password) return null;

          const res: any = await fetch(`${API}/users/auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });
          if (!res) return null;

          const data = await res.json();
          if (!data?.data) return null;

          const {
            data: { userId: id, username: name, role },
          } = data;
          return { id, name, role };
        } catch (error: any) {
          console.error(error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.userId as number;
      }
      return session;
    },
  },
});
