import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getBlockedDates } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!slug || !start || !end) {
      return NextResponse.json({ error: 'Missing slug, start, or end' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get operator
    const { data: operator } = await supabase
      .from('operators')
      .select('id, max_trips_per_day, google_calendar_id, google_refresh_token')
      .eq('slug', slug)
      .single()

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
    }

    // Get active pricing (trip types this operator offers)
    const { data: pricing } = await supabase
      .from('pricing')
      .select('trip_type')
      .eq('operator_id', operator.id)
      .eq('active', true)

    const tripTypes = pricing?.map(p => p.trip_type) || []

    // Get existing bookings — only confirmed bookings block availability
    const { data: bookings } = await supabase
      .from('bookings')
      .select('trip_date, trip_type')
      .eq('operator_id', operator.id)
      .gte('trip_date', start)
      .lte('trip_date', end)
      .eq('status', 'confirmed')

    // Get blocked dates from availability table (manual blocks)
    const { data: blocked } = await supabase
      .from('availability')
      .select('date, slot')
      .eq('operator_id', operator.id)
      .eq('status', 'blocked')
      .gte('date', start)
      .lte('date', end)

    // Get blocked dates from Google Calendar (if connected)
    let calendarBlockedDates = new Set<string>()
    if (operator.google_refresh_token && operator.google_calendar_id) {
      calendarBlockedDates = await getBlockedDates(
        operator.google_refresh_token,
        operator.google_calendar_id,
        start,
        end
      )
    }

    const maxTrips = operator.max_trips_per_day ?? 3

    // Build availability map
    const availability: Record<string, string[]> = {}
    const startDate = new Date(start)
    const endDate = new Date(end)

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().slice(0, 10)

      // Skip if blocked by Google Calendar
      if (calendarBlockedDates.has(dateKey)) continue

      const dateBookings = bookings?.filter(b => b.trip_date === dateKey) || []
      const blockedSlots = blocked?.filter(b => b.date === dateKey).map(b => b.slot) || []

      if (dateBookings.length >= maxTrips) continue

      const bookedTypes = dateBookings.map(b => b.trip_type)
      const availableTypes = tripTypes.filter(t =>
        !bookedTypes.includes(t) && !blockedSlots.includes(t)
      )

      if (availableTypes.length > 0) {
        availability[dateKey] = availableTypes
      }
    }

    return NextResponse.json({ availability })
  } catch (error) {
    console.error('Availability error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
