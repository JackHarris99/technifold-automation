-- Add show_in_distributor_portal column to products table (default catalog)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS show_in_distributor_portal BOOLEAN DEFAULT true;

-- Create company_product_catalog table (custom catalogs per company)
CREATE TABLE IF NOT EXISTS company_product_catalog (
  catalog_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  product_code TEXT NOT NULL REFERENCES products(product_code) ON DELETE CASCADE,
  visible BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, product_code)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_product_catalog_company
ON company_product_catalog(company_id) WHERE visible = true;

CREATE INDEX IF NOT EXISTS idx_company_product_catalog_product
ON company_product_catalog(product_code);

CREATE INDEX IF NOT EXISTS idx_products_distributor_portal
ON products(product_code) WHERE show_in_distributor_portal = true AND active = true;

-- Add comments
COMMENT ON COLUMN products.show_in_distributor_portal IS 'Show this product in distributor portal by default (if company has no custom catalog)';
COMMENT ON TABLE company_product_catalog IS 'Custom product catalogs per company. If company has entries here, show only these products. Otherwise, show all products where show_in_distributor_portal = true.';

-- Enable RLS
ALTER TABLE company_product_catalog ENABLE ROW LEVEL SECURITY;

-- Policy: Companies can view their own catalog
CREATE POLICY "Companies can view their own catalog"
ON company_product_catalog FOR SELECT
USING (
  company_id = current_setting('request.jwt.claims', true)::json->>'company_id'
  OR visible = true
);

-- Policy: Directors can manage all catalogs
CREATE POLICY "Directors can manage all catalogs"
ON company_product_catalog FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
    AND users.role = 'director'
  )
);
