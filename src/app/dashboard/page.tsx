'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface DashboardStats {
  pendingBookings: number
  confirmedBookings: number
  totalEarnings: number
  monthlyEarnings: number
}

interface RecentBooking {
  id: string
  customer_name: string
  trip_date: string
  trip_type: string
  status: string
  deposit_amount: number
}

function formatTripType(type: string): string {
  const types: Record<string, string> = {
    half_day_am: 'Half Day AM',
    half_day_pm: 'Half Day PM',
    full_day: 'Full Day',
  }
  return types[type] || type
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingBookings: 0,
    confirmedBookings: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
  })
  const [bookings, setBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await res.json()
      setStats(data.stats)
      setBookings(data.recentBookings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

      // Refresh dashboard data
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking')
    } finally {
      setActionLoading(null)
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening with your bookings.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="mt-1 text-3xl font-bold text-yellow-600">
            {stats.pendingBookings}
          </div>
          {stats.pendingBookings > 0 && (
            <Link href="/dashboard/bookings?status=pending" className="text-xs text-teal-600 hover:underline">
              Review now
            </Link>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Confirmed</div>
          <div className="mt-1 text-3xl font-bold text-green-600">
            {stats.confirmedBookings}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">This Month</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">
            ${stats.monthlyEarnings.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Earnings</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">
            ${stats.totalEarnings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Pending bookings alert */}
      {stats.pendingBookings > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Action Required
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                You have {stats.pendingBookings} pending booking{stats.pendingBookings > 1 ? 's' : ''} waiting for your confirmation.
                Payment will be held for up to 7 days.
              </p>
              <div className="mt-3">
                <Link
                  href="/dashboard/bookings?status=pending"
                  className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                >
                  Review pending bookings
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent bookings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
          <Link href="/dashboard/bookings" className="text-sm text-teal-600 hover:underline">
            View all
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No bookings yet. They&apos;ll appear here when customers book.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <li key={booking.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.customer_name}
                      </p>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatTripType(booking.trip_type)} - {formatDate(booking.trip_date)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(booking.id, 'confirm')}
                          disabled={actionLoading === booking.id}
                          className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50"
                        >
                          {actionLoading === booking.id ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => handleAction(booking.id, 'decline')}
                          disabled={actionLoading === booking.id}
                          className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/pricing"
          className="bg-white shadow rounded-lg p-4 hover:shadow-md transition"
        >
          <h3 className="font-medium text-gray-900">Manage Pricing</h3>
          <p className="text-sm text-gray-500">Update trip prices and deposits</p>
        </Link>

        <Link
          href="/dashboard/calendar"
          className="bg-white shadow rounded-lg p-4 hover:shadow-md transition"
        >
          <h3 className="font-medium text-gray-900">Sync Calendar</h3>
          <p className="text-sm text-gray-500">Connect Google Calendar to auto-block dates</p>
        </Link>

        <Link
          href="/dashboard/payments"
          className="bg-white shadow rounded-lg p-4 hover:shadow-md transition"
        >
          <h3 className="font-medium text-gray-900">Payment Settings</h3>
          <p className="text-sm text-gray-500">Connect Stripe to receive direct payments</p>
        </Link>
      </div>
    </div>
  )
}
