-- Flexible Pricing & Per-Person Pricing Support
-- Adds columns for included guests, extra person fees, custom start times,
-- payment methods, and admin capabilities.

-- pricing table: per-person pricing & flexible start times
ALTER TABLE pricing
  ADD COLUMN IF NOT EXISTS included_guests INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS extra_person_fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS custom_start_time BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS default_start_time TIME DEFAULT '09:00';

-- operators table: payment method support, admin flag, trip limits
ALTER TABLE operators
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS paypal_email TEXT,
  ADD COLUMN IF NOT EXISTS paypal_merchant_id TEXT,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS max_trips_per_day INT DEFAULT 3;

-- bookings table: track which payment provider was used
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe';
