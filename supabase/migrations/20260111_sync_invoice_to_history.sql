-- ============================================================================
-- Sync invoice_items → company_product_history when invoice is paid
-- ============================================================================
-- This replaces the old orders-based system with a clean invoice-led flow
-- When invoices are paid, automatically populate company_product_history

-- Function: Sync paid invoice items to company_product_history
CREATE OR REPLACE FUNCTION sync_invoice_to_product_history()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id TEXT;
  v_invoice_date DATE;
  v_payment_status TEXT;
  v_product_type TEXT;
  v_item RECORD;
BEGIN
  -- Only process if invoice is paid
  IF (TG_OP = 'INSERT' AND NEW.payment_status = 'paid') OR
     (TG_OP = 'UPDATE' AND OLD.payment_status != 'paid' AND NEW.payment_status = 'paid') THEN

    -- Get company_id and invoice_date from the invoice
    SELECT company_id, invoice_date, payment_status
    INTO v_company_id, v_invoice_date, v_payment_status
    FROM invoices
    WHERE invoice_id = NEW.invoice_id;

    -- Only proceed if invoice is actually paid
    IF v_payment_status != 'paid' THEN
      RETURN NEW;
    END IF;

    -- Loop through all items in this invoice
    FOR v_item IN
      SELECT product_code, quantity
      FROM invoice_items
      WHERE invoice_id = NEW.invoice_id
    LOOP
      -- Get product type from products table
      SELECT type INTO v_product_type
      FROM products
      WHERE product_code = v_item.product_code;

      -- Default to 'other' if product not found
      IF v_product_type IS NULL THEN
        v_product_type := 'other';
      END IF;

      -- Upsert into company_product_history
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
      ) VALUES (
        v_company_id,
        v_item.product_code,
        v_product_type,
        v_invoice_date,
        v_invoice_date,
        1,
        v_item.quantity,
        'invoice',
        NOW(),
        NOW()
      )
      ON CONFLICT (company_id, product_code)
      DO UPDATE SET
        last_purchased_at = EXCLUDED.last_purchased_at,
        total_purchases = company_product_history.total_purchases + 1,
        total_quantity = company_product_history.total_quantity + EXCLUDED.total_quantity,
        updated_at = NOW();
    END LOOP;

    RAISE NOTICE 'Synced invoice % items to product_history for company %', NEW.invoice_id, v_company_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on invoices table when payment_status changes to 'paid'
DROP TRIGGER IF EXISTS trigger_sync_invoice_to_history ON invoices;
CREATE TRIGGER trigger_sync_invoice_to_history
  AFTER INSERT OR UPDATE OF payment_status ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION sync_invoice_to_product_history();

COMMENT ON FUNCTION sync_invoice_to_product_history() IS
  'Automatically syncs paid invoice items to company_product_history. Maintains purchase counts and dates.';
