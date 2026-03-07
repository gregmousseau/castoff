'use client'

import { useEffect, useState, useRef } from 'react'

const DEFAULT_WAIVER = `I understand that boating activities carry inherent risks including but not limited to drowning, injury, and property damage. I voluntarily assume all risks. I release [Business Name], its captain, crew, and agents from all liability for injury, death, or property damage arising from this activity. I confirm I can swim and will follow all safety instructions. I am signing this waiver on behalf of myself and all members of my party.`

interface OperatorSettings {
  business_name: string
  description: string
  location: string
  email: string
  phone: string
  whatsapp: string
  hero_image: string
  waiver_enabled: boolean
  waiver_text: string
  instant_booking: boolean
  trip_hold_enabled: boolean
  verified: boolean
  verification_docs: { type: string; url: string; verified_at: string | null }[]
  payment_method: string
  paypal_email: string
  paypal_merchant_id: string
  google_calendar_id: string
}

interface BoatPhoto {
  url: string
  caption?: string
  order: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OperatorSettings>({
    business_name: '',
    description: '',
    location: '',
    email: '',
    phone: '',
    whatsapp: '',
    hero_image: '',
    waiver_enabled: false,
    waiver_text: DEFAULT_WAIVER,
    instant_booking: false,
    trip_hold_enabled: false,
    verified: false,
    verification_docs: [],
    payment_method: 'stripe',
    paypal_email: '',
    paypal_merchant_id: '',
    google_calendar_id: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [slug, setSlug] = useState('')
  const [boatPhotos, setBoatPhotos] = useState<BoatPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

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
            hero_image: data.operator.hero_image || '',
            waiver_enabled: data.operator.waiver_enabled || false,
            waiver_text: data.operator.waiver_text || DEFAULT_WAIVER,
            instant_booking: data.operator.instant_booking || false,
            trip_hold_enabled: data.operator.trip_hold_enabled || false,
            verified: data.operator.verified || false,
            verification_docs: data.operator.verification_docs || [],
            payment_method: data.operator.payment_method || 'stripe',
            paypal_email: data.operator.paypal_email || '',
            paypal_merchant_id: data.operator.paypal_merchant_id || '',
            google_calendar_id: data.operator.google_calendar_id || '',
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
          payment_method: settings.payment_method,
          paypal_email: settings.paypal_email,
          paypal_merchant_id: settings.paypal_merchant_id,
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

        {/* Photos */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>

          {/* Hero Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
            {settings.hero_image && (
              <div className="relative w-full h-40 mb-2 rounded-lg overflow-hidden bg-gray-100">
                <img src={settings.hero_image} alt="Hero" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploading(true)
                const formData = new FormData()
                formData.append('file', file)
                formData.append('type', 'hero')
                try {
                  const res = await fetch('/api/upload', { method: 'POST', body: formData })
                  if (res.ok) {
                    const data = await res.json()
                    setSettings(s => ({ ...s, hero_image: data.url }))
                  } else {
                    alert('Upload failed')
                  }
                } catch { alert('Upload failed') }
                finally { setUploading(false) }
              }}
            />
            <button
              type="button"
              onClick={() => heroInputRef.current?.click()}
              disabled={uploading}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : settings.hero_image ? 'Replace Hero Image' : 'Upload Hero Image'}
            </button>
          </div>

          {/* Boat Photos Gallery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Boat Photos</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {boatPhotos.map((photo, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={photo.url} alt={photo.caption || `Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setBoatPhotos(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={async (e) => {
                e.preventDefault()
                setDragOver(false)
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
                for (const file of files) {
                  setUploading(true)
                  const formData = new FormData()
                  formData.append('file', file)
                  formData.append('type', 'photo')
                  try {
                    const res = await fetch('/api/upload', { method: 'POST', body: formData })
                    if (res.ok) {
                      const data = await res.json()
                      setBoatPhotos(prev => [...prev, { url: data.url, order: prev.length }])
                    }
                  } catch { /* ignore */ }
                  finally { setUploading(false) }
                }
              }}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => photoInputRef.current?.click()}
            >
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || [])
                  for (const file of files) {
                    setUploading(true)
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('type', 'photo')
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: formData })
                      if (res.ok) {
                        const data = await res.json()
                        setBoatPhotos(prev => [...prev, { url: data.url, order: prev.length }])
                      }
                    } catch { /* ignore */ }
                    finally { setUploading(false) }
                  }
                }}
              />
              <p className="text-sm text-gray-500">
                {uploading ? 'Uploading...' : 'Drag & drop photos here, or click to browse'}
              </p>
            </div>
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

        {/* Payment Method */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Accept Payments Via</label>
            <div className="flex gap-3">
              {(['stripe', 'paypal', 'both'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSettings({ ...settings, payment_method: method })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.payment_method === method
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {method === 'stripe' ? 'Stripe' : method === 'paypal' ? 'PayPal' : 'Both'}
                </button>
              ))}
            </div>
          </div>
          {(settings.payment_method === 'paypal' || settings.payment_method === 'both') && (
            <div className="space-y-3 mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">PayPal Configuration</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Business Email</label>
                <input
                  type="email"
                  value={settings.paypal_email}
                  onChange={(e) => setSettings({ ...settings, paypal_email: e.target.value })}
                  placeholder="your-business@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-400 mt-1">The email associated with your PayPal Business account. Payments will be sent here.</p>
              </div>
            </div>
          )}
        </div>

        {/* Google Calendar */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">📅 Calendar Sync</h2>
          {settings.google_calendar_id ? (
            <div>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3 mb-3">
                <span className="text-lg">✓</span>
                <span className="font-medium">Google Calendar connected</span>
              </div>
              <p className="text-sm text-gray-500">
                Your calendar is synced. Dates with events will automatically be blocked from bookings.
              </p>
              <button
                type="button"
                onClick={() => window.location.href = '/api/calendar/auth'}
                className="mt-3 text-sm text-teal-600 hover:underline"
              >
                Reconnect calendar
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Connect your Google Calendar to automatically block dates when you have events scheduled.
                Customers won&apos;t be able to book on days you&apos;re busy.
              </p>
              <button
                type="button"
                onClick={() => window.location.href = '/api/calendar/auth'}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Connect Google Calendar
              </button>
            </div>
          )}
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
