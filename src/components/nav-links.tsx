"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSocket } from "context/socket-context";
import { useSession } from "next-auth/react";
import { APP_ROUTES, Route } from "utils/constants";
import { SignOutButton } from "ui/signout-button";
import logoPic from "../utils/logo.png";

export function NavLinks() {
  const { data: session } = useSession();
  const socket = useSocket();
  const pathname = "/" + usePathname().split("/").filter(Boolean)[0];
  const [qtyIncoming, setQtyIncoming] = useState(0);
  const [qtyVault, setQtyVault] = useState(0);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event: any) => {
        const response = JSON.parse(event.data);
        if (response.type === "incomingMaterialsQty") {
          setQtyIncoming(response.data);
        } else if (response.type === "incomingVaultQty") {
          setQtyVault(response.data);
        }
      };
    }
  }, [socket]);

  return (
    <nav>
      <Image
        className="image-logo"
        src={logoPic}
        width={130}
        height={43}
        alt="logo"
      />
      <div className="user-info">
        <p>Group: {session?.user.role}</p>
        <p>User: {session?.user.name}</p>
      </div>
      {APP_ROUTES.filter((route: Route) =>
        route.restrict.includes(session?.user.role)
      ).map((route: Route, i) => (
        <Link
          key={i}
          className={`link${pathname === route.path ? " active" : ""}`}
          href={route.path}
        >
          <span className="nav-icon">{route.icon}</span>
          <span className="nav-label">
            {route.label}{" "}
            {"/incoming-materials" === route.path && qtyIncoming
              ? `(${qtyIncoming})`
              : ""}
            {"/incoming-vault" === route.path && qtyVault
              ? `(${qtyVault})`
              : ""}
          </span>
        </Link>
      ))}
      <SignOutButton />
    </nav>
  );
}
