import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`

// Handle Google OAuth callback
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/calendar?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard/calendar?error=missing_params', request.url)
    )
  }

  try {
    // Verify state
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== stateData.userId) {
      return NextResponse.redirect(
        new URL('/dashboard/calendar?error=invalid_state', request.url)
      )
    }

    // Check state timestamp (expire after 10 minutes)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/dashboard/calendar?error=state_expired', request.url)
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/dashboard/calendar?error=token_exchange_failed', request.url)
      )
    }

    const tokens = await tokenResponse.json()
    const { refresh_token, access_token } = tokens

    // Get list of calendars
    const calendarsResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    )

    const calendarsData = await calendarsResponse.json()
    const primaryCalendar = calendarsData.items?.find(
      (cal: { primary?: boolean; id: string }) => cal.primary
    )

    // Store refresh token in database
    const adminClient = createAdminClient()
    await adminClient
      .from('operators')
      .update({
        google_refresh_token: refresh_token,
        google_calendar_id: primaryCalendar?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.redirect(
      new URL('/dashboard/calendar?success=true', request.url)
    )
  } catch (error) {
    console.error('Calendar callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/calendar?error=unknown', request.url)
    )
  }
}
