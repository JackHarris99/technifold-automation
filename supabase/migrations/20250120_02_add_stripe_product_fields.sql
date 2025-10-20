-- Migration: Add Stripe product fields
-- Description: Adds stripe_product_id and stripe_price_id_default to products table

-- ============================================================================
-- Add Stripe fields to products table
-- ============================================================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id_default TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id
  ON public.products(stripe_product_id)
  WHERE stripe_product_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_stripe_price_id
  ON public.products(stripe_price_id_default)
  WHERE stripe_price_id_default IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.products.stripe_product_id IS 'Stripe product ID for this product';
COMMENT ON COLUMN public.products.stripe_price_id_default IS 'Default Stripe price ID (typically GBP)';

-- Add constraint to ensure currency-aware pricing setup
-- Note: In production, you may want multiple price IDs for different currencies
-- stored in the extra jsonb field like: extra->>'stripe_prices' = '{"GBP": "price_xxx", "EUR": "price_yyy"}'
