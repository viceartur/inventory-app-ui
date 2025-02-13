import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
  }

  interface Session {
    user: {
      id: number;
      role: string;
    } & DefaultSession["user"];
  }
}
