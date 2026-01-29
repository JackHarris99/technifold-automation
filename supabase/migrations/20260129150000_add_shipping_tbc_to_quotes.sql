-- Add shipping_tbc field to quotes for early-stage quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS shipping_tbc BOOLEAN DEFAULT false;

COMMENT ON COLUMN quotes.shipping_tbc IS 'Shipping cost to be confirmed (for early-stage quotes)';
