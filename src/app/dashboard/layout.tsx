import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-teal-600">
                  Cast Off
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
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard/payments"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
              >
                💳 Payments
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
