'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface OperatorSummary {
  id: string
  slug: string
  business_name: string
  location: string | null
  email: string | null
  claimed: boolean
  stripe_onboarding_complete: boolean
  created_at: string
}

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState<OperatorSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/operators')
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => setOperators(data.operators || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
        <h1 className="text-2xl font-bold text-gray-900">All Operators</h1>
        <p className="mt-1 text-sm text-gray-500">Admin view of all registered operators.</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stripe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operators.map(op => (
              <tr key={op.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{op.business_name}</div>
                    <div className="text-sm text-gray-500">{op.slug}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {op.location || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    op.claimed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {op.claimed ? 'Claimed' : 'Unclaimed'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    op.stripe_onboarding_complete ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {op.stripe_onboarding_complete ? 'Connected' : 'Not Connected'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/book/${op.slug}`}
                    className="text-teal-600 hover:text-teal-800 mr-4"
                  >
                    View Page
                  </Link>
                  <Link
                    href={`/dashboard?operator=${op.slug}`}
                    className="text-teal-600 hover:text-teal-800"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {operators.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No operators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
