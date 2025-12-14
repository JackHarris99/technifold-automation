/**
 * ONE-TIME MIGRATION: Extract Facts from Sage Data
 * Populates company_tools and company_consumables from existing orders/order_items
 *
 * After this runs, fact tables are self-sustaining via upsert functions
 * Eventually can archive orders/order_items without losing operational data
 */

-- Populate company_tools from existing paid orders
INSERT INTO company_tools (
  company_id,
  tool_code,
  first_purchased_at,
  last_purchased_at,
  total_purchases,
  total_quantity,
  last_purchase_amount,
  last_invoice_id
)
SELECT
  o.company_id,
  oi.product_code as tool_code,
  MIN(o.created_at::date) as first_purchased_at,
  MAX(o.created_at::date) as last_purchased_at,
  COUNT(DISTINCT o.order_id) as total_purchases,
  SUM(oi.qty) as total_quantity,
  -- Get amount from most recent order
  (
    SELECT oi2.line_total
    FROM order_items oi2
    JOIN orders o2 ON oi2.order_id = o2.order_id
    WHERE oi2.product_code = oi.product_code
      AND o2.company_id = o.company_id
      AND o2.payment_status = 'paid'
    ORDER BY o2.created_at DESC
    LIMIT 1
  ) as last_purchase_amount,
  -- Get invoice_number from most recent order
  (
    SELECT o2.invoice_number
    FROM orders o2
    JOIN order_items oi2 ON o2.order_id = oi2.order_id
    WHERE oi2.product_code = oi.product_code
      AND o2.company_id = o.company_id
      AND o2.payment_status = 'paid'
    ORDER BY o2.created_at DESC
    LIMIT 1
  ) as last_invoice_id
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_code = p.product_code
WHERE p.type = 'tool'
  AND o.payment_status = 'paid'
GROUP BY o.company_id, oi.product_code
ON CONFLICT (company_id, tool_code) DO NOTHING; -- Skip if already exists

-- Populate company_consumables from existing paid orders
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
)
SELECT
  o.company_id,
  oi.product_code as consumable_code,
  MIN(o.created_at::date) as first_ordered_at,
  MAX(o.created_at::date) as last_ordered_at,
  COUNT(DISTINCT o.order_id) as total_orders,
  SUM(oi.qty) as total_quantity,
  -- Get amount and quantity from most recent order
  (
    SELECT oi2.line_total
    FROM order_items oi2
    JOIN orders o2 ON oi2.order_id = o2.order_id
    WHERE oi2.product_code = oi.product_code
      AND o2.company_id = o.company_id
      AND o2.payment_status = 'paid'
    ORDER BY o2.created_at DESC
    LIMIT 1
  ) as last_order_amount,
  (
    SELECT oi2.qty
    FROM order_items oi2
    JOIN orders o2 ON oi2.order_id = o2.order_id
    WHERE oi2.product_code = oi.product_code
      AND o2.company_id = o.company_id
      AND o2.payment_status = 'paid'
    ORDER BY o2.created_at DESC
    LIMIT 1
  ) as last_order_quantity,
  (
    SELECT o2.invoice_number
    FROM orders o2
    JOIN order_items oi2 ON o2.order_id = oi2.order_id
    WHERE oi2.product_code = oi.product_code
      AND o2.company_id = o.company_id
      AND o2.payment_status = 'paid'
    ORDER BY o2.created_at DESC
    LIMIT 1
  ) as last_invoice_id
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_code = p.product_code
WHERE p.type = 'consumable'
  AND o.payment_status = 'paid'
GROUP BY o.company_id, oi.product_code
ON CONFLICT (company_id, consumable_code) DO NOTHING; -- Skip if already exists

-- Log migration results
DO $$
DECLARE
  tool_count integer;
  consumable_count integer;
BEGIN
  SELECT COUNT(*) INTO tool_count FROM company_tools;
  SELECT COUNT(*) INTO consumable_count FROM company_consumables;

  RAISE NOTICE 'Fact tables populated:';
  RAISE NOTICE '  company_tools: % records', tool_count;
  RAISE NOTICE '  company_consumables: % records', consumable_count;
END $$;
