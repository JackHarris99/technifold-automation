/**
 * Materialized Fact Tables
 * These tables extract operational facts from invoice history
 * and persist independently - allowing eventual archival of Sage orders/order_items
 */

-- 1. Company Tools (Purchased Tools History)
CREATE TABLE IF NOT EXISTS company_tools (
  company_id text NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  tool_code text NOT NULL REFERENCES products(product_code),
  first_purchased_at date NOT NULL,
  last_purchased_at date NOT NULL,
  total_purchases integer NOT NULL DEFAULT 1,
  total_quantity integer NOT NULL DEFAULT 1,
  last_purchase_amount numeric(10,2),
  last_invoice_id text, -- Reference to source invoice
  PRIMARY KEY (company_id, tool_code)
);

CREATE INDEX idx_company_tools_company ON company_tools(company_id);
CREATE INDEX idx_company_tools_tool ON company_tools(tool_code);

COMMENT ON TABLE company_tools IS 'Materialized fact table: Tools purchased by companies (persists independently of invoice history)';

-- 2. Subscription Tools (Active Tool Subscriptions)
CREATE TABLE IF NOT EXISTS subscription_tools (
  subscription_id uuid NOT NULL REFERENCES subscriptions(subscription_id) ON DELETE CASCADE,
  tool_code text NOT NULL REFERENCES products(product_code),
  added_at timestamptz NOT NULL DEFAULT now(),
  added_by text, -- Sales rep who allocated the tool
  removed_at timestamptz, -- NULL = still active
  removed_by text,
  removal_reason text,
  PRIMARY KEY (subscription_id, tool_code, added_at)
);

CREATE INDEX idx_subscription_tools_subscription ON subscription_tools(subscription_id);
CREATE INDEX idx_subscription_tools_tool ON subscription_tools(tool_code);
CREATE INDEX idx_subscription_tools_active ON subscription_tools(subscription_id, tool_code) WHERE removed_at IS NULL;

COMMENT ON TABLE subscription_tools IS 'Junction table: Which tools are included in each subscription (manual allocation)';

-- 3. Company Consumables (Consumable Order History)
CREATE TABLE IF NOT EXISTS company_consumables (
  company_id text NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  consumable_code text NOT NULL REFERENCES products(product_code),
  first_ordered_at date NOT NULL,
  last_ordered_at date NOT NULL,
  total_orders integer NOT NULL DEFAULT 1,
  total_quantity integer NOT NULL,
  last_order_amount numeric(10,2),
  last_order_quantity integer,
  last_invoice_id text, -- Reference to source invoice
  PRIMARY KEY (company_id, consumable_code)
);

CREATE INDEX idx_company_consumables_company ON company_consumables(company_id);
CREATE INDEX idx_company_consumables_consumable ON company_consumables(consumable_code);
CREATE INDEX idx_company_consumables_last_order ON company_consumables(last_ordered_at);

COMMENT ON TABLE company_consumables IS 'Materialized fact table: Consumable order history per company (persists independently of invoice history)';

/**
 * Upsert Functions - Called when new invoices are paid
 */

-- Upsert company_tools when tool is purchased
CREATE OR REPLACE FUNCTION upsert_company_tool(
  p_company_id text,
  p_tool_code text,
  p_purchase_date date,
  p_quantity integer,
  p_amount numeric,
  p_invoice_id text
)
RETURNS void AS $$
BEGIN
  INSERT INTO company_tools (
    company_id,
    tool_code,
    first_purchased_at,
    last_purchased_at,
    total_purchases,
    total_quantity,
    last_purchase_amount,
    last_invoice_id
  ) VALUES (
    p_company_id,
    p_tool_code,
    p_purchase_date,
    p_purchase_date,
    1,
    p_quantity,
    p_amount,
    p_invoice_id
  )
  ON CONFLICT (company_id, tool_code)
  DO UPDATE SET
    last_purchased_at = p_purchase_date,
    total_purchases = company_tools.total_purchases + 1,
    total_quantity = company_tools.total_quantity + p_quantity,
    last_purchase_amount = p_amount,
    last_invoice_id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Upsert company_consumables when consumable is ordered
CREATE OR REPLACE FUNCTION upsert_company_consumable(
  p_company_id text,
  p_consumable_code text,
  p_order_date date,
  p_quantity integer,
  p_amount numeric,
  p_invoice_id text
)
RETURNS void AS $$
BEGIN
  INSERT INTO company_consumables (
    company_id,
    consumable_code,
    first_ordered_at,
    last_ordered_at,
    total_orders,
    total_quantity,
    last_order_amount,
    last_order_quantity,
    last_invoice_id
  ) VALUES (
    p_company_id,
    p_consumable_code,
    p_order_date,
    p_order_date,
    1,
    p_quantity,
    p_amount,
    p_quantity,
    p_invoice_id
  )
  ON CONFLICT (company_id, consumable_code)
  DO UPDATE SET
    last_ordered_at = p_order_date,
    total_orders = company_consumables.total_orders + 1,
    total_quantity = company_consumables.total_quantity + p_quantity,
    last_order_amount = p_amount,
    last_order_quantity = p_quantity,
    last_invoice_id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

/**
 * View: Active Subscription Tools
 * Shows only currently active tool allocations (removed_at IS NULL)
 */
CREATE OR REPLACE VIEW v_active_subscription_tools AS
SELECT
  st.subscription_id,
  st.tool_code,
  st.added_at,
  st.added_by,
  s.company_id,
  s.contact_id,
  s.status as subscription_status,
  p.description as tool_name,
  p.rental_price_monthly as tool_rental_price
FROM subscription_tools st
JOIN subscriptions s ON st.subscription_id = s.subscription_id
JOIN products p ON st.tool_code = p.product_code
WHERE st.removed_at IS NULL;

COMMENT ON VIEW v_active_subscription_tools IS 'Active tool allocations for subscriptions (excludes removed tools)';
