'use client'
 
import { usePathname } from 'next/navigation'
import Link from 'next/link'
 
export function NavLinks() {
  const pathname = usePathname()
 
  return (
    <nav>
      <Link className={`link ${pathname === '/' ? 'active' : ''}`} href="/">
        Main Page
      </Link>
 
      <Link
        className={`link ${pathname === '/customer' ? 'active' : ''}`}
        href="/customer"
      >
        Customer
      </Link>

      <Link
        className={`link ${pathname === '/send_material' ? 'active' : ''}`}
        href="/send_material">
          Send Material
      </Link>
    </nav>
  )
}