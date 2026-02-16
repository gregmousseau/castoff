-- Sprint 3: Feature Parity + Payment Holds

-- Task 1: Digital Waivers
ALTER TABLE operators ADD COLUMN IF NOT EXISTS waiver_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS waiver_text TEXT;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS waiver_signed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS waiver_signer_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS waiver_signer_ip TEXT;

-- Task 2: Operator-Customer Messaging
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  sender_name TEXT,
  sender_email TEXT,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_operator ON messages(operator_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Task 3: Instant Booking Toggle
ALTER TABLE operators ADD COLUMN IF NOT EXISTS instant_booking BOOLEAN DEFAULT FALSE;

-- Task 4: Add-ons selected per booking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS selected_addons JSONB DEFAULT '[]'::jsonb;

-- Task 6: Operator Verification Badge
ALTER TABLE operators ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS verification_docs JSONB DEFAULT '[]'::jsonb;

-- Task 8: Payment Hold / Trip Escrow
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_hold_intent_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_hold_status TEXT DEFAULT 'none';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_hold_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE operators ADD COLUMN IF NOT EXISTS trip_hold_enabled BOOLEAN DEFAULT FALSE;
