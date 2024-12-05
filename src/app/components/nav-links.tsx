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
        Customer
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
    </nav>
  );
}
