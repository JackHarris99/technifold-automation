-- ============================================================================
-- Check if REAL invoices (from Stripe) are missing from product_history
-- ============================================================================
-- The 19,685 existing rows are from old Sage/orders data
-- This checks if actual invoices table data has been synced

-- 1. How many paid invoices exist in the invoices table?
SELECT
  'Total paid invoices' as metric,
  COUNT(*) as count
FROM invoices
WHERE payment_status = 'paid'

UNION ALL

-- 2. How many distinct invoice_ids are referenced in invoice_items?
SELECT
  'Invoices with line items' as metric,
  COUNT(DISTINCT invoice_id) as count
FROM invoice_items
WHERE invoice_id IN (
  SELECT invoice_id FROM invoices WHERE payment_status = 'paid'
)

UNION ALL

-- 3. How many invoice items exist for paid invoices?
SELECT
  'Total paid invoice items' as metric,
  COUNT(*) as count
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.invoice_id
WHERE i.payment_status = 'paid';

-- ============================================================================
-- 4. Which specific invoices are missing from product_history?
-- ============================================================================

WITH paid_invoices_with_items AS (
  SELECT DISTINCT
    i.invoice_id,
    i.company_id,
    i.invoice_date,
    i.created_at,
    ii.product_code
  FROM invoices i
  JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
  WHERE i.payment_status = 'paid'
),
product_history_invoices AS (
  -- We can't directly track which invoice created which history row
  -- But we can check if company+product combinations exist
  SELECT DISTINCT
    company_id,
    product_code
  FROM company_product_history
)
SELECT
  'Invoice items not in product_history' as metric,
  COUNT(*) as count
FROM paid_invoices_with_items pii
LEFT JOIN product_history_invoices phi
  ON pii.company_id = phi.company_id
  AND pii.product_code = phi.product_code
WHERE phi.company_id IS NULL;

-- ============================================================================
-- 5. Show sample of missing invoices
-- ============================================================================

WITH paid_invoices_with_items AS (
  SELECT DISTINCT
    i.invoice_id,
    i.company_id,
    i.invoice_date,
    i.created_at,
    ii.product_code,
    ii.quantity
  FROM invoices i
  JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
  WHERE i.payment_status = 'paid'
),
product_history_invoices AS (
  SELECT DISTINCT
    company_id,
    product_code
  FROM company_product_history
)
SELECT
  pii.invoice_id,
  pii.company_id,
  pii.invoice_date,
  pii.product_code,
  pii.quantity,
  CASE
    WHEN pii.created_at > NOW() - INTERVAL '7 days' THEN 'Recent (last 7 days)'
    WHEN pii.created_at > NOW() - INTERVAL '30 days' THEN 'Last month'
    WHEN pii.created_at > NOW() - INTERVAL '90 days' THEN 'Last 3 months'
    ELSE 'Older than 3 months'
  END as age
FROM paid_invoices_with_items pii
LEFT JOIN product_history_invoices phi
  ON pii.company_id = phi.company_id
  AND pii.product_code = phi.product_code
WHERE phi.company_id IS NULL
ORDER BY pii.created_at DESC
LIMIT 20;

-- ============================================================================
-- INTERPRETATION:
-- ============================================================================
-- If "Invoice items not in product_history" > 0:
--   → Real Stripe invoices are missing from product_history
--   → Need to run backfill to sync them
--
-- If the sample shows recent invoices (last 7 days):
--   → Even new invoices aren't syncing (trigger might not be working)
--
-- If only old invoices are missing:
--   → Triggers are working, just need to backfill historical data
-- ============================================================================
