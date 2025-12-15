/**
 * Company Product History - Generic Fact Table
 *
 * Tracks purchase history for products beyond tools/consumables
 * (parts, accessories, services, etc.)
 *
 * Complements:
 * - company_tools (tool ownership)
 * - company_consumables (consumable reorders)
 */

CREATE TABLE IF NOT EXISTS company_product_history (
  company_id text NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  product_code text NOT NULL REFERENCES products(product_code),
  product_type text NOT NULL, -- part, accessory, service, etc. (from products.type)

  -- Purchase tracking
  first_purchased_at date NOT NULL,
  last_purchased_at date NOT NULL,
  total_purchases integer NOT NULL DEFAULT 1,
  total_quantity integer NOT NULL,

  -- Financial (for reference)
  last_purchase_amount numeric(10,2),
  last_invoice_id text, -- Reference to source invoice

  PRIMARY KEY (company_id, product_code)
);

-- Indexes for fast lookups
CREATE INDEX idx_company_product_history_company ON company_product_history(company_id);
CREATE INDEX idx_company_product_history_product ON company_product_history(product_code);
CREATE INDEX idx_company_product_history_type ON company_product_history(product_type);
CREATE INDEX idx_company_product_history_last_purchase ON company_product_history(last_purchased_at);

-- Comments
COMMENT ON TABLE company_product_history IS 'Fact table: Purchase history for products beyond tools/consumables (parts, accessories, services, etc.)';
COMMENT ON COLUMN company_product_history.product_type IS 'Product type from products.type - typically "part", "accessory", "service", etc.';
COMMENT ON COLUMN company_product_history.total_purchases IS 'Number of separate purchase transactions';
COMMENT ON COLUMN company_product_history.total_quantity IS 'Total quantity purchased across all transactions';

/**
 * Upsert function for company_product_history
 * Called when invoices are paid to update purchase facts
 */
CREATE OR REPLACE FUNCTION upsert_company_product_history(
  p_company_id text,
  p_product_code text,
  p_product_type text,
  p_purchase_date date,
  p_quantity integer,
  p_amount numeric,
  p_invoice_id text
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
    last_purchase_amount,
    last_invoice_id
  ) VALUES (
    p_company_id,
    p_product_code,
    p_product_type,
    p_purchase_date,
    p_purchase_date,
    1,
    p_quantity,
    p_amount,
    p_invoice_id
  )
  ON CONFLICT (company_id, product_code)
  DO UPDATE SET
    last_purchased_at = p_purchase_date,
    total_purchases = company_product_history.total_purchases + 1,
    total_quantity = company_product_history.total_quantity + p_quantity,
    last_purchase_amount = p_amount,
    last_invoice_id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION upsert_company_product_history IS 'Updates product purchase history when invoices are paid. Use for products that are not tools or consumables.';

/**
 * MIGRATION NOTES:
 *
 * This table complements the existing fact tables:
 * - company_tools: Tracks tool ownership (machines)
 * - company_consumables: Tracks consumable purchases (ribs, parts for reorder)
 * - company_product_history: Everything else (parts, accessories, services)
 *
 * To populate from existing data, run:
 *
 * SELECT upsert_company_product_history(
 *   company_id,
 *   product_code,
 *   product_type,
 *   purchase_date::date,
 *   quantity,
 *   amount,
 *   invoice_id
 * )
 * FROM your_source_table
 * WHERE product_type NOT IN ('tool', 'consumable');
 */
