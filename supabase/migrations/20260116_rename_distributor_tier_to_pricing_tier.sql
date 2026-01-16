-- Rename distributor_tier column to pricing_tier in companies table
ALTER TABLE companies
RENAME COLUMN distributor_tier TO pricing_tier;

-- Update comment
COMMENT ON COLUMN companies.pricing_tier IS 'Pricing tier for this company: standard, gold, silver, bronze, tier_1, tier_2, etc.';
