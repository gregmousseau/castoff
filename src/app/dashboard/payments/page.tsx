'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface StripeStatus {
  connected: boolean
  onboarding_complete: boolean
  charges_enabled?: boolean
  payouts_enabled?: boolean
  details_submitted?: boolean
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div></div>}>
      <PaymentsContent />
    </Suspense>
  )
}

function PaymentsContent() {
  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboarding, setOnboarding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const refresh = searchParams.get('refresh')

  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      const res = await fetch('/api/connect/onboard')
      if (!res.ok) throw new Error('Failed to fetch status')
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  async function startOnboarding() {
    setOnboarding(true)
    setError(null)
    try {
      const res = await fetch('/api/connect/onboard', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to start onboarding')
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start onboarding')
      setOnboarding(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your Stripe Connect account to accept payments directly from customers.
        </p>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✅ Stripe onboarding completed successfully! You can now accept payments.
        </div>
      )}

      {refresh && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          ⚠️ Your onboarding session expired. Please try again below.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stripe Connect Status</h2>

        {!status?.connected ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect Your Stripe Account
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Accept credit card payments directly from customers. Money goes straight to your bank account — we never touch it.
            </p>
            <button
              onClick={startOnboarding}
              disabled={onboarding}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
            >
              {onboarding ? 'Redirecting to Stripe...' : 'Set Up Stripe Payments'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Account Connected</p>
                <p className="text-lg font-medium text-green-600">✅ Yes</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Onboarding</p>
                <p className={`text-lg font-medium ${status.onboarding_complete ? 'text-green-600' : 'text-yellow-600'}`}>
                  {status.onboarding_complete ? '✅ Complete' : '⏳ Incomplete'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Can Accept Charges</p>
                <p className={`text-lg font-medium ${status.charges_enabled ? 'text-green-600' : 'text-yellow-600'}`}>
                  {status.charges_enabled ? '✅ Yes' : '❌ No'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Payouts Enabled</p>
                <p className={`text-lg font-medium ${status.payouts_enabled ? 'text-green-600' : 'text-yellow-600'}`}>
                  {status.payouts_enabled ? '✅ Yes' : '❌ No'}
                </p>
              </div>
            </div>

            {!status.onboarding_complete && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-3">
                  Your Stripe setup isn&apos;t complete yet. Please finish onboarding to accept payments.
                </p>
                <button
                  onClick={startOnboarding}
                  disabled={onboarding}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 text-sm"
                >
                  {onboarding ? 'Redirecting...' : 'Continue Setup'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800">How Payments Work</h3>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Customers pay you directly via Stripe — we never hold your money</li>
          <li>Deposits are authorized (held) when customers book, captured when you confirm</li>
          <li>Standard Stripe processing fees apply (2.9% + 30¢)</li>
          <li>Payouts go directly to your bank on your Stripe schedule</li>
        </ul>
      </div>
    </div>
  )
}
