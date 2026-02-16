const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Get started with direct bookings',
    features: [
      { name: 'Booking page', included: true },
      { name: 'Listed in directory', included: true },
      { name: 'Accept payments (Stripe Connect)', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Priority in search results', included: false },
      { name: 'SEO optimization', included: false },
      { name: 'Custom domain', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Review management', included: false },
      { name: 'Google Calendar sync', included: false },
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'Everything you need to grow your business',
    features: [
      { name: 'Booking page', included: true },
      { name: 'Listed in directory', included: true },
      { name: 'Accept payments (Stripe Connect)', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Priority in search results', included: true },
      { name: 'SEO optimization', included: true },
      { name: 'Custom domain', included: true },
      { name: 'Review management', included: true },
      { name: 'Google Calendar sync', included: true },
      { name: 'Security deposit holds', included: true },
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
]

export default function PricingTable() {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`rounded-2xl p-8 ${
            tier.highlighted
              ? 'bg-sky-600 text-white ring-2 ring-sky-600 shadow-xl'
              : 'bg-white border border-gray-200 shadow-sm'
          }`}
        >
          <h3
            className={`text-lg font-semibold ${
              tier.highlighted ? 'text-white' : 'text-gray-900'
            }`}
          >
            {tier.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold">{tier.price}</span>
            <span className={tier.highlighted ? 'text-sky-100' : 'text-gray-500'}>
              {tier.period}
            </span>
          </div>
          <p
            className={`mt-2 text-sm ${
              tier.highlighted ? 'text-sky-100' : 'text-gray-500'
            }`}
          >
            {tier.description}
          </p>

          <ul className="mt-6 space-y-3">
            {tier.features.map((feature) => (
              <li key={feature.name} className="flex items-center gap-2 text-sm">
                {feature.included ? (
                  <span className={tier.highlighted ? 'text-sky-200' : 'text-green-500'}>
                    ✓
                  </span>
                ) : (
                  <span className="text-gray-300">✗</span>
                )}
                <span
                  className={
                    feature.included
                      ? ''
                      : tier.highlighted
                      ? 'text-sky-200/60'
                      : 'text-gray-400'
                  }
                >
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>

          <button
            className={`mt-8 w-full py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
              tier.highlighted
                ? 'bg-white text-sky-600 hover:bg-sky-50'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            {tier.cta}
          </button>
        </div>
      ))}
    </div>
  )
}
