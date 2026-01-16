-- Restructure distributor_pricing to use columns per tier instead of rows per tier
-- This makes it easier to manage and view prices side by side

-- Drop the old table
DROP TABLE IF EXISTS distributor_pricing CASCADE;

-- Create new table with tier columns
CREATE TABLE distributor_pricing (
  pricing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL UNIQUE REFERENCES products(product_code) ON DELETE CASCADE,
  standard_price DECIMAL(10, 2),
  gold_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'GBP',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active products
CREATE INDEX idx_distributor_pricing_active
ON distributor_pricing(product_code) WHERE active = true;

-- Enable RLS
ALTER TABLE distributor_pricing ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active pricing (needed for distributor portal)
CREATE POLICY "Anyone can view active pricing"
ON distributor_pricing FOR SELECT
USING (active = true);

-- Policy: Directors can manage all pricing
CREATE POLICY "Directors can manage all pricing"
ON distributor_pricing FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
    AND users.role = 'director'
  )
);

COMMENT ON TABLE distributor_pricing IS 'Distributor pricing with columns per tier. Each product has one row with prices for different tiers (standard, gold, etc.)';
COMMENT ON COLUMN distributor_pricing.standard_price IS 'Price for standard tier distributors';
COMMENT ON COLUMN distributor_pricing.gold_price IS 'Price for gold tier distributors (premium pricing)';
