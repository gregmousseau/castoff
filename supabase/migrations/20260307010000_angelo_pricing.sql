-- Angelo's Operator Setup
-- Deactivate half_day_pm, configure per-person pricing, and update description.

-- Deactivate old half_day_am and half_day_pm pricing records for Angelo
UPDATE pricing
SET active = false
WHERE operator_id = (SELECT id FROM operators WHERE slug = 'angelo')
  AND trip_type IN ('half_day_pm', 'half_day_am');

-- Upsert starter trip type
INSERT INTO pricing (operator_id, trip_type, display_name, duration_hours, base_price, deposit_amount, included_guests, extra_person_fee, custom_start_time, default_start_time, active)
SELECT id, 'starter', 'Starter Tour', 3, 900, 100, 8, 125, true, '09:00', true
FROM operators WHERE slug = 'angelo'
ON CONFLICT (operator_id, trip_type)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  duration_hours = EXCLUDED.duration_hours,
  base_price = EXCLUDED.base_price,
  included_guests = EXCLUDED.included_guests,
  extra_person_fee = EXCLUDED.extra_person_fee,
  custom_start_time = EXCLUDED.custom_start_time,
  default_start_time = EXCLUDED.default_start_time,
  active = EXCLUDED.active;

-- Upsert half_day trip type
INSERT INTO pricing (operator_id, trip_type, display_name, duration_hours, base_price, deposit_amount, included_guests, extra_person_fee, custom_start_time, default_start_time, active)
SELECT id, 'half_day', 'Half Day Tour', 4, 1200, 100, 8, 125, true, '09:00', true
FROM operators WHERE slug = 'angelo'
ON CONFLICT (operator_id, trip_type)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  duration_hours = EXCLUDED.duration_hours,
  base_price = EXCLUDED.base_price,
  included_guests = EXCLUDED.included_guests,
  extra_person_fee = EXCLUDED.extra_person_fee,
  custom_start_time = EXCLUDED.custom_start_time,
  default_start_time = EXCLUDED.default_start_time,
  active = EXCLUDED.active;

-- Upsert full_day trip type
INSERT INTO pricing (operator_id, trip_type, display_name, duration_hours, base_price, deposit_amount, included_guests, extra_person_fee, custom_start_time, default_start_time, active)
SELECT id, 'full_day', 'Full Day Tour', 8, 2500, 100, 8, 125, true, '09:00', true
FROM operators WHERE slug = 'angelo'
ON CONFLICT (operator_id, trip_type)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  duration_hours = EXCLUDED.duration_hours,
  base_price = EXCLUDED.base_price,
  included_guests = EXCLUDED.included_guests,
  extra_person_fee = EXCLUDED.extra_person_fee,
  custom_start_time = EXCLUDED.custom_start_time,
  default_start_time = EXCLUDED.default_start_time,
  active = EXCLUDED.active;

-- Set Angelo's max_trips_per_day to 1, configure PayPal
UPDATE operators
SET max_trips_per_day = 1,
    payment_method = 'paypal',
    paypal_email = 'miguel.burrows@hotmail.com',
    description = 'Experience the Bahamas like never before with a private, fully curated boat tour. Every trip is tailored to your group — whether you want to explore hidden cays, snorkel pristine reefs, or simply cruise the turquoise waters. All tours are private and can be customized to your liking.'
WHERE slug = 'angelo';
