-- Security deposit fields on operators
ALTER TABLE operators ADD COLUMN IF NOT EXISTS security_deposit_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE operators ADD COLUMN IF NOT EXISTS security_deposit_amount DECIMAL(10,2) DEFAULT 0;

-- Security deposit fields on bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_deposit_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_deposit_intent_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS security_deposit_status TEXT DEFAULT 'none';

-- Greg's Charters test operator
INSERT INTO operators (slug, business_name, email, phone, location, description, hero_image, claimed, source_platform)
VALUES (
  'gregs-charters',
  'Greg''s Charters',
  'greg@gregmousseau.com',
  '+1-416-555-0199',
  'Toronto, Ontario, Canada',
  'Sail the Toronto Harbour on our beautiful 32ft sailboat. Perfect for sunset cruises, corporate events, or a relaxing day on Lake Ontario. Captain Greg has been sailing the harbour for over a decade.',
  '/images/operators/gregs-charters/hero.jpg',
  false,
  'manual'
);

-- Boat for Greg's Charters
INSERT INTO boats (operator_id, name, type, capacity, features, is_primary)
SELECT id, 'Lake Breeze', 'Sailboat', 8,
  '["32ft Sailboat", "Full Electronics Suite", "Bluetooth Speakers", "Covered Cockpit", "Snorkeling Gear", "Cooler with Ice"]'::jsonb,
  true
FROM operators WHERE slug = 'gregs-charters';

-- Pricing
INSERT INTO pricing (operator_id, trip_type, display_name, duration_hours, start_time, end_time, base_price, deposit_amount, active)
SELECT id, 'half_day_am', 'Half Day Morning', 4, '08:00'::time, '12:00'::time, 600, 100, true FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'half_day_pm', 'Half Day Afternoon', 4, '13:00'::time, '17:00'::time, 600, 100, true FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'full_day', 'Full Day', 8, '08:00'::time, '16:00'::time, 1000, 200, true FROM operators WHERE slug = 'gregs-charters';

-- Inclusions
INSERT INTO inclusions (operator_id, name, included)
SELECT id, unnest(ARRAY['Captain & Crew', 'Life Jackets', 'Cooler with Ice', 'Bluetooth Sound System', 'Snorkeling Equipment', 'Fishing Rod Rental']),
       unnest(ARRAY[true, true, true, true, true, false])
FROM operators WHERE slug = 'gregs-charters';

-- Reviews
INSERT INTO reviews (operator_id, reviewer_name, rating, review_text, review_date, source)
SELECT id, 'Sarah M.', 5, 'Amazing sunset cruise! Captain Greg was incredibly knowledgeable about the harbour. The boat was spotless and the whole experience was unforgettable.', '2025-12-15'::date, 'direct' FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'Mike & Lisa', 5, 'We booked the full day for our anniversary and it was perfect. Greg knows all the best spots on the lake. Highly recommend!', '2025-11-20'::date, 'direct' FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'James T.', 4, 'Great experience overall. Beautiful boat, friendly captain. Only reason for 4 stars is we hit some choppy water but Greg handled it like a pro.', '2025-10-08'::date, 'direct' FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'The Patel Family', 5, 'Took our kids (ages 8 and 11) and they had an absolute blast. Greg was patient and let them help with the sails. Made lifelong memories!', '2025-09-22'::date, 'direct' FROM operators WHERE slug = 'gregs-charters'
UNION ALL
SELECT id, 'David K.', 5, 'Used Greg''s Charters for a corporate team outing. 10/10. Professional, fun, and the Toronto skyline from the water is unreal.', '2025-08-14'::date, 'direct' FROM operators WHERE slug = 'gregs-charters';
