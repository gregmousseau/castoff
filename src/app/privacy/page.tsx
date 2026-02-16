import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Cast Off',
  description: 'Privacy Policy for the Cast Off charter booking platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-sky-600 flex items-center gap-2">
            ⛵ Cast Off
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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 16, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Cast Off (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website at castoff.boats. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Platform. We are committed to protecting your privacy in accordance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and other applicable Canadian privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-2">We collect the following types of information:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>Account information:</strong> Name, email address, phone number</li>
              <li><strong>Payment information:</strong> Processed securely by Stripe — we do not store credit card numbers</li>
              <li><strong>Booking history:</strong> Dates, trip types, operator interactions</li>
              <li><strong>Usage data:</strong> Pages visited, features used, browser type, device information</li>
              <li><strong>Communications:</strong> Emails and messages sent through the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Process bookings and payments between Customers and Operators</li>
              <li>Send booking confirmations, reminders, and notifications</li>
              <li>Provide customer support</li>
              <li>Improve and optimize the Platform</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed mb-2">We share information with the following third parties as necessary to operate the Platform:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>Stripe:</strong> Payment processing (see <a href="https://stripe.com/privacy" className="text-sky-600 hover:underline" target="_blank" rel="noopener noreferrer">Stripe&apos;s Privacy Policy</a>)</li>
              <li><strong>Vercel:</strong> Website hosting and analytics</li>
              <li><strong>Supabase:</strong> Database hosting and authentication</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-2">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies &amp; Analytics</h2>
            <p className="text-gray-600 leading-relaxed">
              We use Vercel Analytics to understand how visitors use our Platform. This may involve cookies or similar technologies to collect anonymized usage data. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. Booking records are retained for a minimum of 7 years for tax and legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-2">Under PIPEDA and applicable privacy laws, you have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal retention requirements</li>
              <li><strong>Withdraw consent:</strong> Withdraw your consent to our processing of your information</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-2">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@castoff.boats" className="text-sky-600 hover:underline">support@castoff.boats</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures to protect your information, including encryption in transit (TLS) and at rest. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will post the updated policy on this page with a revised &quot;Last updated&quot; date. Your continued use of the Platform constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at{' '}
              <a href="mailto:support@castoff.boats" className="text-sky-600 hover:underline">
                support@castoff.boats
              </a>.
            </p>
          </section>
        </div>
      </main>

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
