'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  trip_date: string
  trip_type: string
  party_size: number
  status: string
  deposit_status: string
  deposit_amount: number
  final_price: number | null
  special_requests: string | null
  trip_hold_status: string | null
  trip_hold_intent_id: string | null
  trip_hold_amount: number | null
  created_at: string
}

function formatTripType(type: string): string {
  const types: Record<string, string> = {
    half_day_am: 'Half Day AM (8am-12pm)',
    half_day_pm: 'Half Day PM (1pm-5pm)',
    full_day: 'Full Day (8am-5pm)',
  }
  return types[type] || type
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    declined: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded border ${colors[status] || 'bg-gray-100'}`}>
      {status.toUpperCase()}
    </span>
  )
}

function BookingsContent() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      const url = statusFilter
        ? `/api/bookings?status=${statusFilter}`
        : '/api/bookings'
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch bookings')
      }
      const data = await res.json()
      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  async function handleAction(bookingId: string, action: 'confirm' | 'decline') {
    setActionLoading(bookingId)
    setError(null)

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update booking')
      }

      // Refresh bookings list
      await fetchBookings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex space-x-2">
        <Link
          href="/dashboard/bookings"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            !statusFilter ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </Link>
        <Link
          href="/dashboard/bookings?status=pending"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending
        </Link>
        <Link
          href="/dashboard/bookings?status=confirmed"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            statusFilter === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Confirmed
        </Link>
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Customer & trip info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.customer_name}
                      </h3>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{booking.customer_email}</p>
                      {booking.customer_phone && <p>{booking.customer_phone}</p>}
                      <p>{booking.party_size} guest{booking.party_size > 1 ? 's' : ''}</p>
                    </div>

                    {booking.special_requests && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-sm">
                        <strong>Special requests:</strong> {booking.special_requests}
                      </div>
                    )}
                  </div>

                  {/* Trip details */}
                  <div className="sm:text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDate(booking.trip_date)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTripType(booking.trip_type)}
                    </div>
                    <div className="mt-2 text-lg font-bold text-teal-600">
                      ${booking.final_price?.toLocaleString() || booking.deposit_amount}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${booking.deposit_amount} deposit {booking.deposit_status === 'authorized' ? '(on hold)' : '(captured)'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {/* Trip Hold Actions */}
                {booking.status === 'confirmed' && booking.trip_hold_status === 'authorized' && booking.trip_hold_intent_id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-purple-800 mb-2">
                      🛡️ Trip Hold: ${booking.trip_hold_amount?.toLocaleString()} authorized
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={async () => {
                          setActionLoading(booking.id)
                          try {
                            await fetch(`/api/booking/release-hold`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ paymentIntentId: booking.trip_hold_intent_id }),
                            })
                            await fetchBookings()
                          } catch { /* */ } finally { setActionLoading(null) }
                        }}
                        disabled={actionLoading === booking.id}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Release Hold (Paid Cash)
                      </button>
                      <button
                        onClick={async () => {
                          setActionLoading(booking.id)
                          try {
                            await fetch(`/api/booking/capture-hold`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ paymentIntentId: booking.trip_hold_intent_id }),
                            })
                            await fetchBookings()
                          } catch { /* */ } finally { setActionLoading(null) }
                        }}
                        disabled={actionLoading === booking.id}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Charge Full Amount (No-Show)
                      </button>
                    </div>
                  </div>
                )}

                {booking.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleAction(booking.id, 'confirm')}
                      disabled={actionLoading === booking.id}
                      className="flex-1 sm:flex-none px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === booking.id ? 'Processing...' : 'Confirm Booking'}
                    </button>
                    <button
                      onClick={() => handleAction(booking.id, 'decline')}
                      disabled={actionLoading === booking.id}
                      className="flex-1 sm:flex-none px-6 py-2 bg-white text-red-600 font-medium rounded-lg border border-red-300 hover:bg-red-50 disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <p className="text-xs text-gray-500 self-center">
                      Declining releases the hold - customer is not charged.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default function BookingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your trip bookings and reservations.
        </p>
      </div>

      <Suspense fallback={
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
        </div>
      }>
        <BookingsContent />
      </Suspense>
    </div>
  )
}
