// Database types for Cast Off

export interface Operator {
  id: string
  slug: string
  business_name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  location: string | null
  description: string | null
  hero_image: string | null
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  google_calendar_id: string | null
  google_refresh_token: string | null
  claimed: boolean
  claimed_at: string | null
  claim_token: string | null
  user_id: string | null
  source_platform: string | null
  source_listing_id: string | null
  security_deposit_enabled: boolean
  security_deposit_amount: number
  waiver_enabled: boolean
  waiver_text: string | null
  instant_booking: boolean
  verified: boolean
  verification_docs: { type: string; url: string; verified_at: string | null }[]
  trip_hold_enabled: boolean
  cancellation_policy: string | null
  what_to_bring: string | null
  created_at: string
  updated_at: string
}

export interface Boat {
  id: string
  operator_id: string
  name: string
  type: string | null
  capacity: number | null
  features: string[]
  photos: BoatPhoto[]
  primary_photo_index: number
  is_primary: boolean
  created_at: string
}

export interface BoatPhoto {
  url: string
  caption?: string
  order: number
}

export interface Pricing {
  id: string
  operator_id: string
  trip_type: string
  display_name: string
  duration_hours: number | null
  start_time: string | null
  end_time: string | null
  base_price: number
  deposit_amount: number
  dynamic_pricing_enabled: boolean
  seasonal_rules: SeasonalRule[]
  last_minute_discount_percent: number
  advance_premium_percent: number
  high_demand_threshold: number
  high_demand_premium_percent: number
  low_availability_premium_percent: number
  active: boolean
  created_at: string
}

export interface SeasonalRule {
  name: string
  start_month: number
  end_month: number
  multiplier: number
}

export interface Availability {
  id: string
  operator_id: string
  date: string
  slot: 'am' | 'pm' | 'full_day'
  status: 'available' | 'booked' | 'blocked'
  booking_id: string | null
  external_event_id: string | null
  created_at: string
}

export interface Booking {
  id: string
  operator_id: string
  boat_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  party_size: number
  special_requests: string | null
  trip_date: string
  trip_type: string
  base_price: number | null
  dynamic_adjustments: PriceAdjustment[]
  final_price: number | null
  deposit_amount: number
  stripe_payment_intent_id: string | null
  stripe_checkout_session_id: string | null
  deposit_status: 'pending' | 'authorized' | 'captured' | 'cancelled' | 'refunded'
  remainder_status: 'pending' | 'paid_cash' | 'paid_card'
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled' | 'no_show'
  operator_notified_at: string | null
  customer_confirmed_at: string | null
  security_deposit_amount: number
  security_deposit_intent_id: string | null
  security_deposit_status: 'none' | 'authorized' | 'captured' | 'released'
  waiver_signed_at: string | null
  waiver_signer_name: string | null
  waiver_signer_ip: string | null
  selected_addons: { addon_id: string; name: string; price: number; quantity: number }[]
  trip_hold_intent_id: string | null
  trip_hold_status: 'none' | 'authorized' | 'captured' | 'released' | 'expired'
  trip_hold_amount: number
  source: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PriceAdjustment {
  reason: string
  type: 'percentage' | 'fixed'
  value: number
  amount: number
}

export interface Review {
  id: string
  operator_id: string
  booking_id: string | null
  reviewer_name: string
  rating: number
  review_text: string | null
  review_date: string | null
  source: string
  external_id: string | null
  visible: boolean
  created_at: string
}

export interface Inclusion {
  id: string
  operator_id: string
  name: string
  included: boolean
  created_at: string
}

export interface Addon {
  id: string
  operator_id: string
  name: string
  price: number
  price_type: 'per_person' | 'flat'
  description: string | null
  active: boolean
  created_at: string
}

export interface Message {
  id: string
  booking_id: string | null
  operator_id: string
  sender_type: 'customer' | 'operator'
  sender_name: string | null
  sender_email: string | null
  message: string
  read_at: string | null
  created_at: string
}

// API response types
export interface OperatorPageData {
  operator: Operator
  boats: Boat[]
  pricing: Pricing[]
  reviews: Review[]
  inclusions: Inclusion[]
  addons: Addon[]
  stats: {
    totalTrips: number
    averageRating: number
    reviewCount: number
  }
}

export interface PriceBreakdown {
  basePrice: number
  adjustments: PriceAdjustment[]
  finalPrice: number
  depositAmount: number
}

// Booking form types
export interface BookingFormData {
  operatorId: string
  tripDate: string
  tripType: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  specialRequests?: string
  selectedAddons?: string[]
}
