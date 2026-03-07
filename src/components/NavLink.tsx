'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  exact?: boolean
  mobile?: boolean
}

export default function NavLink({ href, children, exact = false, mobile = false }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  if (mobile) {
    return (
      <Link
        href={href}
        className={`text-sm font-medium whitespace-nowrap ${
          isActive ? 'text-teal-600' : 'text-gray-500'
        }`}
      >
        {children}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        isActive
          ? 'border-teal-500 text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {children}
    </Link>
  )
}
