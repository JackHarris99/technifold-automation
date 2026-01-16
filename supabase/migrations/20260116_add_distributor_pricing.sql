-- Add distributor_tier column to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS distributor_tier TEXT DEFAULT 'standard';

-- Create distributor_pricing table
CREATE TABLE IF NOT EXISTS distributor_pricing (
  pricing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL REFERENCES products(product_code) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_code, tier)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_distributor_pricing_product_tier
ON distributor_pricing(product_code, tier) WHERE active = true;

-- Add comment
COMMENT ON TABLE distributor_pricing IS 'Tiered pricing for distributor products. Falls back to products.price if no tier pricing exists.';
COMMENT ON COLUMN companies.distributor_tier IS 'Distributor pricing tier: standard, gold, silver, bronze, tier_1, tier_2, etc.';

-- Enable RLS
ALTER TABLE distributor_pricing ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active distributor pricing
CREATE POLICY "Anyone can view active distributor pricing"
ON distributor_pricing FOR SELECT
USING (active = true);

-- Policy: Only directors can manage distributor pricing
CREATE POLICY "Directors can manage distributor pricing"
ON distributor_pricing FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
    AND users.role = 'director'
  )
);
