-- Add discount pricing structure
-- This migration adds support for volume-based and customer-specific discounts

-- Add discount fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS discount_tiers jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS base_discount_percent numeric DEFAULT 0;

COMMENT ON COLUMN products.discount_tiers IS 'Array of volume discount tiers: [{min_qty: 10, discount_percent: 10}, {min_qty: 50, discount_percent: 15}]';
COMMENT ON COLUMN products.base_discount_percent IS 'Default discount percentage for this product (0-100)';

-- Create customer_discounts table for customer-specific pricing
CREATE TABLE IF NOT EXISTS customer_discounts (
  customer_discount_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  product_code text REFERENCES products(product_code) ON DELETE CASCADE,
  product_type text, -- 'tool', 'consumable', 'all' - null product_code means applies to all of this type
  discount_percent numeric NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_type text NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed_amount'
  fixed_amount numeric, -- if discount_type is 'fixed_amount'
  min_quantity integer DEFAULT 1,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by text,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(company_id, product_code, valid_from)
);

CREATE INDEX IF NOT EXISTS idx_customer_discounts_company ON customer_discounts(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_discounts_product ON customer_discounts(product_code);
CREATE INDEX IF NOT EXISTS idx_customer_discounts_active ON customer_discounts(company_id)
WHERE valid_until IS NULL OR valid_until > now();

COMMENT ON TABLE customer_discounts IS 'Customer-specific discount pricing rules';
COMMENT ON COLUMN customer_discounts.product_code IS 'Specific product - if null, applies to product_type';
COMMENT ON COLUMN customer_discounts.product_type IS 'Product type filter when product_code is null';

-- Add function to calculate discounted price
CREATE OR REPLACE FUNCTION calculate_product_price(
  p_product_code text,
  p_company_id text,
  p_quantity integer DEFAULT 1
) RETURNS numeric AS $$
DECLARE
  v_base_price numeric;
  v_discount_percent numeric := 0;
  v_fixed_discount numeric := 0;
  v_customer_discount record;
  v_volume_discount numeric := 0;
  v_product_discount numeric := 0;
BEGIN
  -- Get base price
  SELECT price INTO v_base_price
  FROM products
  WHERE product_code = p_product_code;

  IF v_base_price IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check for customer-specific discounts (prioritize specific product over type)
  SELECT discount_percent, discount_type, fixed_amount INTO v_customer_discount
  FROM customer_discounts
  WHERE company_id = p_company_id
    AND (product_code = p_product_code OR (product_code IS NULL AND product_type = (SELECT type FROM products WHERE product_code = p_product_code)))
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_until IS NULL OR valid_until > now())
    AND p_quantity >= min_quantity
  ORDER BY
    CASE WHEN product_code IS NOT NULL THEN 1 ELSE 2 END, -- Specific product first
    discount_percent DESC
  LIMIT 1;

  IF FOUND THEN
    IF v_customer_discount.discount_type = 'fixed_amount' THEN
      v_fixed_discount := v_customer_discount.fixed_amount;
    ELSE
      v_discount_percent := GREATEST(v_discount_percent, v_customer_discount.discount_percent);
    END IF;
  END IF;

  -- Check product volume discount tiers
  SELECT COALESCE(
    (
      SELECT (tier->>'discount_percent')::numeric
      FROM products,
      jsonb_array_elements(discount_tiers) AS tier
      WHERE product_code = p_product_code
        AND (tier->>'min_qty')::integer <= p_quantity
      ORDER BY (tier->>'min_qty')::integer DESC
      LIMIT 1
    ),
    0
  ) INTO v_volume_discount;

  -- Get product base discount
  SELECT COALESCE(base_discount_percent, 0) INTO v_product_discount
  FROM products
  WHERE product_code = p_product_code;

  -- Apply highest discount percentage
  v_discount_percent := GREATEST(v_discount_percent, v_volume_discount, v_product_discount);

  -- Calculate final price
  RETURN GREATEST(
    (v_base_price * (1 - v_discount_percent / 100.0)) - v_fixed_discount,
    0
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_product_price IS 'Calculate discounted price for a product based on customer, volume, and product discounts';
