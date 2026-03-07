// Google Calendar integration for checking operator availability

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

interface CalendarEvent {
  id: string
  summary: string
  start: { date?: string; dateTime?: string }
  end: { date?: string; dateTime?: string }
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return null

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    return data.access_token || null
  } catch {
    return null
  }
}

export async function getBlockedDates(
  refreshToken: string,
  calendarId: string,
  startDate: string,
  endDate: string
): Promise<Set<string>> {
  const blockedDates = new Set<string>()

  const accessToken = await refreshAccessToken(refreshToken)
  if (!accessToken) return blockedDates

  try {
    const timeMin = new Date(startDate + 'T00:00:00Z').toISOString()
    const timeMax = new Date(endDate + 'T23:59:59Z').toISOString()

    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`)
    url.searchParams.set('timeMin', timeMin)
    url.searchParams.set('timeMax', timeMax)
    url.searchParams.set('singleEvents', 'true')
    url.searchParams.set('maxResults', '250')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!res.ok) return blockedDates

    const data = await res.json()
    const events: CalendarEvent[] = data.items || []

    for (const event of events) {
      // All-day events use .date, timed events use .dateTime
      if (event.start.date) {
        // All-day event — block the entire date range
        const start = new Date(event.start.date)
        const end = new Date(event.end.date || event.start.date)
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
          blockedDates.add(d.toISOString().slice(0, 10))
        }
      } else if (event.start.dateTime) {
        // Timed event — block that day (operator is busy)
        const date = event.start.dateTime.slice(0, 10)
        blockedDates.add(date)
      }
    }
  } catch (e) {
    console.error('Google Calendar fetch error:', e)
  }

  return blockedDates
}

export function isGoogleCalendarConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
}
