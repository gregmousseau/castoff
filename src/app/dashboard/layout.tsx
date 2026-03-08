import Link from 'next/link'
import AdminBar from '@/components/AdminBar'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import NavLink from '@/components/NavLink'

async function getAdminStatus() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { isAdmin: false, operators: [] }

    const adminClient = createAdminClient()
    const { data: operator } = await adminClient
      .from('operators')
      .select('is_admin, slug, business_name')
      .eq('user_id', user.id)
      .single()

    if (!operator?.is_admin) return { isAdmin: false, operators: [] }

    // Admin: fetch all operators for the switcher
    const { data: allOperators } = await adminClient
      .from('operators')
      .select('slug, business_name')
      .order('business_name')

    return {
      isAdmin: true,
      operators: allOperators || [],
      currentSlug: operator.slug,
    }
  } catch {
    return { isAdmin: false, operators: [] }
  }
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', exact: true },
  { href: '/dashboard/bookings', label: 'Bookings' },
  { href: '/dashboard/pricing', label: 'Pricing' },
  { href: '/dashboard/payments', label: 'Payments' },
  { href: '/dashboard/messages', label: 'Messages' },
  { href: '/dashboard/media', label: 'Media' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminData = await getAdminStatus()

  const allNavItems = adminData.isAdmin
    ? [...NAV_ITEMS, { href: '/dashboard/admin/operators', label: 'Admin' }]
    : NAV_ITEMS

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Bar */}
      {adminData.isAdmin && (
        <AdminBar
          operators={adminData.operators}
          currentSlug={adminData.currentSlug}
        />
      )}

      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-teal-600 flex items-center gap-2">
                  <img src="/brand/logo-icon.png" alt="Cast Off" className="h-7 w-7" /> Cast Off
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {allNavItems.map((item) => (
                  <NavLink key={item.href} href={item.href} exact={item.exact}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-2 flex space-x-4 overflow-x-auto">
        {allNavItems.map((item) => (
          <NavLink key={item.href} href={item.href} exact={item.exact} mobile>
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Main content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
