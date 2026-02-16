# Cast Off Sprint 3 — Feature Parity + Payment Holds
## Feb 16, 2026

Working directory: ~/pro/charter-direct
Stack: Next.js, Supabase, Stripe Connect, Tailwind

## Context
We're building out List 2 (should-have features) plus a payment hold/escrow feature. The app already has:
- Operator pages fetched from Supabase (`/book/[slug]`)
- Booking calendar with checkout flow
- Stripe Connect onboarding
- Security deposit (auth hold for damages)
- Cancellation policies (flexible/moderate/strict)
- Terms, Privacy pages
- Dashboard with pricing, bookings, calendar, payments pages

Read existing code before making changes. Key files:
- `src/app/book/[slug]/page.tsx` — operator booking page (server component, fetches from Supabase)
- `src/components/BookingCalendar.tsx` — client component with calendar + booking form
- `src/app/api/checkout/route.ts` — creates Stripe checkout session
- `src/app/api/booking/[action]/route.ts` — booking actions (confirm, decline, etc.)
- `src/app/dashboard/` — operator dashboard pages
- `src/lib/supabase/server.ts` — Supabase server client
- `src/lib/stripe.ts` — Stripe client

## Tasks

### 1. Digital Waivers

**Schema** (new migration):
```sql
ALTER TABLE operators ADD COLUMN IF NOT EXISTS waiver_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS waiver_text TEXT;
-- Standard waiver template that operators can customize

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS waiver_signed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS waiver_signer_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS waiver_signer_ip TEXT;
```

**Booking flow update** (`BookingCalendar.tsx`):
- After the booking form fields, before the "Book Now" button, if operator has waiver_enabled:
- Show a collapsible waiver text section (scrollable, max-h-40)
- Checkbox: "I have read and agree to the liability waiver"
- Must be checked to proceed
- Send waiver acceptance data with checkout request

**Dashboard** (`/dashboard/settings` — new page):
- Toggle waiver on/off
- Textarea for custom waiver text
- Default template text: "I understand that boating activities carry inherent risks including but not limited to drowning, injury, and property damage. I voluntarily assume all risks. I release [Business Name], its captain, crew, and agents from all liability for injury, death, or property damage arising from this activity. I confirm I can swim and will follow all safety instructions. I am signing this waiver on behalf of myself and all members of my party."
- Save to operator record via PATCH /api/operators/[slug]

**API update** (`/api/operators/[slug]/route.ts`):
- Support PATCH for waiver_enabled, waiver_text (in addition to existing fields)

### 2. Operator-Customer Messaging

Keep it simple — a contact form that emails both parties. No real-time chat.

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'customer' or 'operator'
  sender_name TEXT,
  sender_email TEXT,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_booking ON messages(booking_id);
CREATE INDEX idx_messages_operator ON messages(operator_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

**"Message the Captain" on booking page** (`/book/[slug]/page.tsx`):
- Below the contact section, add a "Message the Captain" button
- Opens a simple form: name, email, message
- POST to `/api/messages` which stores the message
- In production, this would also email the operator (note: email not wired yet, just store)

**API** (`/api/messages/route.ts`):
- POST: create message (public, no auth needed for customer messages)
- GET: list messages for operator's bookings (auth required, operator only)

**Dashboard** (`/dashboard/messages/page.tsx` — new page):
- List of messages grouped by booking or general inquiries
- Reply button (stores reply message with sender_type='operator')
- Add "Messages" to dashboard nav

### 3. Instant Booking Toggle

**Schema**:
```sql
ALTER TABLE operators ADD COLUMN IF NOT EXISTS instant_booking BOOLEAN DEFAULT FALSE;
```

**Booking flow**: 
- If operator has instant_booking=true:
  - After Stripe checkout, booking status is immediately 'confirmed' (not 'pending')
  - Show "Instant Confirmation" badge on the booking page
  - Skip the operator approval step
- If instant_booking=false (default):
  - Current behavior — booking goes to 'pending', operator confirms/declines

**Booking page** (`/book/[slug]`):
- Show "⚡ Instant Booking" badge near the Book Now button if enabled

**Dashboard settings**:
- Toggle for instant booking in the new settings page

### 4. Add-ons/Upsells During Checkout

The `addons` table already exists in the schema. Wire it up.

**Booking page** (`BookingCalendar.tsx`):
- After selecting a time slot and before the form, show available add-ons
- Each add-on: checkbox, name, price, per_person or flat
- Selected add-ons adjust the displayed total
- Send selected addon IDs with checkout request

**Schema addition**:
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS selected_addons JSONB DEFAULT '[]'::jsonb;
-- Array of {addon_id, name, price, quantity}
```

**Fetch addons**: The BookingCalendar needs to fetch addons. Either:
- Pass them as props from the server component (preferred), or
- Fetch from `/api/operators/[slug]` endpoint

**Approach**: Pass addons as prop from the server component in `/book/[slug]/page.tsx`. Add addons to the Supabase query there, then pass to BookingCalendar.

### 5. Dynamic Pricing UI

The pricing table already has columns for: `dynamic_pricing_enabled`, `seasonal_rules`, `last_minute_discount_percent`, `advance_premium_percent`, `high_demand_threshold`, `high_demand_premium_percent`, `low_availability_premium_percent`.

**Dashboard** (`/dashboard/pricing/page.tsx`):
- Add "Dynamic Pricing" section below the pricing table
- Toggle to enable/disable
- When enabled, show inputs for:
  - Last-minute discount (% off for bookings within 48 hours)
  - Advance booking premium (% extra for bookings 30+ days out)
  - High demand premium (% extra when few slots remain)
- Save via existing PATCH /api/pricing/[id]

**Booking calendar**: 
- When displaying prices in slot selection, apply dynamic pricing rules
- Show original price struck through with adjusted price if different
- Helper function in `src/lib/pricing.ts` to calculate adjusted price

### 6. Operator Verification Badge

**Schema**:
```sql
ALTER TABLE operators ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS verification_docs JSONB DEFAULT '[]'::jsonb;
-- Array of {type: 'license'|'insurance'|'certification', url: string, verified_at: timestamp}
```

**Booking page**: 
- If operator.verified is true, show "✓ Verified Captain" badge next to business name
- Green checkmark, subtle but visible

**Dashboard settings**:
- "Verification" section
- Upload documents (captain's license, insurance certificate, etc.)
- Status: "Pending Review" / "Verified"
- Note: actual verification is manual for now — admin marks as verified

**Directory/OperatorCard**: Show verified badge on cards too

### 7. SEO Meta Tags Per Operator

**`/book/[slug]/page.tsx`**:
- Export `generateMetadata` function
- Title: "{Business Name} — Book Direct | Cast Off"
- Description: first 160 chars of operator.description
- OG image: operator.hero_image
- OG type: "website"
- Twitter card: "summary_large_image"
- Canonical URL: "https://castoff.boats/book/{slug}"

**Homepage** (`/page.tsx`):
- Already has global metadata, but add OG image (use a default hero)

### 8. Payment Hold / Trip Escrow (Captain Protection)

This is the big one. The concept:

**How it works:**
- When customer books, we authorize the FULL trip amount (not just deposit)
- `capture_method: 'manual'` on the operator's connected Stripe account
- If customer pays cash day-of → operator releases the hold (or it auto-expires after 7 days)
- If customer no-shows → operator captures the authorized amount
- If customer doesn't pay remainder → operator captures the authorized amount
- This is SEPARATE from the security deposit (which covers damages)

**Schema**:
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_hold_intent_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_hold_status TEXT DEFAULT 'none';
-- Values: 'none', 'authorized', 'captured', 'released', 'expired'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_hold_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE operators ADD COLUMN IF NOT EXISTS trip_hold_enabled BOOLEAN DEFAULT FALSE;
-- Premium feature - operators opt in
```

**Booking flow**:
- If operator has trip_hold_enabled:
  - During checkout, authorize the full trip amount (not capture)
  - Show customer: "A hold of $X will be placed on your card to secure your booking. This is NOT a charge. If you pay cash day-of, the hold is released."
  - Create PaymentIntent with `capture_method: 'manual'` on connected account

**Dashboard bookings page**:
- For confirmed bookings with active trip holds, show action buttons:
  - "Release Hold" (customer paid cash, all good)
  - "Charge Full Amount" (no-show or didn't pay)
  - "Charge Partial" (partial payment received)
- Each action calls `/api/booking/[action]` with appropriate Stripe capture/cancel

**API updates** (`/api/booking/[action]/route.ts`):
- Add actions: 'release-hold', 'capture-hold', 'partial-capture-hold'
- release-hold: cancel the PaymentIntent
- capture-hold: capture full amount
- partial-capture-hold: capture partial amount (Stripe supports this)

**Dashboard settings**:
- Toggle for trip hold (with explanation that this is a premium/Pro feature)
- Label it as "Captain Protection" or "No-Show Protection"

### 9. Dashboard Settings Page (NEW)

Create `/dashboard/settings/page.tsx` as the central place for:
- Business info (name, description, location, email, phone, WhatsApp)
- Waiver settings (toggle + text)
- Instant booking toggle
- Trip hold / Captain Protection toggle
- Verification document uploads
- Add "Settings" to dashboard nav

## Migration File

Create ONE migration file with all schema changes:
`supabase/migrations/20260217000000_sprint3_features.sql`

Include all ALTERs and CREATE TABLEs listed above.

## Important Notes
- Brand is "Cast Off", domain is castoff.boats, email is support@castoff.boats
- All Stripe operations use operator's connected account via Stripe Connect
- Run `npm run build` to verify — fix any errors
- Run `~/bin/supabase db push --linked` for migration (answer Y)
- Commit and push to origin main when done
- Do NOT start dev server
- Add text-gray-900 to any new input fields for contrast
