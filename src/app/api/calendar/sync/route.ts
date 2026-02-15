import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Sync calendar events to availability
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    
    // Get operator with calendar credentials
    const { data: operator } = await adminClient
      .from('operators')
      .select('id, google_refresh_token, google_calendar_id')
      .eq('user_id', user.id)
      .single()

    if (!operator?.google_refresh_token) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 })
    }

    // Refresh access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        refresh_token: operator.google_refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 })
    }

    const { access_token } = await tokenResponse.json()

    // Fetch events for the next 90 days
    const now = new Date()
    const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    const eventsResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        operator.google_calendar_id || 'primary'
      )}/events?` +
        new URLSearchParams({
          timeMin: now.toISOString(),
          timeMax: futureDate.toISOString(),
          singleEvents: 'true',
          orderBy: 'startTime',
        }),
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    )

    if (!eventsResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    const { items: events } = await eventsResponse.json()

    // Process events into availability blocks
    const blockedDates: { date: string; slot: string; eventId: string }[] = []

    for (const event of events || []) {
      if (!event.start?.date && !event.start?.dateTime) continue

      const startDate = event.start.date || event.start.dateTime.split('T')[0]
      const endDate = event.end?.date || event.end?.dateTime?.split('T')[0] || startDate

      // Block each day the event spans
      let currentDate = new Date(startDate)
      const endDateObj = new Date(endDate)

      while (currentDate < endDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0]
        
        // Determine which slot to block based on event time
        let slot = 'full_day'
        if (event.start.dateTime) {
          const hour = new Date(event.start.dateTime).getHours()
          if (hour < 12) slot = 'am'
          else slot = 'pm'
        }

        blockedDates.push({
          date: dateStr,
          slot,
          eventId: event.id,
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    // Upsert availability records
    for (const block of blockedDates) {
      await adminClient
        .from('availability')
        .upsert(
          {
            operator_id: operator.id,
            date: block.date,
            slot: block.slot,
            status: 'blocked',
            external_event_id: block.eventId,
          },
          {
            onConflict: 'operator_id,date,slot',
          }
        )
    }

    return NextResponse.json({
      success: true,
      synced: blockedDates.length,
      message: `Synced ${blockedDates.length} calendar events`,
    })
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

// Get sync status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: operator } = await adminClient
      .from('operators')
      .select('google_calendar_id, google_refresh_token')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      connected: !!operator?.google_refresh_token,
      calendarId: operator?.google_calendar_id,
    })
  } catch (error) {
    console.error('Calendar status error:', error)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}
