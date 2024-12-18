import { signOut } from "../auth";

export function SignOutButton() {
  return (
    <button
      onClick={async () => {
        "use server";
        await signOut();
      }}
    >
      Sign Out
    </button>
  );
}
