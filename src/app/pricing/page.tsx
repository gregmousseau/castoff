import Link from 'next/link'
import PricingTable from '@/components/PricingTable'

export const metadata = {
  title: 'Pricing - Cast Off',
  description: 'Professional booking software for charter operators. Start free, grow with Pro.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-sky-600 flex items-center gap-2">
            <img src="/brand/logo-icon.png" alt="Cast Off" className="h-8 w-8 inline-block" /> Cast Off
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Home
            </Link>
            <Link href="/login" className="text-sm bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
              Operator Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sky-600 font-semibold text-sm tracking-widest uppercase mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Invest in your business.<br />Not in someone else&apos;s.
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Every plan includes direct booking, your own Stripe account, and zero commission.
            The difference is how fast you want to grow.
          </p>
        </div>

        <PricingTable />

        {/* Comparison */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            The math is simple
          </h2>
          <p className="text-gray-500 text-center mb-10">On a $2,000 charter, here&apos;s what you actually keep.</p>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-500">
              <div></div>
              <div className="text-center">Marketplaces</div>
              <div className="text-center text-sky-600">Cast Off</div>
            </div>
            {[
              { label: 'Commission per booking', marketplace: '15–25%', castoff: '0%', highlight: true },
              { label: 'Monthly platform fee', marketplace: '$0', castoff: '$0 – $29' },
              { label: 'You keep on a $2,000 booking', marketplace: '$1,500–$1,700', castoff: '$2,000', highlight: true },
              { label: 'You keep on 20 bookings/month', marketplace: '$30,000–$34,000', castoff: '$40,000', highlight: true },
            ].map((row) => (
              <div key={row.label} className={`grid grid-cols-3 px-6 py-4 text-sm border-b border-gray-100 last:border-0 ${row.highlight ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="text-gray-600 font-medium">{row.label}</div>
                <div className={`text-center font-semibold ${row.highlight ? 'text-red-500' : 'text-gray-400'}`}>{row.marketplace}</div>
                <div className={`text-center font-semibold ${row.highlight ? 'text-green-600' : 'text-gray-600'}`}>{row.castoff}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Common questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Do you take a cut of my bookings?', a: 'Never. Cast Off charges a flat monthly subscription. Every dollar from your guests goes directly to your Stripe account.' },
              { q: 'What does "your Stripe account" mean?', a: 'You connect your own Stripe account during setup. Payments from guests flow directly to you — Cast Off never touches your money.' },
              { q: 'How long does setup take?', a: 'Most operators are live same-day. You\'ll create your profile, connect Stripe, set your availability, and share your booking link — usually under an hour.' },
              { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no lock-in. Cancel anytime from your dashboard.' },
            ].map((item) => (
              <div key={item.q} className="border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 bg-gray-950 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">Start for free. No credit card required.</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Create your booking page today and see what owning your bookings feels like.</p>
            <Link href="/login" className="inline-block bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 px-10 rounded-lg transition-colors text-lg shadow-lg shadow-sky-500/30">
              Get Started Free
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 mt-16 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <p>&copy; 2026 Cast Off. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
