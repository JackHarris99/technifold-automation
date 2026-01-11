-- ============================================================================
-- Check if company_product_history is missing any paid invoice data
-- ============================================================================

-- Count paid invoices vs product_history entries
WITH paid_invoice_items AS (
  SELECT
    i.company_id,
    ii.product_code,
    COUNT(DISTINCT i.invoice_id) as invoice_count,
    SUM(ii.quantity) as total_qty
  FROM invoices i
  JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
  WHERE i.payment_status = 'paid'
  GROUP BY i.company_id, ii.product_code
),
product_history AS (
  SELECT
    company_id,
    product_code,
    total_purchases,
    total_quantity
  FROM company_product_history
)
SELECT
  'Paid invoices with items' as metric,
  COUNT(*) as count
FROM paid_invoice_items

UNION ALL

SELECT
  'Product history entries' as metric,
  COUNT(*) as count
FROM product_history

UNION ALL

SELECT
  'Missing from product_history' as metric,
  COUNT(*) as count
FROM paid_invoice_items pii
LEFT JOIN product_history ph ON pii.company_id = ph.company_id AND pii.product_code = ph.product_code
WHERE ph.company_id IS NULL

UNION ALL

SELECT
  'Mismatched purchase counts' as metric,
  COUNT(*) as count
FROM paid_invoice_items pii
JOIN product_history ph ON pii.company_id = ph.company_id AND pii.product_code = ph.product_code
WHERE pii.invoice_count != ph.total_purchases

UNION ALL

SELECT
  'Mismatched quantity totals' as metric,
  COUNT(*) as count
FROM paid_invoice_items pii
JOIN product_history ph ON pii.company_id = ph.company_id AND pii.product_code = ph.product_code
WHERE pii.total_qty != ph.total_quantity;

-- ============================================================================
-- INTERPRETATION:
-- ============================================================================
-- If "Missing from product_history" = 0 AND both mismatched counts = 0:
--   → All paid invoices are already in product_history, backfill not needed!
--
-- If "Missing from product_history" > 0:
--   → Some invoice data is missing, need to run backfill
--
-- If "Mismatched purchase counts" > 0 OR "Mismatched quantity totals" > 0:
--   → Data is incomplete or incorrect, need to investigate
-- ============================================================================
