"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavLinks() {
  const pathname = usePathname();
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
        Incoming Materials
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
