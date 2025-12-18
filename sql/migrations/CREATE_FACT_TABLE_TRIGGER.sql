-- ============================================================================
-- CREATE FACT TABLE UPDATE TRIGGER
-- ============================================================================
-- Purpose: Automatically update company_product_history when invoices are paid
-- Fixes: Production-breaking bug where purchases don't flow to reorder portal
-- Date: 2025-12-18
-- ============================================================================

-- Function to update company_product_history when invoice is paid
CREATE OR REPLACE FUNCTION update_facts_on_invoice_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run if invoice is being marked as paid
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN

    -- Update company_product_history for each invoice item
    INSERT INTO company_product_history (
      company_id,
      product_code,
      product_type,
      first_purchased_at,
      last_purchased_at,
      total_purchases,
      total_quantity,
      source,
      created_at,
      updated_at
    )
    SELECT
      NEW.company_id,
      ii.product_code,
      p.type AS product_type,
      NOW() AS first_purchased_at,
      NOW() AS last_purchased_at,
      1 AS total_purchases,
      ii.quantity AS total_quantity,
      'invoice' AS source,
      NOW() AS created_at,
      NOW() AS updated_at
    FROM invoice_items ii
    JOIN products p ON ii.product_code = p.product_code
    WHERE ii.invoice_id = NEW.invoice_id
    ON CONFLICT (company_id, product_code) DO UPDATE
    SET
      last_purchased_at = NOW(),
      total_purchases = company_product_history.total_purchases + 1,
      total_quantity = company_product_history.total_quantity + EXCLUDED.total_quantity,
      updated_at = NOW();

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_facts_on_invoice_paid ON invoices;
CREATE TRIGGER trigger_update_facts_on_invoice_paid
  AFTER UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_facts_on_invoice_paid();

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this after creating the trigger to verify it exists:

SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_facts_on_invoice_paid';

-- Expected result: 1 row showing the trigger on the invoices table
-- ============================================================================
