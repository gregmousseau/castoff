import Link from 'next/link'
import PricingTable from '@/components/PricingTable'

export const metadata = {
  title: 'Pricing - Charter Direct',
  description: 'Simple, transparent pricing for charter operators. Free to start, Pro to grow.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-sky-600 flex items-center gap-2">
            ⛵ Charter Direct
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Directory
            </Link>
            <Link
              href="/login"
              className="text-sm bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Operator Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start accepting direct bookings for free. Upgrade to Pro when you&apos;re ready to grow.
            No commissions, ever.
          </p>
        </div>

        <PricingTable />

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Compare to Marketplace Fees
          </h2>
          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div></div>
              <div className="font-semibold text-gray-900">Marketplaces</div>
              <div className="font-semibold text-sky-600">Charter Direct</div>

              <div className="text-left text-gray-600">Commission per booking</div>
              <div className="text-red-600 font-medium">15-25%</div>
              <div className="text-green-600 font-medium">0%</div>

              <div className="text-left text-gray-600">Monthly fee</div>
              <div className="text-gray-500">$0</div>
              <div className="text-gray-500">$0 - $29</div>

              <div className="text-left text-gray-600">On a $1,000 booking</div>
              <div className="text-red-600 font-medium">You lose $150-250</div>
              <div className="text-green-600 font-medium">You keep $1,000</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-16 py-8 text-center text-gray-400 text-sm">
        <p>&copy; 2026 Charter Direct. All rights reserved.</p>
      </footer>
    </div>
  )
}
