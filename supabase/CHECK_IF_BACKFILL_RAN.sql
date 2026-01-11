-- ============================================================================
-- Quick check: Did the backfill migration run?
-- ============================================================================

-- Count rows by source in company_product_history
SELECT
  COALESCE(source, 'NULL') as source,
  COUNT(*) as row_count
FROM company_product_history
GROUP BY source
ORDER BY source;

-- Expected results if backfill ran:
-- source              | row_count
-- --------------------+-----------
-- invoice             | X (from new paid invoices via trigger)
-- invoice_backfill    | Y (from historical paid invoices via backfill)
-- manual              | Z (if any were added manually)

-- If you see 0 rows OR no 'invoice_backfill' source:
--   → Backfill didn't run, you need to run: 20260111_backfill_history_from_invoices.sql

-- If you see 'invoice_backfill' with a count:
--   → Backfill succeeded, system is fully operational!
