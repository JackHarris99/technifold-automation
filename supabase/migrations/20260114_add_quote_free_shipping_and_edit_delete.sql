-- ============================================================================
-- Add free_shipping column to quotes table
-- Allows sales reps to override shipping costs for individual quotes
-- ============================================================================

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN quotes.free_shipping IS 'When true, shipping charge is set to 0 regardless of country rules';

-- ============================================================================
-- DONE - Quotes can now have free shipping enabled
-- ============================================================================
