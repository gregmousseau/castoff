import Link from 'next/link'

const featuredOperators = [
  {
    slug: 'angelo',
    businessName: "Angelo's Bahamas Charters",
    location: 'Nassau, Bahamas',
    description: 'Luxury full-day yacht excursions through the Exumas. Private snorkeling, swimming pigs, and sunset cruises.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    type: 'Luxury Yacht',
    verified: true,
  },
  {
    slug: 'gregs-charters',
    businessName: "Greg's Sailing Charters",
    location: 'Toronto, Ontario',
    description: 'Private sailing on Lake Ontario. Half-day, full-day, and sunset cruises aboard a classic 36ft sailboat.',
    image: 'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80',
    type: 'Sailing',
    verified: true,
  },
  {
    slug: 'blue-marlin',
    businessName: 'Blue Marlin Sport Fishing',
    location: 'Miami, Florida',
    description: 'Deep-sea sport fishing charters out of Miami. Full-day offshore trips targeting marlin, tuna, and mahi-mahi.',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    type: 'Sport Fishing',
    verified: false,
  },
]

const features = [
  {
    title: 'Grow Revenue',
    description: 'Keep 100% of every booking. No marketplace commission — ever. Set your own prices, run your own promotions.',
  },
  {
    title: 'Automate Operations',
    description: 'Online booking, automated confirmations, digital waivers, and calendar sync — all handled. You focus on the water.',
  },
  {
    title: 'Delight Guests',
    description: 'Branded booking pages, add-ons, instant booking, and automatic review requests. Every guest feels like a VIP.',
  },
]

const trustSignals = ['No setup fees', 'Your Stripe account', 'Go live in 24 hours', '0% commission']

export default async function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-sky-600 flex items-center gap-2">
            <img src="/brand/logo-icon.png" alt="Cast Off" className="h-8 w-8 inline-block" /> Cast Off
          </span>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              For Operators
            </Link>
            <Link href="/login" className="text-sm bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-lg transition-colors font-medium">
              Operator Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-950">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-28 md:py-40">
          <div className="max-w-3xl">
            <p className="text-sky-400 font-semibold text-sm tracking-widest uppercase mb-4">Professional Booking Software for Charter Operators</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Your booking page.<br />Your customers.<br />Your money.
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mb-10">
              Cast Off gives charter operators a professional direct-booking platform — so you stop paying 15–25% to marketplace middlemen and start owning your business.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/pricing" className="inline-block bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-sky-500/30 text-lg">
                Get Started Free
              </Link>
              <Link href="#operators" className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-lg transition-colors border border-white/20 text-lg">
                See It In Action
              </Link>
            </div>
            <div className="flex flex-wrap gap-6">
              {trustSignals.map((s) => (
                <div key={s} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-sky-400 font-bold">✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to run a world-class charter operation</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Built for operators who want to own their customer relationships — not rent them from a marketplace.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-4 p-8 rounded-2xl border border-gray-100 hover:border-sky-200 hover:shadow-md transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 text-2xl font-bold">
                  {f.title[0]}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Details */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Everything included. Nothing held back.</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Instant & Request Booking', desc: 'Let guests book instantly or send a request — your choice per trip type.' },
              { title: 'Dynamic Pricing', desc: 'Set seasonal rates, demand pricing, and add-ons. Maximize revenue automatically.' },
              { title: 'Security Deposits', desc: 'Protect your vessel with authorization holds. Capture or release after the trip.' },
              { title: 'Digital Waivers', desc: 'Collect signed waivers before guests arrive. No paper, no chasing.' },
              { title: 'Cancellation Policies', desc: 'Flexible, Moderate, or Strict — you decide what works for your business.' },
              { title: 'Verified Captain Badge', desc: 'Build trust with guests. Your credentials, displayed prominently.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 bg-white rounded-xl border border-gray-100">
                <div className="flex-shrink-0 mt-1 h-5 w-5 rounded-full bg-sky-100 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-sky-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Operators who made the switch</h2>
            <p className="text-gray-500 text-lg">Real results from captains who stopped paying marketplace fees.</p>
          </div>
          <div className="bg-gray-950 rounded-2xl overflow-hidden grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              <img
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80"
                alt="Angelo's Bahamas Charters"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="p-10 flex flex-col justify-center">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-sky-400 text-xl">★</span>
                ))}
              </div>
              <blockquote className="text-white text-xl font-medium leading-relaxed mb-8">
                &ldquo;I was losing $200–300 on every booking to GetMyBoat. Cast Off gave me my own branded page and my customers book direct now. Set up in one afternoon.&rdquo;
              </blockquote>
              <div>
                <p className="text-white font-semibold">Angelo</p>
                <p className="text-gray-400 text-sm">Founder, Angelo&apos;s Bahamas Charters · Nassau</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Operators */}
      <section id="operators" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Operators</h2>
            <p className="text-gray-500 text-lg">A selection of captains using Cast Off to run their businesses.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOperators.map((op) => (
              <Link
                key={op.slug}
                href={`/book/${op.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-sky-200 hover:shadow-lg transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={op.image}
                    alt={op.businessName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {op.verified && (
                    <div className="absolute top-3 right-3 bg-sky-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      ✓ Verified
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                    {op.type}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors mb-1">{op.businessName}</h3>
                  <p className="text-sm text-gray-400 mb-3">📍 {op.location}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{op.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-sky-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to own your bookings?</h2>
          <p className="text-sky-100 text-lg mb-10 max-w-xl mx-auto">
            Join operators who have taken control of their business. Free to start — no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pricing" className="bg-white text-sky-600 hover:bg-sky-50 font-semibold py-3 px-8 rounded-lg transition-colors text-lg shadow-lg">
              Get Started Free
            </Link>
            <Link href="/login" className="bg-sky-700 hover:bg-sky-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors border border-sky-500 text-lg">
              Operator Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src="/brand/logo-icon.png" alt="Cast Off" className="h-6 w-6" />
            <span className="font-semibold text-gray-600">Cast Off</span>
            <span className="ml-2">&copy; 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <Link href="/pricing" className="hover:text-gray-600 transition-colors">For Operators</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
