-- ============================================================================
-- CLEANUP: Remove any partially-applied invoice trigger migrations
-- ============================================================================
-- Run this ONLY IF diagnostic shows partial/broken state
-- This will cleanly remove all trigger-related objects so you can start fresh

-- Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS trigger_sync_invoice_to_history ON invoices;
DROP TRIGGER IF EXISTS trigger_sync_history_to_consumables ON company_product_history;
DROP TRIGGER IF EXISTS trigger_sync_history_to_tools ON company_product_history;

-- Drop functions
DROP FUNCTION IF EXISTS sync_invoice_to_product_history();
DROP FUNCTION IF EXISTS sync_product_history_to_consumables();
DROP FUNCTION IF EXISTS sync_product_history_to_tools();

-- ============================================================================
-- IMPORTANT: This does NOT delete data from tables
-- ============================================================================
-- Your data in these tables is preserved:
-- - invoices
-- - invoice_items
-- - company_product_history
-- - company_consumables
-- - company_tools
--
-- If you want to remove backfilled data (to re-run backfill cleanly):
-- ============================================================================

-- OPTIONAL: Remove only backfilled invoice data (keeps manual entries)
-- Uncomment the lines below if you want to re-run backfill from scratch

-- DELETE FROM company_product_history WHERE source IN ('invoice', 'invoice_backfill');
-- DELETE FROM company_consumables WHERE company_id IN (
--   SELECT DISTINCT company_id FROM invoices WHERE payment_status = 'paid'
-- );
-- DELETE FROM company_tools WHERE company_id IN (
--   SELECT DISTINCT company_id FROM invoices WHERE payment_status = 'paid'
-- );

-- ============================================================================
-- After running this cleanup:
-- ============================================================================
-- 1. Run: 20260111_sync_invoice_to_history.sql
-- 2. Run: 20260111_sync_history_to_consumables_tools.sql
-- 3. Run: 20260111_backfill_history_from_invoices.sql
-- ============================================================================

SELECT 'Cleanup complete. Ready to apply corrected migrations.' as status;
