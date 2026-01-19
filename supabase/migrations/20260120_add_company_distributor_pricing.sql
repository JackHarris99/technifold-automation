-- Add company-specific distributor pricing table
-- Allows custom prices per distributor company per product

CREATE TABLE IF NOT EXISTS company_distributor_pricing (
  pricing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  product_code TEXT NOT NULL REFERENCES products(product_code) ON DELETE CASCADE,
  custom_price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GBP',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, product_code)
);

CREATE INDEX IF NOT EXISTS idx_company_distributor_pricing_company ON company_distributor_pricing(company_id);
CREATE INDEX IF NOT EXISTS idx_company_distributor_pricing_product ON company_distributor_pricing(product_code);
CREATE INDEX IF NOT EXISTS idx_company_distributor_pricing_active ON company_distributor_pricing(active) WHERE active = TRUE;

COMMENT ON TABLE company_distributor_pricing IS 'Custom distributor pricing per company - overrides standard distributor_pricing';
COMMENT ON COLUMN company_distributor_pricing.custom_price IS 'Company-specific price - takes precedence over distributor_pricing.standard_price';
