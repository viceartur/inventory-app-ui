"use client";

import { useSession } from "next-auth/react";

export default function Unauthorized() {
  const { data: session } = useSession();
  return (
    <section>
      <h2>Access Denied</h2>
      <p>You do not have permission to access this page.</p>
      <p>Your current authorization level is {session?.user?.role}.</p>
    </section>
  );
}
