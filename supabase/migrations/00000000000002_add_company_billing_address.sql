-- Add billing address fields to companies table
-- These are for company registration/billing purposes, separate from shipping addresses

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS billing_address_line1 text,
ADD COLUMN IF NOT EXISTS billing_address_line2 text,
ADD COLUMN IF NOT EXISTS billing_city text,
ADD COLUMN IF NOT EXISTS billing_county text,
ADD COLUMN IF NOT EXISTS billing_postcode text,
ADD COLUMN IF NOT EXISTS billing_country text;

COMMENT ON COLUMN companies.billing_address_line1 IS 'Company registered/billing address - line 1';
COMMENT ON COLUMN companies.billing_city IS 'Company registered/billing address - city';
COMMENT ON COLUMN companies.billing_postcode IS 'Company registered/billing address - postcode';
COMMENT ON COLUMN companies.billing_country IS 'Company registered/billing address - country code (e.g., GB, US, DE)';

-- Note: Shipping addresses are stored in the shipping_addresses table (many-to-one relationship)
-- This allows companies to have multiple shipping locations with is_default flag
