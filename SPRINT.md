# Charter Direct Sprint - Feb 15, 2026

## Context
- Charter booking site for boat operators (first customer: Angelo in Bahamas)
- Next.js 16 + Supabase + Stripe
- Dashboard exists with mock data, need to wire up real features

## Sprint Goals

### 1. Google Calendar Integration
Wire up the existing `/api/calendar/*` routes to actually work:

**Auth Flow:**
- `/api/calendar/auth` - Redirect to Google OAuth consent
- `/api/calendar/callback` - Handle OAuth callback, store refresh token in `operators.google_refresh_token`
- Dashboard button to "Connect Google Calendar"

**Sync Logic:**
- `/api/calendar/sync` - Pull events from operator's calendar
- For each event that blocks time, create/update `availability` records with `status='blocked'`
- Store `external_event_id` to avoid duplicates

**Dashboard UI:**
- Add calendar settings section or page
- Show sync status, last synced time
- Button to manually trigger sync
- Eventually: auto-sync via cron (but manual first)

**Env vars needed:**
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET  
- GOOGLE_REDIRECT_URI (set to https://charter-direct.vercel.app/api/calendar/callback)

### 2. Price Management Dashboard
Create `/dashboard/pricing` page:

**Display:**
- Show current pricing from `pricing` table (half_day_am, half_day_pm, full_day)
- Each row: trip type, duration, time range, base price, deposit

**Edit:**
- Inline edit or modal to update prices
- Save to Supabase via API route
- Validate: price > 0, deposit <= price

**API:**
- `GET /api/pricing` - Get operator's pricing (use auth to get operator_id)
- `PATCH /api/pricing/[id]` - Update a pricing record

### 3. Wire Dashboard to Real Data
Replace mock data in dashboard with real Supabase queries:

**Main dashboard (`/dashboard/page.tsx`):**
- Fetch pending/confirmed booking counts from `bookings` table
- Fetch recent bookings (last 10)
- Calculate earnings from confirmed bookings

**Bookings page (`/dashboard/bookings/page.tsx`):**
- Fetch real bookings from Supabase
- Wire up Confirm/Decline buttons to update booking status
- On confirm: capture Stripe payment hold
- On decline: release Stripe payment hold

## Technical Notes
- Use `@supabase/ssr` for server components
- Operator ID comes from auth user -> lookup in operators table by user_id
- RLS policies already set up for operator access

## Files to Reference
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client (if exists, else create)
- `supabase/migrations/20260212000000_initial_schema.sql` - DB schema

## When Done
Run: `openclaw gateway wake --text "Sprint done: GCal integration + pricing management + real dashboard data" --mode now`
