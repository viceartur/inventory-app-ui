import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const { username = "", password = "" } = credentials;
        const appUsername = process.env.NEXT_PUBLIC_AUTH_USERNAME;
        const appPassword = process.env.NEXT_PUBLIC_AUTH_PASSWORD;

        if (username != appUsername || password != appPassword) {
          return null;
        }
        return { name: "user" };
      },
    }),
  ],
});
