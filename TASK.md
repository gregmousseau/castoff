# Cast Off - Feature Sprint

## Overview
Cast Off (castoff.boats) is a SaaS boat charter booking platform. We need several updates to support a Bahamas-based operator (Angelo) and improve the platform generally.

**Stack:** Next.js (App Router), Supabase (project: uilrqoqlygacdenypbgq), Stripe Connect, Resend, Vercel
**Repo:** ~/pro/castoff
**Supabase CLI:** ~/bin/supabase (already linked to the project)

## Tasks (in order of priority)

### 1. Schema Updates - Per-Person Pricing & Flexible Durations

The current pricing model has fixed trip types (half_day_am, half_day_pm, full_day). We need a more flexible model.

**Add columns to `pricing` table:**
- `included_guests` INT DEFAULT NULL — number of guests included in base price
- `extra_person_fee` DECIMAL(10,2) DEFAULT 0 — cost per additional person above threshold
- `custom_start_time` BOOLEAN DEFAULT FALSE — whether customer can request their own start time
- `default_start_time` TIME DEFAULT '09:00' — default start time shown to customers

**Add columns to `operators` table:**
- `payment_method` TEXT DEFAULT 'stripe' — 'stripe', 'paypal', or 'both'
- `paypal_email` TEXT — PayPal email for receiving payments
- `paypal_merchant_id` TEXT — PayPal merchant ID (from PayPal Connect)
- `is_admin` BOOLEAN DEFAULT FALSE — super admin flag (can access any operator dashboard)
- `max_trips_per_day` INT DEFAULT 3 — how many trips per day this operator runs

**Add column to `bookings` table:**
- `payment_provider` TEXT DEFAULT 'stripe' — which provider was used for this booking

Create a new Supabase migration file: `supabase/migrations/20260307000000_flexible_pricing.sql`

### 2. Angelo's Operator Setup

After the migration, update Angelo's data. Angelo's operator slug is `angelo`.

**Update Angelo's pricing records:**
- DEACTIVATE or DELETE the `half_day_pm` record
- Update/create these trip types:

| trip_type | display_name | duration_hours | base_price | included_guests | extra_person_fee | default_start_time |
|-----------|-------------|----------------|------------|-----------------|------------------|--------------------|
| starter | Starter Tour | 3 | 900 | 8 | 125 | 09:00 |
| half_day | Half Day Tour | 4 | 1200 | 8 | 125 | 09:00 |
| full_day | Full Day Tour | 8 | 2500 | 8 | 125 | 09:00 |

- Set `custom_start_time = true` for all Angelo's pricing
- Set Angelo's `max_trips_per_day = 1`
- Update Angelo's description to mention tours are private and can be curated to guests' liking

**Create this as a separate migration:** `supabase/migrations/20260307010000_angelo_pricing.sql`

### 3. Update Booking Flow for Per-Person Pricing

**BookingCalendar.tsx:**
- When an operator has `included_guests` set on pricing, show "Price covers X guests" 
- When party size exceeds included_guests, show the extra person fee calculation
- Example: "Base: $900 (up to 8 guests) + 2 extra guests × $125 = $1,150"
- The slot selection should show the pricing records from the database, NOT the hardcoded SLOT_LABELS
- Remove the hardcoded mockAvailability — fetch real availability from the API
- Allow customers to request a start time if `custom_start_time` is true (default shown, but editable)

**Checkout API (src/app/api/checkout/route.ts):**
- Calculate total including extra person fees
- Pass the correct amount to Stripe/PayPal

### 4. Photo Upload in Dashboard

**Use Google Cloud Storage** (not Supabase Storage) for photo uploads. We'll be applying for GCP startup credits.

**Setup:**
- Create a GCS utility at `src/lib/gcs.ts`
- Bucket name: `castoff-photos` (will need env var `GCS_BUCKET_NAME`, `GCS_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS` or `GCS_SERVICE_ACCOUNT_KEY`)
- For now, stub out the GCS upload with a TODO and use a local `/api/upload` endpoint that stores to Supabase Storage as fallback until GCS credentials are configured

**Dashboard Settings page additions:**
- Add a "Photos" section to the dashboard settings page
- Hero image upload (single image, replaces current)
- Boat photos gallery (drag to reorder, add/remove)
- Show thumbnails of current photos
- Upload via drag-and-drop or file picker

### 5. Super Admin Access

**Create admin user in Supabase:**
- Email: admin@castoff.boats
- Password: C0@dm1n@^
- Set `is_admin = true` on the corresponding operator record (or create an admin-only record)

**Dashboard middleware/layout changes:**
- In `src/app/dashboard/layout.tsx`, check if the logged-in user has `is_admin = true`
- If admin, allow them to switch between operators (dropdown in dashboard header)
- Admin can view/edit any operator's settings, pricing, bookings, etc.
- Add an admin-only route: `/dashboard/admin/operators` to list all operators

### 6. PayPal Integration (scaffold only for now)

**This is a scaffold — we'll wire up real PayPal API calls later once Angelo has his PayPal Business account set up.**

**Operator Settings:**
- Add PayPal section to dashboard settings
- Toggle between Stripe/PayPal/Both
- If PayPal selected, show field for PayPal email/merchant ID

**Checkout flow:**
- If operator uses PayPal, show PayPal button instead of (or alongside) Stripe
- Create `src/lib/paypal.ts` with placeholder functions matching the Stripe pattern
- Scaffold the PayPal checkout session creation (use PayPal JS SDK / REST API pattern)

**Environment variables needed (add to .env.example):**
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE` (sandbox/live)

## Important Notes

- Run `~/bin/supabase db push` after creating migrations to apply them
- The app runs with `npx next dev` on port 3000
- Don't break existing functionality — the booking flow for Stripe operators must still work
- Keep the teal/sky color scheme consistent
- Use TypeScript strictly — no `any` types
- Test by visiting http://localhost:3000/book/angelo after changes

## File Structure Reference
```
src/
  app/
    api/checkout/route.ts      — checkout/payment flow
    api/pricing/route.ts       — pricing CRUD
    api/operators/[slug]/route.ts — operator CRUD  
    book/[slug]/page.tsx       — public booking page
    dashboard/
      layout.tsx               — dashboard wrapper (auth check)
      settings/page.tsx        — operator settings
      pricing/page.tsx         — pricing management
  components/
    BookingCalendar.tsx         — booking calendar + form
  lib/
    stripe.ts                  — Stripe helpers
    pricing.ts                 — dynamic pricing engine
    types.ts                   — TypeScript interfaces
    supabase/server.ts         — Supabase server client
```
