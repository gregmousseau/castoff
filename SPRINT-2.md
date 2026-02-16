# Charter Direct Sprint 2 - Feb 16, 2026

## Context
Charter Direct is pivoting from commission model to **SaaS subscription** model.
- Operators connect their own Stripe via Stripe Connect Express
- Money flows customer → operator directly (we never touch it)
- We charge a monthly subscription for premium features
- Security deposit feature via Stripe auth-only holds on operator's connected account

## Goals

### 1. Security Deposit Feature

Add operator-configurable security deposit (damage protection).

**Schema changes** (new migration):
```sql
ALTER TABLE operators ADD COLUMN security_deposit_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE operators ADD COLUMN security_deposit_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE bookings ADD COLUMN security_deposit_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN security_deposit_intent_id TEXT;
ALTER TABLE bookings ADD COLUMN security_deposit_status TEXT DEFAULT 'none'; -- 'none', 'authorized', 'captured', 'released'
```

**Dashboard UI** (`/dashboard/pricing` page):
- Add "Security Deposit" section below pricing
- Toggle on/off
- Amount input (default $0, operator sets amount like $500)
- Help text: "A hold will be placed on the customer's card. Only captured if you file a damage claim within 48 hours of the trip."

**Booking flow updates** (`/book/[slug]` page):
- If operator has security deposit enabled, show it clearly in the booking summary
- "A refundable security deposit of $X will be authorized (not charged) on your card"
- During checkout, create a separate PaymentIntent with `capture_method: 'manual'` for the security deposit on the operator's connected account

**API routes:**
- `PATCH /api/operators/[slug]` — update security_deposit_enabled and security_deposit_amount
- `/api/booking/[action]` — add 'release-deposit' and 'capture-deposit' actions
- Auto-release deposit 48 hours after trip if no claim filed (note for future cron)

### 2. "Greg's Charters" Test Profile

Create a new operator profile for testing the full flow.

**Insert into Supabase** (via migration or seed):
```sql
INSERT INTO operators (slug, business_name, email, phone, location, description, hero_image, claimed, source_platform)
VALUES (
  'gregs-charters',
  'Greg''s Charters',
  'greg@gregmousseau.com',
  '+1-416-555-0199',
  'Toronto, Ontario, Canada',
  'Sail the Toronto Harbour on our beautiful 32ft sailboat. Perfect for sunset cruises, corporate events, or a relaxing day on Lake Ontario. Captain Greg has been sailing the harbour for over a decade.',
  '/images/operators/gregs-charters-hero.jpg',
  false,
  'manual'
);

-- Get the operator ID and insert boat
INSERT INTO boats (operator_id, name, type, capacity, features, is_primary)
SELECT id, 'Lake Breeze', 'Sailboat', 8, 
  '["32ft Sailboat", "Full Electronics Suite", "Bluetooth Speakers", "Covered Cockpit", "Snorkeling Gear", "Cooler with Ice"]'::jsonb,
  true
FROM operators WHERE slug = 'gregs-charters';

-- Pricing (same model as Angelo)
INSERT INTO pricing (operator_id, trip_type, display_name, duration_hours, start_time, end_time, base_price, deposit_amount, active)
SELECT id, 'half_day_am', 'Half Day Morning', 4, '08:00', '12:00', 600, 100, true FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'half_day_pm', 'Half Day Afternoon', 4, '13:00', '17:00', 600, 100, true FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'full_day', 'Full Day', 8, '08:00', '16:00', 1000, 200, true FROM operators WHERE slug = 'gregs-charters';

-- Inclusions
INSERT INTO inclusions (operator_id, name, included)
SELECT id, unnest(ARRAY['Captain & Crew', 'Life Jackets', 'Cooler with Ice', 'Bluetooth Sound System', 'Snorkeling Equipment', 'Fishing Rod Rental']),
       unnest(ARRAY[true, true, true, true, true, false])
FROM operators WHERE slug = 'gregs-charters';

-- Some fake reviews
INSERT INTO reviews (operator_id, reviewer_name, rating, review_text, review_date, source)
SELECT id, 'Sarah M.', 5, 'Amazing sunset cruise! Captain Greg was incredibly knowledgeable about the harbour. The boat was spotless and the whole experience was unforgettable.', '2025-12-15', 'direct' FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'Mike & Lisa', 5, 'We booked the full day for our anniversary and it was perfect. Greg knows all the best spots on the lake. Highly recommend!', '2025-11-20', 'direct' FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'James T.', 4, 'Great experience overall. Beautiful boat, friendly captain. Only reason for 4 stars is we hit some choppy water but Greg handled it like a pro.', '2025-10-08', 'direct' FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'The Patel Family', 5, 'Took our kids (ages 8 and 11) and they had an absolute blast. Greg was patient and let them help with the sails. Made lifelong memories!', '2025-09-22', 'direct' FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'David K.', 5, 'Used Greg''s Charters for a corporate team outing. 10/10. Professional, fun, and the Toronto skyline from the water is unreal.', '2025-08-14', 'direct' FROM operators WHERE slug = 'gregs-charters';
```

### 3. Directory / Landing Page

Transform the home page (`/page.tsx`) into a proper landing page + directory.

**Landing page sections:**
1. **Hero:** "Book Direct with Local Charter Operators" — subtitle: "Skip the middleman. Save 15% on every booking."
2. **How it works:** 3 steps (Browse → Book → Enjoy), show savings vs marketplace fees
3. **Directory:** Grid of operator cards (photo, name, location, rating, starting price)
4. **For Operators section:** "Own your bookings" — Free tier vs Pro tier comparison
5. **Footer:** Links, legal, etc.

**Directory features:**
- `/directory` or just on the homepage
- Server-rendered list of all operators from Supabase
- Each card links to `/book/[slug]`
- Search by location (future: full-text search)
- Sort by rating, price

**Operator card component:**
- Hero image
- Business name
- Location
- Star rating (avg)
- Starting price ("from $X")
- "Book Now" button

### 4. Subscription Tiers (Mock UI, Wire Later)

**Pricing page** (`/pricing` or section on landing page):

| Feature | Free | Pro ($29/mo) |
|---------|------|-------------|
| Booking page | ✅ | ✅ |
| Listed in directory | ✅ | ✅ |
| Accept payments (Stripe Connect) | ✅ | ✅ |
| Priority in search results | ❌ | ✅ |
| SEO optimization | ❌ | ✅ |
| Custom domain | ❌ | ✅ |
| Analytics dashboard | Basic | Advanced |
| Review management | ❌ | ✅ |
| Google Calendar sync | ❌ | ✅ |

**Dashboard upsell:**
- Show "Upgrade to Pro" banner in free tier dashboard
- Pro features greyed out with lock icon

### 5. Stripe Connect Flow Improvements

The existing `/api/connect/onboard` looks good. Need to:
- Add `/dashboard/payments` page (return/refresh URL for Stripe onboarding)
- Show Stripe connection status on dashboard
- Allow re-triggering onboarding if incomplete
- Update country detection (currently hardcoded 'BS' for Bahamas — should detect from operator.location or let them choose)

### 6. Claim Flow Enhancement

Current claim flow is good (token → email verify → password → account). Enhancements:
- Add "Claim This Page" button visible on unclaimed operator pages (`/book/[slug]`)
- For unclaimed pages, show banner: "Are you the owner? Claim this page to manage bookings"
- Generate claim tokens for all operators on creation
- Self-serve claim: if operator doesn't have email on file, allow them to submit proof (business license, photo of boat with code, etc.) — this is the industry standard for Google Business-style claiming

**Industry standard for profile claiming:**
1. Email verification (if we have their email) ← already built
2. Phone verification (SMS code)
3. Document verification (business license upload)
4. Physical verification (postcard with code — overkill for us)
5. Social proof (link to existing listing on GetMyBoat/Google showing same business)

For MVP: email verification + "contact support" fallback is fine.

## Technical Notes
- All Stripe operations should use the operator's connected account (Stripe Connect)
- Payment intents for bookings: create on connected account with `application_fee_amount: 0` (free tier)
- Security deposits: separate PaymentIntent with `capture_method: 'manual'` on connected account
- Use `@supabase/ssr` for server components
- New migration file: `supabase/migrations/20260216000000_security_deposit_and_gregs.sql`

## File Structure Expected
```
src/app/
  page.tsx                    — Landing page + directory
  pricing/page.tsx            — Pricing tiers page
  directory/page.tsx          — Full directory (optional, can be on homepage)
  book/[slug]/page.tsx        — Update with security deposit display
  dashboard/
    payments/page.tsx         — NEW: Stripe Connect status & management
    pricing/page.tsx          — Update with security deposit toggle
  api/
    operators/route.ts        — NEW: List operators for directory
    operators/[slug]/route.ts — Update: PATCH for security deposit settings
    booking/[action]/route.ts — Update: add release-deposit, capture-deposit
src/components/
  OperatorCard.tsx            — NEW: Card component for directory
  PricingTable.tsx            — NEW: Subscription tier comparison
```

## When Done
Run: `openclaw gateway wake --text "Sprint 2 done: Security deposit, Greg's Charters profile, directory, subscription tiers, Stripe Connect improvements" --mode now`
