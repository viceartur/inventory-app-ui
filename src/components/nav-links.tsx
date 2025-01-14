"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { wsConnect, wsOnMessage } from "utils/websocket";

export function NavLinks() {
  const pathname = usePathname();
  const [qty, setQty] = useState(0);

  useEffect(() => {
    const socket = wsConnect();

    wsOnMessage(socket, (q: any) => {
      console.log("QTY", q);
      setQty(q);
    });
  }, []);

  return (
    <nav>
      <Link className={`link ${pathname === "/" ? "active" : ""}`} href="/">
        Main Page
      </Link>
      <Link
        className={`link ${pathname === "/customer" ? "active" : ""}`}
        href="/customer"
      >
        Customers
      </Link>
      <Link
        className={`link ${pathname === "/warehouse" ? "active" : ""}`}
        href="/warehouse"
      >
        Warehouse & Locations
      </Link>
      <Link
        className={`link ${pathname === "/send-material" ? "active" : ""}`}
        href="/send-material"
      >
        Send Material
      </Link>
      <Link
        className={`link ${pathname === "/incoming-materials" ? "active" : ""}`}
        href="/incoming-materials"
      >
        Incoming Materials ({qty})
      </Link>
      <Link
        className={`link ${pathname === "/materials" ? "active" : ""}`}
        href="/materials"
      >
        Inventory
      </Link>
      <Link
        className={`link ${pathname === "/reports" ? "active" : ""}`}
        href="/reports"
      >
        Reports
      </Link>
      <Link
        className={`link ${pathname === "/import_data" ? "active" : ""}`}
        href="/import_data"
      >
        Import Materials
      </Link>
    </nav>
  );
}
