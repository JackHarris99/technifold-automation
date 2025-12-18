-- ============================================================================
-- Drop Unused Database Views - Technifold Cleanup
-- ============================================================================
-- Generated: 2025-12-18
-- Purpose: Remove 3 database views that are no longer referenced in the codebase
--
-- These views were verified as unused by searching the entire codebase:
-- - v_invoice_details: 0 references
-- - v_subscription_anomalies: 0 references
-- - vw_company_consumable_payload: 0 references
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard: https://pziahtfkagyykelkxmah.supabase.co
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
-- 5. Verify success (should show "Success. No rows returned" for each DROP)
--
-- ROLLBACK: These are just views (not tables), so no data is lost.
-- If needed, views can be recreated from the schema backup.
-- ============================================================================

-- Drop invoice details view (was created for denormalized invoice queries)
DROP VIEW IF EXISTS v_invoice_details CASCADE;

-- Drop subscription anomalies view (was created for violation detection)
DROP VIEW IF EXISTS v_subscription_anomalies CASCADE;

-- Drop company consumable payload view (was used for old reorder portal implementation)
-- NOTE: Reorder portal now generates payload on-the-fly from:
--   - company_product_history (tools + consumables)
--   - tool_consumable_map (tool-to-consumable relationships)
--   - products (product details)
DROP VIEW IF EXISTS vw_company_consumable_payload CASCADE;

-- ============================================================================
-- VERIFICATION QUERY
-- Run this after dropping views to confirm they're gone:
-- ============================================================================

SELECT
  table_name as view_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'VIEW'
  AND table_name IN ('v_invoice_details', 'v_subscription_anomalies', 'vw_company_consumable_payload');

-- Expected result: 0 rows (all views successfully dropped)

-- ============================================================================
-- KEPT VIEWS (Still in use - DO NOT DROP)
-- ============================================================================
-- v_active_subscription_tools - Used in webhook and subscription list (3 references)
-- v_active_subscriptions - Used in subscription list (2 references)
-- ============================================================================
