-- Charter Direct Initial Schema
-- Created: 2026-02-12

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Operators (the business/captain)
CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  location TEXT,
  description TEXT,
  hero_image TEXT,
  
  -- Stripe Connect
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  
  -- Google Calendar sync
  google_calendar_id TEXT,
  google_refresh_token TEXT,
  
  -- Claim status
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  claim_token TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Source tracking
  source_platform TEXT, -- 'getmyboat', 'boatsetter', 'manual'
  source_listing_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boats (one operator can have multiple)
CREATE TABLE boats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  capacity INT,
  features JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  primary_photo_index INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing configuration
CREATE TABLE pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  trip_type TEXT NOT NULL, -- 'half_day_am', 'half_day_pm', 'full_day'
  display_name TEXT NOT NULL, -- 'Half Day AM', 'Half Day PM', 'Full Day'
  duration_hours INT,
  start_time TIME,
  end_time TIME,
  base_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 100,
  
  -- Dynamic pricing
  dynamic_pricing_enabled BOOLEAN DEFAULT FALSE,
  seasonal_rules JSONB DEFAULT '[]'::jsonb,
  last_minute_discount_percent INT DEFAULT 0,
  advance_premium_percent INT DEFAULT 0,
  high_demand_threshold INT DEFAULT 3,
  high_demand_premium_percent INT DEFAULT 10,
  low_availability_premium_percent INT DEFAULT 15,
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operator_id, trip_type)
);

-- Availability
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  slot TEXT NOT NULL, -- 'am', 'pm', 'full_day'
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'booked', 'blocked'
  booking_id UUID,
  external_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operator_id, date, slot)
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id),
  boat_id UUID REFERENCES boats(id),
  
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  party_size INT DEFAULT 1,
  special_requests TEXT,
  
  -- Trip details
  trip_date DATE NOT NULL,
  trip_type TEXT NOT NULL,
  
  -- Pricing at time of booking
  base_price DECIMAL(10,2),
  dynamic_adjustments JSONB DEFAULT '[]'::jsonb,
  final_price DECIMAL(10,2),
  deposit_amount DECIMAL(10,2) DEFAULT 100,
  
  -- Payment
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  deposit_status TEXT DEFAULT 'pending', -- 'pending', 'authorized', 'captured', 'cancelled', 'refunded'
  remainder_status TEXT DEFAULT 'pending', -- 'pending', 'paid_cash', 'paid_card'
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'declined', 'completed', 'cancelled', 'no_show'
  
  -- Notifications
  operator_notified_at TIMESTAMPTZ,
  customer_confirmed_at TIMESTAMPTZ,
  
  -- Metadata
  source TEXT DEFAULT 'website', -- 'website', 'phone', 'walkin'
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key after bookings table exists
ALTER TABLE availability 
  ADD CONSTRAINT availability_booking_fk 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  
  reviewer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date DATE,
  
  source TEXT DEFAULT 'direct', -- 'direct', 'getmyboat', 'google'
  external_id TEXT,
  visible BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inclusions (what's included in trip)
CREATE TABLE inclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  included BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add-ons (optional extras)
CREATE TABLE addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  price_type TEXT DEFAULT 'per_person', -- 'per_person', 'flat'
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_operators_slug ON operators(slug);
CREATE INDEX idx_operators_claim_token ON operators(claim_token);
CREATE INDEX idx_operators_user_id ON operators(user_id);
CREATE INDEX idx_bookings_operator ON bookings(operator_id);
CREATE INDEX idx_bookings_date ON bookings(trip_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_availability_operator_date ON availability(operator_id, date);
CREATE INDEX idx_reviews_operator ON reviews(operator_id);

-- RLS Policies
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

-- Public read for operator pages
CREATE POLICY "Public can view operators" ON operators
  FOR SELECT USING (true);

CREATE POLICY "Public can view boats" ON boats
  FOR SELECT USING (true);

CREATE POLICY "Public can view pricing" ON pricing
  FOR SELECT USING (active = true);

CREATE POLICY "Public can view availability" ON availability
  FOR SELECT USING (true);

CREATE POLICY "Public can view visible reviews" ON reviews
  FOR SELECT USING (visible = true);

CREATE POLICY "Public can view inclusions" ON inclusions
  FOR SELECT USING (true);

CREATE POLICY "Public can view active addons" ON addons
  FOR SELECT USING (active = true);

-- Operators can manage their own data
CREATE POLICY "Operators can update own profile" ON operators
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Operators can manage own boats" ON boats
  FOR ALL USING (operator_id IN (
    SELECT id FROM operators WHERE user_id = auth.uid()
  ));

CREATE POLICY "Operators can manage own pricing" ON pricing
  FOR ALL USING (operator_id IN (
    SELECT id FROM operators WHERE user_id = auth.uid()
  ));

CREATE POLICY "Operators can manage own availability" ON availability
  FOR ALL USING (operator_id IN (
    SELECT id FROM operators WHERE user_id = auth.uid()
  ));

CREATE POLICY "Operators can view own bookings" ON bookings
  FOR SELECT USING (operator_id IN (
    SELECT id FROM operators WHERE user_id = auth.uid()
  ));

CREATE POLICY "Operators can update own bookings" ON bookings
  FOR UPDATE USING (operator_id IN (
    SELECT id FROM operators WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Operators can manage own reviews" ON reviews
  FOR ALL USING (operator_id IN (
    SELECT id FROM operators WHERE user_id = auth.uid()
  ));

CREATE POLICY "Operators can manage own inclusions" ON inclusions
  FOR ALL USING (operator_id IN (
    SELECT id FROM operators WHERE user_id = auth.uid()
  ));

CREATE POLICY "Operators can manage own addons" ON addons
  FOR ALL USING (operator_id IN (
    SELECT id FROM operators WHERE user_id = auth.uid()
  ));

-- Service role can do everything (for webhooks, admin)
-- This is handled automatically by Supabase service role key

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER operators_updated_at
  BEFORE UPDATE ON operators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
