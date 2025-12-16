/**
 * Unified Product History Table
 * Consolidates company_tools, company_consumables, and other products
 * into one table with type column
 */

-- Create unified table
CREATE TABLE IF NOT EXISTS company_product_history (
  company_id text NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  product_code text NOT NULL REFERENCES products(product_code),
  product_type text NOT NULL, -- 'tool', 'consumable', 'part', etc.
  first_purchased_at date NOT NULL,
  last_purchased_at date NOT NULL,
  total_purchases integer NOT NULL DEFAULT 1,
  total_quantity integer NOT NULL DEFAULT 1,
  source text DEFAULT 'invoice', -- 'invoice' or 'manual'
  added_by text, -- User who manually added (if source='manual')
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (company_id, product_code)
);

-- Indexes for performance
CREATE INDEX idx_company_product_history_company ON company_product_history(company_id);
CREATE INDEX idx_company_product_history_product ON company_product_history(product_code);
CREATE INDEX idx_company_product_history_type ON company_product_history(product_type);
CREATE INDEX idx_company_product_history_last_purchase ON company_product_history(last_purchased_at);

-- Migrate ALL historic data from order_items (source of truth)
-- Aggregate by company_id + product_code to build complete purchase history
INSERT INTO company_product_history (
  company_id,
  product_code,
  product_type,
  first_purchased_at,
  last_purchased_at,
  total_purchases,
  total_quantity,
  source
)
SELECT
  o.company_id,
  oi.product_code,
  COALESCE(p.type, 'part') as product_type, -- Use products.type (tool/consumable/part)
  MIN(o.created_at)::date as first_purchased_at,
  MAX(o.created_at)::date as last_purchased_at,
  COUNT(DISTINCT o.order_id) as total_purchases,
  SUM(oi.qty) as total_quantity,
  'invoice' as source
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
LEFT JOIN products p ON p.product_code = oi.product_code
WHERE o.company_id IS NOT NULL
  AND oi.product_code IS NOT NULL
  AND oi.qty > 0
GROUP BY o.company_id, oi.product_code, p.type
ON CONFLICT (company_id, product_code) DO NOTHING;

-- Create views for backwards compatibility
CREATE OR REPLACE VIEW company_tools_view AS
SELECT
  company_id,
  product_code as tool_code,
  first_purchased_at as first_seen_at,
  last_purchased_at as last_seen_at,
  total_quantity as total_units
FROM company_product_history
WHERE product_type = 'tool';

CREATE OR REPLACE VIEW company_consumables_view AS
SELECT
  company_id,
  product_code as consumable_code,
  first_purchased_at as first_ordered_at,
  last_purchased_at as last_ordered_at,
  total_purchases as total_orders,
  total_quantity
FROM company_product_history
WHERE product_type = 'consumable';

-- Function to upsert product history (called by Stripe webhook)
CREATE OR REPLACE FUNCTION upsert_company_product_history(
  p_company_id text,
  p_product_code text,
  p_product_type text,
  p_purchase_date date,
  p_quantity integer
)
RETURNS void AS $$
BEGIN
  INSERT INTO company_product_history (
    company_id,
    product_code,
    product_type,
    first_purchased_at,
    last_purchased_at,
    total_purchases,
    total_quantity,
    source
  ) VALUES (
    p_company_id,
    p_product_code,
    p_product_type,
    p_purchase_date,
    p_purchase_date,
    1,
    p_quantity,
    'invoice'
  )
  ON CONFLICT (company_id, product_code)
  DO UPDATE SET
    last_purchased_at = p_purchase_date,
    total_purchases = company_product_history.total_purchases + 1,
    total_quantity = company_product_history.total_quantity + p_quantity,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE company_product_history IS 'Unified tracking of all products (tools, consumables, parts) purchased by companies. Historic data (no prices). Going forward, revenue tracked in invoices table.';
COMMENT ON COLUMN company_product_history.source IS 'invoice = from actual purchase, manual = added by admin';
