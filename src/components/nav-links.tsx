"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSocket } from "context/socket-context";
import { useSession } from "next-auth/react";
import { APP_ROUTES, Route } from "utils/constants";
import { SignOutButton } from "ui/signout-button";

export function NavLinks() {
  const { data: session } = useSession();
  const socket = useSocket();
  const pathname = usePathname();
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event: any) => {
        const response = JSON.parse(event.data);
        if (response.type === "incomingMaterialsQty") {
          setQuantity(response.data);
        }
      };
    }
  }, [socket]);

  return (
    <nav>
      <div className="user-info">
        <p className="user-info__username">User: {session?.user.name}</p>
        <p className="user-info__unit">Role: {session?.user.role}</p>
      </div>

      {APP_ROUTES.filter((route: Route) =>
        route.restrict.includes(session?.user.role)
      ).map((route: Route, i) => (
        <Link
          key={i}
          className={`link${pathname === route.path ? " active" : ""}`}
          href={route.path}
        >
          {route.label}{" "}
          {["/incoming-materials", "/pending-materials"].includes(route.path)
            ? quantity && "(" + quantity + ")"
            : ""}
        </Link>
      ))}

      <SignOutButton />
    </nav>
  );
}
