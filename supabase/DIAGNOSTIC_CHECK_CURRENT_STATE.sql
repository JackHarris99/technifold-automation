-- ============================================================================
-- DIAGNOSTIC: Check current state of invoice trigger system
-- ============================================================================
-- Run this in Supabase SQL Editor to see what's currently in your database

-- 1. Check which functions exist
SELECT
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%sync%'
ORDER BY routine_name;

-- Expected functions if migrations succeeded:
-- - sync_invoice_to_product_history (function, trigger)
-- - sync_product_history_to_consumables (function, trigger)
-- - sync_product_history_to_tools (function, trigger)

-- 2. Check which triggers exist
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%sync%'
ORDER BY trigger_name;

-- Expected triggers if migrations succeeded:
-- - trigger_sync_invoice_to_history on invoices (AFTER INSERT OR UPDATE)
-- - trigger_sync_history_to_consumables on company_product_history (AFTER INSERT OR UPDATE)
-- - trigger_sync_history_to_tools on company_product_history (AFTER INSERT OR UPDATE)

-- 3. Check company_product_history for any backfilled data
SELECT
  source,
  COUNT(*) as count,
  MIN(first_purchased_at) as earliest_purchase,
  MAX(last_purchased_at) as latest_purchase
FROM company_product_history
GROUP BY source
ORDER BY source;

-- Expected sources if backfill succeeded:
-- - 'invoice' (from trigger on new paid invoices)
-- - 'invoice_backfill' (from one-time backfill migration)
-- - 'manual' (if you added any manually)

-- 4. Check for any error messages in recent operations
-- (This won't show historical errors, but good to know structure)
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('company_product_history', 'company_consumables', 'company_tools')
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- INTERPRETATION:
-- ============================================================================
-- If you see 0 functions/triggers:
--   → Migrations failed completely, safe to run corrected versions
--
-- If you see some but not all functions/triggers:
--   → Partial failure, need to drop existing and run corrected versions
--
-- If you see all 3 functions and 3 triggers:
--   → Migrations succeeded! Check if backfill ran by looking at source column
--
-- If company_product_history has 'invoice_backfill' source:
--   → Backfill succeeded, system is fully operational
--
-- If company_product_history has 0 rows with 'invoice' or 'invoice_backfill':
--   → Backfill didn't run or failed, need to run backfill migration
-- ============================================================================
