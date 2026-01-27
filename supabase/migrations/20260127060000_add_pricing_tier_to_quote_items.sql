-- Add pricing_tier column to quote_items for interactive quote pricing
-- Required for interactive quotes to recalculate consumable pricing based on tier
-- This allows customers to adjust quantities and see correct tiered pricing

ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS pricing_tier TEXT;

COMMENT ON COLUMN quote_items.pricing_tier IS 'Pricing tier for consumables (standard, premium, null). Used by interactive quotes to recalculate prices when customer adjusts quantities.';
