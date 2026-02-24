-- Demo operators for Cast Off directory
-- These are fictional showcase operators to populate the directory

-- 1. Miami Beach Watersports
INSERT INTO operators (slug, business_name, email, phone, location, description, hero_image, claimed, source_platform, verified, instant_booking, cancellation_policy, what_to_bring)
VALUES (
  'miami-beach-watersports',
  'Miami Beach Watersports',
  'demo@castoff.boats',
  '+1-305-555-0142',
  'Miami Beach, Florida',
  'Experience the best of Miami from the water. Captain Maria offers sunset cruises, snorkeling trips to Biscayne Bay, and private party charters on our 40ft catamaran. USCG licensed with 15 years on the water.',
  '/images/operators/miami-beach-watersports/hero.jpg',
  false,
  'manual',
  true,
  true,
  'moderate',
  'Sunscreen, towel, swimsuit, and a sense of adventure. We provide everything else.'
);

INSERT INTO boats (operator_id, name, type, capacity, features, is_primary)
SELECT id, 'Sol Seeker', 'Catamaran', 12,
  '["40ft Catamaran", "Shaded Deck", "Bluetooth Speakers", "Snorkeling Gear", "Paddleboards", "Freshwater Shower", "Cooler with Ice"]'::jsonb,
  true
FROM operators WHERE slug = 'miami-beach-watersports';

INSERT INTO pricing (operator_id, trip_type, display_name, duration_hours, start_time, end_time, base_price, deposit_amount, active)
SELECT id, 'half_day_am', 'Morning Snorkel Trip', 4, '08:00'::time, '12:00'::time, 800, 150, true FROM operators WHERE slug = 'miami-beach-watersports'
UNION ALL
SELECT id, 'half_day_pm', 'Sunset Cruise', 3, '16:00'::time, '19:00'::time, 700, 150, true FROM operators WHERE slug = 'miami-beach-watersports'
UNION ALL
SELECT id, 'full_day', 'Full Day Island Hopper', 8, '09:00'::time, '17:00'::time, 1400, 300, true FROM operators WHERE slug = 'miami-beach-watersports';

INSERT INTO inclusions (operator_id, name, included)
SELECT id, unnest(ARRAY['Captain & Crew', 'Life Jackets', 'Snorkeling Equipment', 'Paddleboards', 'Cooler with Ice', 'Bluetooth Sound System']),
       unnest(ARRAY[true, true, true, true, true, true])
FROM operators WHERE slug = 'miami-beach-watersports';

INSERT INTO reviews (operator_id, reviewer_name, rating, review_text, review_date, source)
SELECT id, 'Jennifer M.', 5, 'Captain Maria made our anniversary trip unforgettable. The catamaran was immaculate and the snorkeling spot she took us to was incredible.', '2025-12-15'::date, 'manual' FROM operators WHERE slug = 'miami-beach-watersports'
UNION ALL
SELECT id, 'David & Sarah K.', 5, 'Best sunset cruise we''ve ever done. Maria knows exactly where to go for the best views. Will definitely book again.', '2026-01-08'::date, 'manual' FROM operators WHERE slug = 'miami-beach-watersports'
UNION ALL
SELECT id, 'Tyler R.', 4, 'Great trip overall. The paddleboards were a nice bonus. Only wish we had more time at the sandbar.', '2026-01-22'::date, 'manual' FROM operators WHERE slug = 'miami-beach-watersports';

-- 2. Vancouver Island Sailing
INSERT INTO operators (slug, business_name, email, phone, location, description, hero_image, claimed, source_platform, verified, instant_booking, cancellation_policy, what_to_bring)
VALUES (
  'vancouver-island-sailing',
  'Vancouver Island Sailing Co.',
  'demo@castoff.boats',
  '+1-250-555-0188',
  'Victoria, British Columbia, Canada',
  'Explore the Gulf Islands and whale watching routes aboard our 36ft sailing yacht. Captain James is a certified RYA Yachtmaster with 20 years of Pacific Northwest experience. Small groups only — max 6 guests for a personal experience.',
  '/images/operators/vancouver-island-sailing/hero.jpg',
  false,
  'manual',
  true,
  false,
  'strict',
  'Warm layers (it can get cool on the water), non-marking shoes, camera. Rain gear provided if needed.'
);

INSERT INTO boats (operator_id, name, type, capacity, features, is_primary)
SELECT id, 'Pacific Wanderer', 'Sailing Yacht', 6,
  '["36ft Sailing Yacht", "Heated Cabin", "Full Galley", "Chartplotter", "Safety Equipment", "Rain Gear", "Binoculars"]'::jsonb,
  true
FROM operators WHERE slug = 'vancouver-island-sailing';

INSERT INTO pricing (operator_id, trip_type, display_name, duration_hours, start_time, end_time, base_price, deposit_amount, active)
SELECT id, 'half_day_am', 'Morning Whale Watch', 4, '07:00'::time, '11:00'::time, 900, 200, true FROM operators WHERE slug = 'vancouver-island-sailing'
UNION ALL
SELECT id, 'half_day_pm', 'Afternoon Island Cruise', 4, '13:00'::time, '17:00'::time, 850, 200, true FROM operators WHERE slug = 'vancouver-island-sailing'
UNION ALL
SELECT id, 'full_day', 'Gulf Islands Explorer', 8, '08:00'::time, '16:00'::time, 1600, 400, true FROM operators WHERE slug = 'vancouver-island-sailing';

INSERT INTO inclusions (operator_id, name, included)
SELECT id, unnest(ARRAY['Captain', 'Life Jackets', 'Hot Beverages', 'Binoculars', 'Rain Gear', 'Snacks']),
       unnest(ARRAY[true, true, true, true, true, true])
FROM operators WHERE slug = 'vancouver-island-sailing';

INSERT INTO reviews (operator_id, reviewer_name, rating, review_text, review_date, source)
SELECT id, 'Michelle T.', 5, 'We saw three orcas! Captain James knew exactly where to find them. The sailing was beautiful and he clearly loves what he does.', '2025-11-20'::date, 'manual' FROM operators WHERE slug = 'vancouver-island-sailing'
UNION ALL
SELECT id, 'Robert & Lisa P.', 5, 'Perfect day on the water. The Gulf Islands are stunning and James is an incredible guide. Book the full day — you won''t regret it.', '2026-01-05'::date, 'manual' FROM operators WHERE slug = 'vancouver-island-sailing'
UNION ALL
SELECT id, 'Andrea C.', 4, 'Beautiful trip and very knowledgeable captain. The boat is well-maintained. Only note: dress warmer than you think!', '2026-02-01'::date, 'manual' FROM operators WHERE slug = 'vancouver-island-sailing';

-- 3. Keys Fishing Charters
INSERT INTO operators (slug, business_name, email, phone, location, description, hero_image, claimed, source_platform, verified, instant_booking, cancellation_policy, what_to_bring, security_deposit_enabled, security_deposit_amount)
VALUES (
  'keys-fishing-charters',
  'Keys Fishing Charters',
  'demo@castoff.boats',
  '+1-305-555-0167',
  'Key West, Florida',
  'Deep sea fishing in the Florida Keys with Captain Rico. Targeting marlin, mahi-mahi, sailfish, and tuna aboard our 35ft center console. All tackle and bait included. Over 5,000 trips and counting.',
  '/images/operators/keys-fishing-charters/hero.jpg',
  false,
  'manual',
  true,
  true,
  'flexible',
  'Sunscreen, hat, sunglasses, and your own food/drinks. We have a cooler with ice for your catch.',
  true,
  200.00
);

INSERT INTO boats (operator_id, name, type, capacity, features, is_primary)
SELECT id, 'Reel Deal', 'Center Console', 6,
  '["35ft Center Console", "Twin 300HP Engines", "Live Bait Well", "Fish Finder", "Outriggers", "Fighting Chair", "Cooler"]'::jsonb,
  true
FROM operators WHERE slug = 'keys-fishing-charters';

INSERT INTO pricing (operator_id, trip_type, display_name, duration_hours, start_time, end_time, base_price, deposit_amount, active)
SELECT id, 'half_day_am', 'Half Day Offshore', 4, '06:00'::time, '10:00'::time, 750, 150, true FROM operators WHERE slug = 'keys-fishing-charters'
UNION ALL
SELECT id, 'half_day_pm', 'Afternoon Reef Fishing', 4, '13:00'::time, '17:00'::time, 650, 150, true FROM operators WHERE slug = 'keys-fishing-charters'
UNION ALL
SELECT id, 'full_day', 'Full Day Deep Sea', 8, '06:00'::time, '14:00'::time, 1300, 300, true FROM operators WHERE slug = 'keys-fishing-charters';

INSERT INTO inclusions (operator_id, name, included)
SELECT id, unnest(ARRAY['Captain & Mate', 'Life Jackets', 'All Tackle & Bait', 'Fish Cleaning', 'Cooler with Ice', 'Fighting Chair']),
       unnest(ARRAY[true, true, true, true, true, true])
FROM operators WHERE slug = 'keys-fishing-charters';

INSERT INTO reviews (operator_id, reviewer_name, rating, review_text, review_date, source)
SELECT id, 'Mike S.', 5, 'Caught a 45lb mahi on our first trip with Captain Rico. He put us right on the fish. Already booked our next trip.', '2025-12-28'::date, 'manual' FROM operators WHERE slug = 'keys-fishing-charters'
UNION ALL
SELECT id, 'The Johnson Family', 5, 'Rico was amazing with our kids (12 and 14). Patient, fun, and they each caught their first big fish. Memories for life.', '2026-01-15'::date, 'manual' FROM operators WHERE slug = 'keys-fishing-charters'
UNION ALL
SELECT id, 'Chris D.', 4, 'Solid fishing charter. Good equipment, knows the spots. We had a slow morning but Rico kept working until we found them.', '2026-02-05'::date, 'manual' FROM operators WHERE slug = 'keys-fishing-charters';
