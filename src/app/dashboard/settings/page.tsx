'use client'

import { useEffect, useState } from 'react'

const DEFAULT_WAIVER = `I understand that boating activities carry inherent risks including but not limited to drowning, injury, and property damage. I voluntarily assume all risks. I release [Business Name], its captain, crew, and agents from all liability for injury, death, or property damage arising from this activity. I confirm I can swim and will follow all safety instructions. I am signing this waiver on behalf of myself and all members of my party.`

interface OperatorSettings {
  business_name: string
  description: string
  location: string
  email: string
  phone: string
  whatsapp: string
  waiver_enabled: boolean
  waiver_text: string
  instant_booking: boolean
  trip_hold_enabled: boolean
  verified: boolean
  verification_docs: { type: string; url: string; verified_at: string | null }[]
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OperatorSettings>({
    business_name: '',
    description: '',
    location: '',
    email: '',
    phone: '',
    whatsapp: '',
    waiver_enabled: false,
    waiver_text: DEFAULT_WAIVER,
    instant_booking: false,
    trip_hold_enabled: false,
    verified: false,
    verification_docs: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [slug, setSlug] = useState('')

  useEffect(() => {
    // Fetch operator settings
    fetch('/api/dashboard/stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.operator) {
          setSlug(data.operator.slug || '')
          setSettings({
            business_name: data.operator.business_name || '',
            description: data.operator.description || '',
            location: data.operator.location || '',
            email: data.operator.email || '',
            phone: data.operator.phone || '',
            whatsapp: data.operator.whatsapp || '',
            waiver_enabled: data.operator.waiver_enabled || false,
            waiver_text: data.operator.waiver_text || DEFAULT_WAIVER,
            instant_booking: data.operator.instant_booking || false,
            trip_hold_enabled: data.operator.trip_hold_enabled || false,
            verified: data.operator.verified || false,
            verification_docs: data.operator.verification_docs || [],
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    if (!slug) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/operators/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: settings.business_name,
          description: settings.description,
          location: settings.location,
          email: settings.email,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          waiver_enabled: settings.waiver_enabled,
          waiver_text: settings.waiver_text,
          instant_booking: settings.instant_booking,
          trip_hold_enabled: settings.trip_hold_enabled,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your business settings and features.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Business Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Instant Booking */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">⚡ Instant Booking</h2>
              <p className="text-sm text-gray-500 mt-1">
                When enabled, bookings are automatically confirmed without requiring your approval.
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, instant_booking: !settings.instant_booking })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.instant_booking ? 'bg-teal-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.instant_booking ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Digital Waiver */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">📋 Digital Waiver</h2>
              <p className="text-sm text-gray-500 mt-1">
                Require customers to sign a liability waiver before booking.
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, waiver_enabled: !settings.waiver_enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.waiver_enabled ? 'bg-teal-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.waiver_enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          {settings.waiver_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waiver Text</label>
              <textarea
                rows={6}
                value={settings.waiver_text}
                onChange={(e) => setSettings({ ...settings, waiver_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Customize the waiver text above. Use [Business Name] as a placeholder for your business name.
              </p>
            </div>
          )}
        </div>

        {/* Captain Protection / Trip Hold */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">🛡️ Captain Protection (No-Show Protection)</h2>
              <p className="text-sm text-gray-500 mt-1">
                Place a hold on the customer&apos;s card for the full trip amount. If they pay cash day-of, release the hold. If they no-show, capture the amount.
              </p>
              <span className="inline-block mt-2 text-xs font-medium bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Pro Feature</span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, trip_hold_enabled: !settings.trip_hold_enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.trip_hold_enabled ? 'bg-teal-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.trip_hold_enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Verification */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">✓ Verification</h2>
          {settings.verified ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
              <span className="text-lg">✓</span>
              <span className="font-medium">Verified Captain</span>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Upload your captain&apos;s license, insurance certificate, and other credentials to get verified.
                Verified captains get a badge on their booking page.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 font-medium">Status: Pending Review</p>
                <p className="text-xs text-amber-600 mt-1">
                  To submit documents for verification, email them to{' '}
                  <a href="mailto:support@castoff.boats" className="underline">support@castoff.boats</a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
