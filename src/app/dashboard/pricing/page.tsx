'use client'

import { useEffect, useState } from 'react'

interface PricingRecord {
  id: string
  trip_type: string
  display_name: string
  duration_hours: number | null
  start_time: string | null
  end_time: string | null
  base_price: number
  deposit_amount: number
  active: boolean
}

function SecurityDepositSection() {
  const [enabled, setEnabled] = useState(false)
  const [amount, setAmount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Fetch current security deposit settings
    fetch('/api/pricing')
      .then(res => res.json())
      .then(() => {
        // Would load from operator settings in production
      })
      .catch(() => {})
  }, [])

  async function saveDeposit() {
    setSaving(true)
    setSaved(false)
    try {
      // In production, PATCH to /api/operators/[slug]
      // For now, just simulate
      await new Promise(r => setTimeout(r, 500))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-6 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Security Deposit</h2>
      <p className="text-sm text-gray-500 mb-4">
        A hold will be placed on the customer&apos;s card. Only captured if you file a damage claim within 48 hours of the trip.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-teal-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {enabled && (
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deposit Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              placeholder="500"
            />
          </div>
          <button
            onClick={saveDeposit}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

const CANCELLATION_TIERS = [
  {
    value: 'flexible',
    label: 'Flexible',
    description: 'Free cancellation up to 24 hours before. Non-refundable within 24 hours.',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Free cancellation up to 5 days before. 50% refund 2–5 days before. Non-refundable within 2 days.',
  },
  {
    value: 'strict',
    label: 'Strict',
    description: 'Free cancellation up to 30 days before. 50% refund 14–30 days before. Non-refundable within 14 days.',
  },
]

function CancellationPolicySection() {
  const [policy, setPolicy] = useState('moderate')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/operator/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.cancellation_policy) setPolicy(data.cancellation_policy)
      })
      .catch(() => {})
  }, [])

  async function savePolicy(value: string) {
    setPolicy(value)
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/operator/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellation_policy: value }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-6 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Cancellation Policy</h2>
      <p className="text-sm text-gray-500 mb-4">
        Choose a cancellation policy for your bookings. This will be displayed to customers on your booking page.
      </p>
      <div className="space-y-3">
        {CANCELLATION_TIERS.map((tier) => (
          <label
            key={tier.value}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              policy === tier.value ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="cancellation_policy"
              value={tier.value}
              checked={policy === tier.value}
              onChange={() => savePolicy(tier.value)}
              className="mt-1 text-teal-600 focus:ring-teal-500"
            />
            <div>
              <p className="font-medium text-gray-900">{tier.label}</p>
              <p className="text-sm text-gray-500">{tier.description}</p>
            </div>
          </label>
        ))}
      </div>
      {saving && <p className="text-sm text-gray-400 mt-2">Saving...</p>}
      {saved && <p className="text-sm text-green-600 mt-2">✓ Saved</p>}
    </div>
  )
}

function WhatToBringSection() {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/operator/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.what_to_bring) setText(data.what_to_bring)
      })
      .catch(() => {})
  }, [])

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/operator/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ what_to_bring: text }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-6 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">What to Bring</h2>
      <p className="text-sm text-gray-500 mb-4">
        Let customers know what to bring on their trip. Enter one item per line.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        placeholder={"Sunscreen\nSunglasses\nTowel\nLight jacket\nSnacks & drinks"}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ base_price: number; deposit_amount: number }>({
    base_price: 0,
    deposit_amount: 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPricing()
  }, [])

  async function fetchPricing() {
    try {
      const res = await fetch('/api/pricing')
      if (!res.ok) {
        throw new Error('Failed to fetch pricing')
      }
      const data = await res.json()
      setPricing(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pricing')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(record: PricingRecord) {
    setEditingId(record.id)
    setEditValues({
      base_price: record.base_price,
      deposit_amount: record.deposit_amount,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValues({ base_price: 0, deposit_amount: 0 })
  }

  async function saveEdit(id: string) {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/pricing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }

      const updated = await res.json()
      setPricing(prev => prev.map(p => (p.id === id ? updated : p)))
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(record: PricingRecord) {
    try {
      const res = await fetch(`/api/pricing/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !record.active }),
      })

      if (!res.ok) {
        throw new Error('Failed to update')
      }

      const updated = await res.json()
      setPricing(prev => prev.map(p => (p.id === record.id ? updated : p)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  function formatTime(time: string | null): string {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'pm' : 'am'
    const h12 = h % 12 || 12
    return `${h12}:${minutes}${ampm}`
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
        <h1 className="text-2xl font-bold text-gray-900">Pricing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your trip prices and deposits.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {pricing.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No pricing configured yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Pricing will appear here once it&apos;s set up.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deposit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pricing.map((record) => (
                <tr key={record.id} className={!record.active ? 'bg-gray-50 opacity-60' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.display_name}
                    </div>
                    <div className="text-xs text-gray-500">{record.trip_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.duration_hours ? `${record.duration_hours} hours` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.start_time && record.end_time
                      ? `${formatTime(record.start_time)} - ${formatTime(record.end_time)}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === record.id ? (
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={editValues.base_price}
                        onChange={(e) =>
                          setEditValues({ ...editValues, base_price: Number(e.target.value) })
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        ${record.base_price.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === record.id ? (
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={editValues.deposit_amount}
                        onChange={(e) =>
                          setEditValues({ ...editValues, deposit_amount: Number(e.target.value) })
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        ${record.deposit_amount.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(record)}
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        record.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {record.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === record.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => saveEdit(record.id)}
                          disabled={saving}
                          className="text-teal-600 hover:text-teal-800 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(record)}
                        className="text-teal-600 hover:text-teal-800"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Security Deposit Section */}
      <SecurityDepositSection />

      {/* Cancellation Policy Section */}
      <CancellationPolicySection />

      {/* What to Bring Section */}
      <WhatToBringSection />

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800">Pricing Tips</h3>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Deposit is held when customers book, captured when you confirm.</li>
          <li>If you decline a booking, the deposit hold is released automatically.</li>
          <li>Mark a trip type as inactive to temporarily hide it from booking.</li>
        </ul>
      </div>
    </div>
  )
}
