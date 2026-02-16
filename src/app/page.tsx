import Link from 'next/link'
import OperatorCard from '@/components/OperatorCard'
import { createAdminClient } from '@/lib/supabase/server'

async function getOperators() {
  try {
    const supabase = createAdminClient()
    const { data: operators } = await supabase
      .from('operators')
      .select('id, slug, business_name, location, hero_image')
      .order('business_name')

    if (!operators?.length) return []

    const results = await Promise.all(
      operators.map(async (op) => {
        const [{ data: pricing }, { data: reviews }] = await Promise.all([
          supabase
            .from('pricing')
            .select('base_price')
            .eq('operator_id', op.id)
            .eq('active', true)
            .order('base_price', { ascending: true })
            .limit(1),
          supabase
            .from('reviews')
            .select('rating')
            .eq('operator_id', op.id)
            .eq('visible', true),
        ])

        const reviewCount = reviews?.length || 0
        const averageRating =
          reviewCount > 0
            ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0

        return {
          slug: op.slug,
          businessName: op.business_name,
          location: op.location,
          heroImage: op.hero_image,
          startingPrice: pricing?.[0]?.base_price ?? null,
          averageRating,
          reviewCount,
        }
      })
    )
    return results
  } catch {
    return []
  }
}

export default async function Home() {
  const operators = await getOperators()

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-sky-600 flex items-center gap-2">
            ⛵ Cast Off
          </span>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              For Operators
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Book Direct with Local Charter Operators
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Skip the middleman. Save 15% on every booking. Support local captains directly.
        </p>
        <a
          href="#directory"
          className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Browse Charters
        </a>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🔍', title: 'Browse', description: 'Find local charter operators in your area. Read real reviews, compare prices.' },
            { icon: '📅', title: 'Book', description: 'Book directly with the captain. No middleman fees — save 15-25% compared to marketplaces.' },
            { icon: '⛵', title: 'Enjoy', description: 'Show up and have an amazing time. Pay the captain directly, hassle-free.' },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Directory */}
      <section id="directory" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Charter Operators
        </h2>
        <p className="text-gray-600 text-center mb-12">
          Browse our growing directory of verified local operators
        </p>

        {operators.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {operators.map((op) => (
              <OperatorCard key={op.slug} {...op} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Operators coming soon! Check back shortly.</p>
            <Link
              href="/book/angelo"
              className="inline-block mt-4 text-sky-600 hover:underline"
            >
              View Demo: Bahamas Water Tours →
            </Link>
          </div>
        )}
      </section>

      {/* For Operators */}
      <section className="bg-gray-900 text-white py-20 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Own Your Bookings</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Stop giving 15-25% of every booking to marketplace middlemen.
            Cast Off lets you accept direct bookings with your own Stripe account.
            You keep 100% of every dollar.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/pricing"
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              See Pricing
            </Link>
            <Link
              href="/login"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-lg transition-colors border border-white/20"
            >
              Operator Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <p>&copy; 2026 Cast Off. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            <Link href="/pricing" className="hover:text-gray-600">For Operators</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
