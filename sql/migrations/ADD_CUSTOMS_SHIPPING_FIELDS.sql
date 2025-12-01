/**
 * Add Customs and Shipping Fields to Products
 * Required for international shipping and customs declarations
 */

-- Add customs fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS hs_code VARCHAR(10),           -- Harmonized System code for customs
ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(2),  -- ISO country code (GB, DE, US, etc)
ADD COLUMN IF NOT EXISTS customs_value_gbp DECIMAL(10,2), -- Declared value for customs
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(8,3),        -- Weight in kilograms
ADD COLUMN IF NOT EXISTS width_cm DECIMAL(8,2),         -- Width in centimeters
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(8,2),        -- Height in centimeters
ADD COLUMN IF NOT EXISTS depth_cm DECIMAL(8,2);         -- Depth in centimeters

-- Add column comments
COMMENT ON COLUMN products.hs_code IS 'Harmonized System code for customs declarations (e.g., 8442.30.00 for printing machinery)';
COMMENT ON COLUMN products.country_of_origin IS 'ISO 3166-1 alpha-2 country code where product is manufactured';
COMMENT ON COLUMN products.customs_value_gbp IS 'Declared value in GBP for customs purposes (usually cost/market value)';
COMMENT ON COLUMN products.weight_kg IS 'Product weight in kilograms for shipping calculations';
COMMENT ON COLUMN products.width_cm IS 'Product width in centimeters for shipping calculations';
COMMENT ON COLUMN products.height_cm IS 'Product height in centimeters for shipping calculations';
COMMENT ON COLUMN products.depth_cm IS 'Product depth in centimeters for shipping calculations';

-- Create index for customs lookups
CREATE INDEX IF NOT EXISTS idx_products_hs_code ON products(hs_code);
CREATE INDEX IF NOT EXISTS idx_products_origin ON products(country_of_origin);

-- Example data for common HS codes (Tools)
-- 8442.30.00 - Machinery, apparatus and other equipment for type-founding or composing
-- 8442.90.00 - Parts of machinery for type-founding, composing or printing
-- 8443.99.00 - Parts and accessories of printing machinery

-- Update existing tool products with typical values (adjust as needed)
UPDATE products
SET
  hs_code = '8442.30.00',
  country_of_origin = 'GB',
  customs_value_gbp = CASE
    WHEN type = 'tool' AND price > 0 THEN price
    ELSE 1500.00 -- Default tool value
  END,
  weight_kg = 5.0  -- Default weight, should be updated with actual values
WHERE type = 'tool' AND hs_code IS NULL;

-- Update existing consumable products (ribs, parts, etc)
UPDATE products
SET
  hs_code = '8442.90.00',
  country_of_origin = 'GB',
  customs_value_gbp = CASE
    WHEN price > 0 THEN price
    ELSE 50.00 -- Default consumable value
  END,
  weight_kg = 0.5  -- Default weight for small parts
WHERE type IN ('consumable', 'part') AND hs_code IS NULL;

-- Create shipping_manifests table for tracking international shipments
CREATE TABLE IF NOT EXISTS shipping_manifests (
  manifest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES companies(company_id),
  subscription_id VARCHAR(255),  -- Stripe subscription ID if applicable
  order_id UUID REFERENCES orders(order_id),

  -- Shipment details
  destination_country VARCHAR(2) NOT NULL,  -- ISO country code
  shipment_type VARCHAR(50) NOT NULL,       -- rental, sale, consumables, return
  courier VARCHAR(100),                     -- DHL, FedEx, etc
  tracking_number VARCHAR(255),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,

  -- Customs declaration
  customs_invoice_number VARCHAR(100),
  total_customs_value_gbp DECIMAL(10,2),
  total_weight_kg DECIMAL(10,3),

  -- Items (JSONB for flexibility)
  items JSONB NOT NULL,  -- Array of {product_code, description, hs_code, value, quantity, weight}

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Add indexes
CREATE INDEX idx_manifests_company ON shipping_manifests(company_id);
CREATE INDEX idx_manifests_subscription ON shipping_manifests(subscription_id);
CREATE INDEX idx_manifests_country ON shipping_manifests(destination_country);
CREATE INDEX idx_manifests_shipped ON shipping_manifests(shipped_at);

-- Add RLS policies
ALTER TABLE shipping_manifests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to shipping manifests"
  ON shipping_manifests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE shipping_manifests IS 'Tracks international shipments and customs declarations for tools, consumables, and returns';
COMMENT ON COLUMN shipping_manifests.items IS 'JSONB array of shipped items with customs details: [{product_code, description, hs_code, origin, value, quantity, weight}]';
