-- Add country names and management fields to shipping_rates
-- Date: 2026-01-12
-- Purpose: Enable admin UI for managing shipping countries

BEGIN;

-- Step 1: Add country_name column
ALTER TABLE shipping_rates
ADD COLUMN IF NOT EXISTS country_name text;

-- Step 2: Add display_order for controlling dropdown order
ALTER TABLE shipping_rates
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 999;

-- Step 3: Update existing rows with country names
UPDATE shipping_rates SET country_name = 'United Kingdom', display_order = 1 WHERE country_code = 'GB';
UPDATE shipping_rates SET country_name = 'Ireland', display_order = 2 WHERE country_code = 'IE';
UPDATE shipping_rates SET country_name = 'Iceland', display_order = 3 WHERE country_code = 'IS';
UPDATE shipping_rates SET country_name = 'France', display_order = 4 WHERE country_code = 'FR';
UPDATE shipping_rates SET country_name = 'Germany', display_order = 5 WHERE country_code = 'DE';
UPDATE shipping_rates SET country_name = 'Spain', display_order = 6 WHERE country_code = 'ES';
UPDATE shipping_rates SET country_name = 'Italy', display_order = 7 WHERE country_code = 'IT';
UPDATE shipping_rates SET country_name = 'Netherlands', display_order = 8 WHERE country_code = 'NL';
UPDATE shipping_rates SET country_name = 'Belgium', display_order = 9 WHERE country_code = 'BE';
UPDATE shipping_rates SET country_name = 'Austria', display_order = 10 WHERE country_code = 'AT';
UPDATE shipping_rates SET country_name = 'Sweden', display_order = 11 WHERE country_code = 'SE';
UPDATE shipping_rates SET country_name = 'Slovakia', display_order = 12 WHERE country_code = 'SK';
UPDATE shipping_rates SET country_name = 'Denmark', display_order = 13 WHERE country_code = 'DK';
UPDATE shipping_rates SET country_name = 'Finland', display_order = 14 WHERE country_code = 'FI';
UPDATE shipping_rates SET country_name = 'United States', display_order = 15 WHERE country_code = 'US';
UPDATE shipping_rates SET country_name = 'Canada', display_order = 16 WHERE country_code = 'CA';

-- Step 4: Insert Poland and Australia
INSERT INTO shipping_rates (country_code, country_name, rate_gbp, zone_name, free_shipping_threshold, display_order, active, notes)
VALUES
  ('PL', 'Poland', 25.00, 'EU Zone 1', 500.00, 11, true, 'Poland - Standard EU shipping'),
  ('AU', 'Australia', 45.00, 'Rest of World', 750.00, 17, true, 'Australia - International shipping')
ON CONFLICT (rate_id) DO NOTHING;

-- Step 5: Make country_name required going forward
ALTER TABLE shipping_rates
ALTER COLUMN country_name SET NOT NULL;

-- Step 6: Add unique constraint to country_code
ALTER TABLE shipping_rates
DROP CONSTRAINT IF EXISTS shipping_rates_country_code_key;

ALTER TABLE shipping_rates
ADD CONSTRAINT shipping_rates_country_code_key UNIQUE (country_code);

COMMIT;
