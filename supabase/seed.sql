-- Seed data for Charter Direct
-- Angelo from Bahamas Water Tours

-- Insert operator
INSERT INTO operators (
  slug,
  business_name,
  email,
  location,
  description,
  hero_image,
  claimed,
  claim_token,
  source_platform,
  source_listing_id
) VALUES (
  'angelo',
  'Bahamas Water Tours',
  'bahamaswatertours@hotmail.com',
  'Nassau, The Bahamas',
  'Experience the best of Nassau with Captain Angelo! Navigate above shallow reef systems on our unique glass bottom boat, hand-feed colorful fish, swim with turtles, and visit the famous swimming pigs. Local knowledge, incredible stops, and genuine care for every guest.',
  '/operators/angelo/hero.jpg',
  false,
  'claim_angelo_' || encode(gen_random_bytes(16), 'hex'),
  'getmyboat',
  'VKVQod4Y'
);

-- Get operator ID for relationships
DO $$
DECLARE
  op_id UUID;
BEGIN
  SELECT id INTO op_id FROM operators WHERE slug = 'angelo';
  
  -- Insert boat
  INSERT INTO boats (operator_id, name, type, capacity, features, photos, is_primary)
  VALUES (
    op_id,
    '32'' Eduardono Glass Bottom Boat',
    'glass_bottom',
    22,
    '["glass_bottom", "shaded_roof", "boarding_steps", "snorkel_gear"]'::jsonb,
    '[
      {"url": "/operators/angelo/boat-aerial.jpg", "caption": "Aerial view", "order": 0},
      {"url": "/operators/angelo/snorkeling.jpg", "caption": "Snorkeling with sea life", "order": 1},
      {"url": "/operators/angelo/beach.jpg", "caption": "Beach visit", "order": 2},
      {"url": "/operators/angelo/guests.jpg", "caption": "Happy guests", "order": 3},
      {"url": "/operators/angelo/turtle.jpg", "caption": "Swimming with turtles", "order": 4}
    ]'::jsonb,
    true
  );
  
  -- Insert pricing
  INSERT INTO pricing (operator_id, trip_type, display_name, duration_hours, start_time, end_time, base_price, deposit_amount)
  VALUES 
    (op_id, 'half_day_am', 'Half Day AM', 4, '08:00', '12:00', 600, 100),
    (op_id, 'half_day_pm', 'Half Day PM', 4, '13:00', '17:00', 600, 100),
    (op_id, 'full_day', 'Full Day', 8, '08:00', '17:00', 1000, 100);
  
  -- Insert inclusions
  INSERT INTO inclusions (operator_id, name, included)
  VALUES
    (op_id, 'Glass bottom boat experience', true),
    (op_id, 'Hand-feed colorful fish', true),
    (op_id, 'Remote beach visit', true),
    (op_id, 'Snorkel equipment', true),
    (op_id, 'Swim with turtles', true),
    (op_id, 'Tropical drinks', true);
  
  -- Insert add-ons
  INSERT INTO addons (operator_id, name, price, price_type, description)
  VALUES
    (op_id, 'Swimming Pigs Visit', 20, 'per_person', 'Visit the famous swimming pigs at a nearby island'),
    (op_id, 'Drone Kayak Photos', 100, 'per_person', 'Professional aerial photos of your adventure (seasonal)');
  
  -- Insert reviews
  INSERT INTO reviews (operator_id, reviewer_name, rating, review_text, review_date, source)
  VALUES
    (op_id, 'Jill S.', 5, 'Angelo is a sincerely incredible man and made our excursion so memorable. He took us to incredible places, shared a lot of info about the country and island, and made us feel so safe. There was a group of 17 of us. We travel a lot and this was by far the best excursion we ever had.', '2026-01-15', 'getmyboat'),
    (op_id, 'Jody G.', 5, 'Angelo was great!! Very welcoming and provided a great experience for our entire group!', '2026-01-10', 'getmyboat'),
    (op_id, 'Mandi P.', 5, 'Great adventure for our family!', '2025-12-20', 'getmyboat');
    
END $$;
