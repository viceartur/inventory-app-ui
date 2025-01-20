"use server";

import { signOut } from "auth";

export const signOutFn = async () => {
  await signOut();
};
