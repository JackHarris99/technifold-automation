-- ROLLBACK: Drop the duplicate table we just created
DROP TABLE IF EXISTS company_tools CASCADE;

-- The trigger and functions reference company_tools (wrong)
-- We need to recreate them to use company_tool (singular)
DROP TRIGGER IF EXISTS trigger_update_facts_on_invoice_paid ON invoices;
DROP FUNCTION IF EXISTS update_facts_on_invoice_paid();
DROP FUNCTION IF EXISTS upsert_company_tool(text, text, date, integer, numeric, text);
