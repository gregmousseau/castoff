# Case Study: Charter Direct
## How We Built a Marketplace Disruptor in One Evening

---

### The Problem

Angelo runs boat tours in the Bahamas. He's listed on GetMyBoat, which takes **11.5-14.5%** of every booking. On a $1,000 full-day charter, that's $115-145 gone before he sees a dime.

The platforms justify these fees with:
- Customer discovery (search traffic)
- Trust signals (reviews, verification)
- Payment processing
- Customer support

But here's the thing: **Angelo doesn't need discovery anymore.** His customers find him through WhatsApp referrals, word of mouth, and repeat business. He's paying a 15% tax on relationships he already owns.

---

### The Insight

The value of marketplace SaaS is shifting.

**Old model:** Pay for access to the platform's audience  
**New model:** Pay for the tools to own your own audience

GetMyBoat isn't selling boat rentals. They're selling:
1. A booking widget
2. Payment processing
3. A profile page

All of which can be built in an evening with modern tools.

---

### What We Built

**Charter Direct** — A Calendly-style booking page for boat operators.

**Time to build:** ~4 hours  
**Total cost:** $0 (Vercel free tier + Stripe's 2.9%)  
**Tech:** Next.js, Tailwind, Stripe, Supabase (pending)

#### The Payment Innovation

The secret sauce: **Stripe's auth-only capture.**

```
Customer books → Stripe AUTHORIZES $100 deposit (not charged)
                          ↓
              Operator confirms booking?
                    ↓           ↓
                  YES           NO
                   ↓             ↓
            Capture $100    Cancel auth
            (2.9% fee)      ($0 fees)
```

If the operator can't accommodate, they release the hold. **No refund. No chargeback. No fees.**

This solves the "deposit problem" that plagues small operators:
- Traditional: Charge deposit → refund if cancelled → eat the fees + chargeback risk
- Charter Direct: Authorize deposit → release if cancelled → zero cost

#### Pricing Model

We give operators a choice on the remainder:

| Payment Method | Fee | Why |
|----------------|-----|-----|
| Cash (day of trip) | 0% | Operator keeps everything |
| Card (through site) | 5% | Covers Stripe + cancellation protection |

The 5% card fee funds:
- Stripe's 2.9% + $0.30
- Our margin (~2%)
- "Cancellation protection" positioning (value framing)

---

### The "SaaS is Dead" Angle

People say "SaaS is dead." That's wrong. What's dying is **rent-seeking SaaS** — platforms that extract value without adding proportional value.

#### The Old Playbook (Dying)
1. Build a marketplace
2. Aggregate supply and demand
3. Take 15-35% of every transaction forever
4. Defend with network effects

#### The New Playbook (Rising)
1. Build tools that let SMEs own their customer relationships
2. Charge for the tool, not the transaction
3. Win by making customers successful, not dependent

**GetMyBoat's moat:** Network effects, SEO, brand trust  
**Charter Direct's moat:** Operator loyalty (we made them money)

---

### Strategic Implications for GTA Labs

This isn't just a boat booking app. It's a **template for marketplace disruption.**

#### The Pattern
Every industry has a "GetMyBoat" — a platform taking 15-30% from small operators:
- **Restaurants:** DoorDash, UberEats (30%)
- **Hotels:** Booking.com, Expedia (15-25%)
- **Services:** Thumbtack, Angi (15-20%)
- **Rentals:** Airbnb (14-20%)
- **Events:** Eventbrite (5-10% + fees)

#### The Opportunity
**"We'll build you a booking page that saves you $X,000/year in platform fees."**

Sales pitch to operators:
- "You're paying GetMyBoat $5,000/year in fees"
- "We'll build you your own booking page for $2,000 one-time"
- "First year savings: $3,000. Every year after: $5,000"

#### Service Offering Tiers

| Tier | Price | Deliverable |
|------|-------|-------------|
| **Template** | $500 | Clone of Charter Direct with their branding |
| **Custom** | $2,000-5,000 | Custom booking flow, integrations |
| **Managed** | $200/mo | Hosting, updates, support |

#### Productized Version (Moe's AI Angle)
Turn this into a self-serve platform:
1. Operator signs up
2. AI scrapes their existing listings (GetMyBoat, Airbnb, etc.)
3. Auto-generates their booking page
4. They connect Stripe, go live in 10 minutes
5. **$29/mo** or **3% of bookings** (still cheaper than marketplaces)

---

### Why This Matters Now

Three things converged to make this possible:

1. **AI-assisted development** — Built the entire MVP with Claude in one session
2. **Commoditized infrastructure** — Stripe, Vercel, Supabase = $0 to start
3. **Shifting operator sentiment** — Post-COVID, small operators are fee-conscious

The platforms won on **discovery**. But discovery is now:
- Google Maps
- Instagram
- WhatsApp referrals
- TripAdvisor (free to list)

If you don't need their audience, you don't need their fees.

---

### Results (Projected)

For Angelo specifically:
- **Current:** ~$1,500/year in GetMyBoat fees (est. 12 bookings × $125 avg fee)
- **With Charter Direct:** ~$350/year in Stripe fees (2.9% on deposits only)
- **Annual savings:** ~$1,150

For GTA Labs:
- **One-time build fee:** $500-2,000
- **Ongoing managed hosting:** $50-200/mo (optional)
- **Referral pipeline:** Every operator knows 5 more operators

---

### Next Steps

1. **Validate with Angelo** — Get his feedback, refine the UX
2. **Add Supabase** — Real availability, booking storage, operator auth
3. **Operator notifications** — WhatsApp/SMS when bookings come in
4. **Template the build** — Make it repeatable for other verticals
5. **Case study content** — Document for GTA Labs marketing

---

### The Bottom Line

> "SaaS isn't dead. Rent-seeking is dead. The winners will be those who help SMEs own their customers, not those who own the SMEs."

Charter Direct is a proof of concept. The real product is the **methodology** — and that's what GTA Labs sells.

---

*Built: February 11, 2026*  
*Time: ~4 hours*  
*Live: https://charter-direct.vercel.app*
