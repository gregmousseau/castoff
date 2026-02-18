# ⛵ Cast Off

**Skip the middleman. Save 15% on every booking.**

[castoff.boats](https://www.castoff.boats) — A SaaS booking platform for charter boat operators. Operators keep 100% of their revenue. Customers pay zero platform fees.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase)
![Stripe Connect](https://img.shields.io/badge/Stripe-Connect-635BFF?logo=stripe)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel)

---

## The Problem

Booking marketplaces like GetMyBoat charge operators **11.5–14.5%** per booking *and* customers up to **13% + $20** in service fees. On a $1,000 charter, the platform pockets ~$295. Most small operators don't need a marketplace — their customers find them through referrals and word of mouth. They're paying a tax on relationships they already own.

## The Solution

Cast Off is a **SaaS tool, not a marketplace.** Operators get their own branded booking page with payments flowing directly to their Stripe account. We never touch the money.

| | Marketplaces | Cast Off |
|---|---|---|
| Operator commission | 11.5–14.5% | **0%** |
| Customer service fee | Up to 13% + $20 | **$0** |
| On a $1,000 booking | Platform takes ~$295 | **Platform takes $0** |
| Payment processing | Platform controls | Operator's own Stripe |
| Customer data | Platform owns it | **Operator owns it** |

## Features

**For Customers:**
- Operator directory with ratings, photos, and pricing
- Full booking flow — calendar, time slots, party size, add-ons
- Digital waiver signing
- Message the captain directly
- Transparent cancellation policies

**For Operators:**
- Dashboard — bookings, pricing, calendar, messages, payments
- Stripe Connect Express onboarding (5 min setup)
- Cancellation policies (Flexible / Moderate / Strict)
- Security deposits via auth-only holds
- Captain Protection (no-show coverage)
- Dynamic pricing (seasonal, demand-based)
- Instant booking toggle
- Custom digital waivers
- Verified Captain badges
- SEO meta tags + OG images per operator

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Payments | Stripe Connect Express |
| Email | Resend (transactional) |
| Hosting | Vercel |
| Styling | Tailwind CSS |
| Analytics | Vercel Analytics |

## Getting Started

```bash
# Clone
git clone https://github.com/gregmousseau/charter-direct.git
cd charter-direct

# Install
npm install

# Environment
cp .env.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_SECRET_KEY, etc.

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
Customer → castoff.boats/[operator-slug]/book
                    ↓
            Stripe Checkout (on operator's connected account)
                    ↓
            Money goes directly to operator
                    ↓
            Cast Off gets $0 from the transaction
```

Key design decisions:
- **Stripe Connect Express** — operators own their Stripe accounts and funds
- **SaaS model** — we're a software provider, not a party to the transaction
- **Row Level Security** — operators can only see/edit their own data
- **Server Actions** — all Stripe + Supabase mutations happen server-side

## Competitive Landscape

| Platform | Operator Fee | Customer Fee |
|---|---|---|
| GetMyBoat | 11.5–14.5% | Up to 13% + $20 |
| Boatsetter | ~15% | Service fee |
| Peek Pro | Up to 6% + SaaS | Booking fee |
| FareHarbor | 6% per attendee | — |
| **Cast Off** | **0%** | **$0** |

## Roadmap

- [ ] Pre-trip reminder emails (cron)
- [ ] Post-trip review request emails
- [ ] Google Calendar sync
- [ ] Pro tier billing ($29/mo via Stripe Billing)
- [ ] Operator mobile app

## License

MIT

---

*Built by [Greg Mousseau](https://gregmousseau.com) at [GTA Labs](https://gtalabs.com). AI-assisted development with Claude via [OpenClaw](https://github.com/openclaw/openclaw).*
