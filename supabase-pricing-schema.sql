-- Pricing Schema for Technifold
-- Separates pricing DATA (in database) from pricing LOGIC (in code)

-- 1. Add pricing_tier to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS pricing_tier TEXT DEFAULT 'standard';

COMMENT ON COLUMN products.pricing_tier IS 'Pricing group: standard (fixed tier prices) or premium (percentage discounts)';

-- 2. Standard pricing ladder (£33 products - fixed prices per tier)
CREATE TABLE IF NOT EXISTS standard_pricing_ladder (
  tier_id SERIAL PRIMARY KEY,
  min_qty INTEGER NOT NULL,
  max_qty INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_qty_range CHECK (min_qty <= max_qty),
  CONSTRAINT unique_qty_range UNIQUE (min_qty, max_qty)
);

COMMENT ON TABLE standard_pricing_ladder IS 'Tiered pricing for standard products (Spacer, Nylon Sleeve, etc.)';

-- Insert current standard pricing ladder
INSERT INTO standard_pricing_ladder (min_qty, max_qty, unit_price) VALUES
  (1, 3, 33.00),
  (4, 7, 29.00),
  (8, 9, 27.00),
  (10, 19, 25.00),
  (20, 24, 23.00),
  (25, 29, 22.00),
  (30, 34, 21.00),
  (35, 999, 20.00)
ON CONFLICT (min_qty, max_qty) DO NOTHING;

-- 3. Premium pricing ladder (Cutting Boss/Knife/MPB - percentage discounts)
CREATE TABLE IF NOT EXISTS premium_pricing_ladder (
  tier_id SERIAL PRIMARY KEY,
  min_qty INTEGER NOT NULL,
  max_qty INTEGER NOT NULL,
  discount_pct NUMERIC(5,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_qty_range_premium CHECK (min_qty <= max_qty),
  CONSTRAINT unique_qty_range_premium UNIQUE (min_qty, max_qty)
);

COMMENT ON TABLE premium_pricing_ladder IS 'Volume discount percentages for premium products (Cutting Boss, Cutting Knife, Micro-Perforation Blade)';

-- Insert current premium pricing ladder
INSERT INTO premium_pricing_ladder (min_qty, max_qty, discount_pct) VALUES
  (1, 2, 0.00),
  (3, 4, 7.00),
  (5, 9, 15.00),
  (10, 999, 25.00)
ON CONFLICT (min_qty, max_qty) DO NOTHING;

-- 4. Set pricing tiers for existing products
UPDATE products SET pricing_tier = 'standard'
WHERE category IN (
  'Blade Seal',
  'Female Receiver Ring',
  'Gripper Band',
  'Nylon Sleeve',
  'Plastic Creasing Band',
  'Rubber Creasing Band',
  'Section Scoring Band',
  'Spacer',
  'Waste-Stripper'
);

UPDATE products SET pricing_tier = 'premium'
WHERE category IN (
  'Cutting Boss',
  'Cutting Knife',
  'Micro-Perforation Blade'
);

-- 5. Optional: Customer-specific pricing overrides (for future use)
CREATE TABLE IF NOT EXISTS customer_pricing_overrides (
  override_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(company_id),
  product_code TEXT REFERENCES products(product_code),
  category TEXT, -- Can override by category instead of individual products
  pricing_tier TEXT, -- Can override which ladder to use
  flat_discount_pct NUMERIC(5,2), -- e.g., 20% off everything
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  CONSTRAINT must_specify_product_or_category CHECK (
    product_code IS NOT NULL OR category IS NOT NULL
  )
);

COMMENT ON TABLE customer_pricing_overrides IS 'Special pricing for specific customers (negotiated deals, promotions)';

CREATE INDEX idx_customer_overrides_company ON customer_pricing_overrides(company_id) WHERE active = TRUE;
CREATE INDEX idx_customer_overrides_product ON customer_pricing_overrides(product_code) WHERE active = TRUE;
CREATE INDEX idx_customer_overrides_validity ON customer_pricing_overrides(valid_from, valid_until) WHERE active = TRUE;
