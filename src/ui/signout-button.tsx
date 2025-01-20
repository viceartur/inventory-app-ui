import { signOutFn } from "actions/authorization";

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOutFn();
  };
  return (
    <button className="sign-out" onClick={handleSignOut}>
      Sign Out
    </button>
  );
}
