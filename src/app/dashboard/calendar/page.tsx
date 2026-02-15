'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface CalendarStatus {
  connected: boolean
  calendarId: string | null
}

interface SyncResult {
  success: boolean
  synced: number
  message: string
}

function CalendarContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<CalendarStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const successParam = searchParams.get('success')
  const errorParam = searchParams.get('error')

  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    if (successParam === 'true') {
      setSyncResult({ success: true, synced: 0, message: 'Google Calendar connected successfully!' })
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard/calendar')
    } else if (errorParam) {
      const errorMessages: Record<string, string> = {
        access_denied: 'Access was denied. Please try again.',
        missing_params: 'Authentication failed. Please try again.',
        invalid_state: 'Session expired. Please try again.',
        state_expired: 'Session expired. Please try again.',
        token_exchange_failed: 'Failed to connect. Please try again.',
        unknown: 'An error occurred. Please try again.',
      }
      setError(errorMessages[errorParam] || errorParam)
      window.history.replaceState({}, '', '/dashboard/calendar')
    }
  }, [successParam, errorParam])

  async function fetchStatus() {
    try {
      const res = await fetch('/api/calendar/sync')
      if (!res.ok) {
        throw new Error('Failed to fetch status')
      }
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status')
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    setError(null)

    try {
      const res = await fetch('/api/calendar/sync', {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Sync failed')
      }

      const result = await res.json()
      setSyncResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  function handleConnect() {
    window.location.href = '/api/calendar/auth'
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
        <h1 className="text-2xl font-bold text-gray-900">Calendar Sync</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect Google Calendar to automatically block dates when you&apos;re unavailable.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {syncResult && (
        <div className={`mb-4 p-4 rounded-lg ${
          syncResult.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {syncResult.message}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📅
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900">Google Calendar</h2>

              {status?.connected ? (
                <div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  {status.calendarId && (
                    <p className="text-sm text-gray-500 mt-1">
                      Calendar: {status.calendarId}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="text-sm text-gray-500">Not connected</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {status?.connected ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  onClick={handleConnect}
                  className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Reconnect Account
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Connect Google Calendar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800">How Calendar Sync Works</h3>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>We read events from your Google Calendar (read-only access).</li>
          <li>Dates with events are automatically marked as unavailable for bookings.</li>
          <li>Full-day events block the entire day. Timed events block AM or PM slots.</li>
          <li>Sync manually whenever you need to update availability.</li>
        </ul>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800">Privacy Note</h3>
        <p className="mt-1 text-sm text-yellow-700">
          We only access your calendar to check when you&apos;re busy. We don&apos;t read event details,
          attendees, or other private information. You can disconnect at any time.
        </p>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
      </div>
    }>
      <CalendarContent />
    </Suspense>
  )
}
