import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - Cast Off',
  description: 'Terms of Service for the Cast Off charter booking platform.',
}

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 16, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Overview</h2>
            <p className="text-gray-600 leading-relaxed">
              Cast Off (&quot;we,&quot; &quot;us,&quot; or &quot;the Platform&quot;) operates the website at castoff.boats. Cast Off is a <strong>software platform</strong> that connects charter boat operators (&quot;Operators&quot;) with customers (&quot;Customers&quot;). By using our Platform, you agree to these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Platform Role</h2>
            <p className="text-gray-600 leading-relaxed">
              Cast Off is a technology platform only. We are <strong>not a party to any transaction</strong> between Operators and Customers. Cast Off does not own, operate, manage, or control any boats, vessels, or charter services listed on the Platform. All bookings are made directly between the Customer and the Operator.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Operator Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-2">Operators are solely responsible for:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>The safety of all passengers and crew aboard their vessels</li>
              <li>Maintaining all required licenses, permits, and certifications</li>
              <li>Carrying appropriate insurance coverage</li>
              <li>Compliance with all applicable local, state/provincial, and federal laws and regulations</li>
              <li>The accuracy and completeness of their listings, including photos, descriptions, and pricing</li>
              <li>Delivery of the chartered service as described</li>
              <li>Setting and enforcing their own cancellation policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Customer Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-2">Customers are responsible for:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Assessing the suitability of any charter for their needs, experience level, and physical abilities</li>
              <li>Arriving on time at the designated departure location</li>
              <li>Following all instructions provided by the Operator and crew</li>
              <li>Complying with all safety rules and regulations</li>
              <li>Providing accurate contact and payment information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payments</h2>
            <p className="text-gray-600 leading-relaxed">
              Cast Off provides payment processing via Stripe Connect. When you make a booking, payment flows directly to the Operator&apos;s connected Stripe account. Cast Off may collect a platform fee or subscription fee from Operators. Cast Off does not hold customer funds — all payments are processed by Stripe in accordance with Stripe&apos;s terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cancellations &amp; Refunds</h2>
            <p className="text-gray-600 leading-relaxed">
              Cancellation policies are set by individual Operators and displayed on their booking pages. Cast Off is not responsible for issuing refunds — refund requests must be directed to the Operator. Weather-related cancellations are at the captain&apos;s discretion. Cast Off is not responsible for weather cancellations, service quality, or disputes between Operators and Customers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Reviews &amp; User Content</h2>
            <p className="text-gray-600 leading-relaxed">
              Reviews and ratings on the Platform are user-generated content. Cast Off does not verify, endorse, or guarantee the accuracy of any review. We reserve the right to remove reviews that violate our content guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, Cast Off&apos;s total liability for any claims arising from or related to the Platform shall not exceed the total fees paid by you to Cast Off (not to Operators) in the twelve (12) months preceding the claim. Cast Off is not liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to personal injury, property damage, lost profits, or loss of data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Cast Off, its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in connection with your use of the Platform, your violation of these Terms, or your interaction with any Operator or Customer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Platform Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              Cast Off reserves the right to remove any listing, suspend any account, or refuse service to any user at our sole discretion, including for violations of these Terms, fraudulent activity, or conduct that we deem harmful to the Platform or its users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the Province of Ontario, Canada, without regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Ontario, Canada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Changes to These Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms from time to time. We will notify users of material changes by posting the updated Terms on this page with a new &quot;Last updated&quot; date. Your continued use of the Platform after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about these Terms, please contact us at{' '}
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
