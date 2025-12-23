-- ============================================================================
-- VERIFY FACT TABLE TRIGGER IS DEPLOYED
-- ============================================================================
-- Run this in Supabase SQL Editor to verify trigger exists
-- Expected: 1 row returned showing the trigger details
-- ============================================================================

-- Check if trigger exists
SELECT
  trigger_name,
  event_object_table AS table_name,
  action_timing AS when_fires,
  event_manipulation AS on_event,
  action_statement AS executes_function
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_facts_on_invoice_paid';

-- Expected output:
-- trigger_name: trigger_update_facts_on_invoice_paid
-- table_name: invoices
-- when_fires: AFTER
-- on_event: UPDATE
-- executes_function: EXECUTE FUNCTION update_facts_on_invoice_paid()

-- ============================================================================

-- Check if trigger function exists
SELECT
  routine_name AS function_name,
  routine_type AS type,
  routine_definition AS definition_preview
FROM information_schema.routines
WHERE routine_name = 'update_facts_on_invoice_paid'
  AND routine_schema = 'public';

-- Expected output:
-- function_name: update_facts_on_invoice_paid
-- type: FUNCTION
-- definition_preview: (should show the function code)

-- ============================================================================

-- INTERPRETATION:
-- ✅ If both queries return 1 row each: Trigger is DEPLOYED and ACTIVE
-- ❌ If queries return 0 rows: Trigger is NOT deployed
-- ⚠️  If only function exists but not trigger: Trigger was dropped, needs re-creation
-- ============================================================================
