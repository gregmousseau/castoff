import Link from 'next/link'
import AdminBar from '@/components/AdminBar'
import { createClient, createAdminClient } from '@/lib/supabase/server'

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminData = await getAdminStatus()

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
                <Link
                  href="/dashboard"
                  className="border-teal-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/bookings"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Bookings
                </Link>
                <Link
                  href="/dashboard/pricing"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Pricing
                </Link>
                <Link
                  href="/dashboard/calendar"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Calendar
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/payments"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Payments
                </Link>
                <Link
                  href="/dashboard/messages"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Messages
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Settings
                </Link>
                {adminData.isAdmin && (
                  <Link
                    href="/dashboard/admin/operators"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard/payments"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
              >
                Payments
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-2 flex space-x-4 overflow-x-auto">
        <Link href="/dashboard" className="text-sm font-medium text-gray-900 whitespace-nowrap">
          Dashboard
        </Link>
        <Link href="/dashboard/bookings" className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Bookings
        </Link>
        <Link href="/dashboard/pricing" className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Pricing
        </Link>
        <Link href="/dashboard/calendar" className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Calendar
        </Link>
        <Link href="/dashboard/profile" className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Profile
        </Link>
        <Link href="/dashboard/payments" className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Payments
        </Link>
        <Link href="/dashboard/messages" className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Messages
        </Link>
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Settings
        </Link>
        {adminData.isAdmin && (
          <Link href="/dashboard/admin/operators" className="text-sm font-medium text-gray-500 whitespace-nowrap">
            Admin
          </Link>
        )}
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
