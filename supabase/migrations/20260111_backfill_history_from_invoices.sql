-- ============================================================================
-- ONE-TIME BACKFILL: Sync existing paid invoices to company_product_history
-- ============================================================================
-- This migration ensures all historical paid invoices are in product_history
-- Run this AFTER the triggers are created

DO $$
DECLARE
  v_invoice record;
  v_item record;
  v_product_type text;
  v_synced_count integer := 0;
BEGIN
  RAISE NOTICE 'Starting backfill of paid invoices to company_product_history...';

  -- Loop through all paid invoices
  FOR v_invoice IN
    SELECT invoice_id, company_id, invoice_date
    FROM invoices
    WHERE payment_status = 'paid'
    ORDER BY invoice_date ASC
  LOOP
    -- Loop through items in this invoice
    FOR v_item IN
      SELECT product_code, quantity
      FROM invoice_items
      WHERE invoice_id = v_invoice.invoice_id
    LOOP
      -- Get product type
      SELECT type INTO v_product_type
      FROM products
      WHERE product_code = v_item.product_code;

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
        v_invoice.company_id,
        v_item.product_code,
        v_product_type,
        v_invoice.invoice_date,
        v_invoice.invoice_date,
        1,
        v_item.quantity,
        'invoice_backfill',
        NOW(),
        NOW()
      )
      ON CONFLICT (company_id, product_code)
      DO UPDATE SET
        -- Keep earliest first_purchased_at
        first_purchased_at = LEAST(company_product_history.first_purchased_at, EXCLUDED.first_purchased_at),
        -- Keep latest last_purchased_at
        last_purchased_at = GREATEST(company_product_history.last_purchased_at, EXCLUDED.last_purchased_at),
        -- Increment counts
        total_purchases = company_product_history.total_purchases + 1,
        total_quantity = company_product_history.total_quantity + EXCLUDED.total_quantity,
        updated_at = NOW();

      v_synced_count := v_synced_count + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Backfill complete: Synced % invoice items to company_product_history', v_synced_count;

  -- The triggers on company_product_history will automatically sync to
  -- company_consumables and company_tools, so we don't need separate backfills
END $$;

-- Verify the sync
DO $$
DECLARE
  v_history_count integer;
  v_consumables_count integer;
  v_tools_count integer;
BEGIN
  SELECT COUNT(*) INTO v_history_count FROM company_product_history WHERE source IN ('invoice', 'invoice_backfill');
  SELECT COUNT(*) INTO v_consumables_count FROM company_consumables;
  SELECT COUNT(*) INTO v_tools_count FROM company_tools;

  RAISE NOTICE 'Post-backfill counts:';
  RAISE NOTICE '  - company_product_history (from invoices): %', v_history_count;
  RAISE NOTICE '  - company_consumables: %', v_consumables_count;
  RAISE NOTICE '  - company_tools: %', v_tools_count;
END $$;
