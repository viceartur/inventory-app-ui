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
import { fetchRequestedMaterialsCount } from "actions/materials";

export function NavLinks() {
  const { data: session } = useSession();
  const socket = useSocket();
  const pathname = "/" + usePathname().split("/").filter(Boolean)[0];
  const [qtyIncoming, setQtyIncoming] = useState(0);
  const [qtyVault, setQtyVault] = useState(0);
  const [qtyRequested, setQtyRequested] = useState(0);

  useEffect(() => {
    // Grant permission for notifications for the user.
    if (
      typeof window !== "undefined" &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission();
    }

    // Set Requested Materials Quantity at first render.
    const getRequestedMaterialsQty = async () => {
      const qtyRequested = await fetchRequestedMaterialsCount();
      setQtyRequested(qtyRequested);
    };
    getRequestedMaterialsQty();
  }, []);

  // Handle WebSocket.
  useEffect(() => {
    if (!socket || !session?.user.role) return;

    const handleMessage = (event: MessageEvent) => {
      const response = JSON.parse(event.data);
      switch (response.type) {
        case "incomingMaterialsQty":
          setQtyIncoming(response.data);
          break;
        case "incomingVaultQty":
          setQtyVault(response.data);
          break;
        case "requestedMaterialsQty":
          setQtyRequested(response.data);

          // Show notification only if allowed
          if (Notification.permission === "granted") {
            const notification = new Notification("📦 New Material Request", {
              body: 'Production has requested materials. Check "Requested Materials".',
            });

            // Click handler redirects to the section
            notification.onclick = () => {
              window.focus();
              window.location.href = "/requested-materials";
            };
          }

          break;
        case "requestedMaterialsQtyRemoved":
          setQtyRequested(response.data);
          break;
        default:
          break;
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, session?.user.role]);

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
            {"/requested-materials" === route.path && qtyRequested
              ? `(${qtyRequested})`
              : ""}
          </span>
        </Link>
      ))}
      <SignOutButton />
    </nav>
  );
}
