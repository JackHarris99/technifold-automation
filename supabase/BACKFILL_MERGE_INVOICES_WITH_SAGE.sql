-- ============================================================================
-- SMART BACKFILL: Merge real invoice data with existing Sage data
-- ============================================================================
-- Existing rows (19,685) are from old Sage orders/order_items
-- This backfill adds REAL invoice data, merging with existing Sage history
-- where appropriate, or creating new entries for new products

DO $smart_backfill$
DECLARE
  v_new_entries INTEGER := 0;
  v_merged_entries INTEGER := 0;
  v_total_processed INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting smart backfill of real invoices...';

  -- Process all paid invoices and their items
  WITH invoice_aggregates AS (
    SELECT
      i.company_id,
      ii.product_code,
      MIN(i.invoice_date) as first_invoice_date,
      MAX(i.invoice_date) as last_invoice_date,
      COUNT(DISTINCT i.invoice_id) as invoice_count,
      SUM(ii.quantity) as total_qty
    FROM invoices i
    JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
    WHERE i.payment_status = 'paid'
    GROUP BY i.company_id, ii.product_code
  )
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
    ia.company_id,
    ia.product_code,
    COALESCE(p.type, 'other') as product_type,
    ia.first_invoice_date,
    ia.last_invoice_date,
    ia.invoice_count,
    ia.total_qty,
    'invoice_backfill',
    NOW(),
    NOW()
  FROM invoice_aggregates ia
  LEFT JOIN products p ON ia.product_code = p.product_code
  ON CONFLICT (company_id, product_code)
  DO UPDATE SET
    -- Keep earliest purchase date (probably from Sage)
    first_purchased_at = LEAST(
      company_product_history.first_purchased_at,
      EXCLUDED.first_purchased_at
    ),
    -- Update to latest purchase date (probably from invoices)
    last_purchased_at = GREATEST(
      company_product_history.last_purchased_at,
      EXCLUDED.last_purchased_at
    ),
    -- Add invoice purchases to existing count
    -- BUT only if we haven't already backfilled (prevent double-counting on re-run)
    total_purchases = CASE
      WHEN company_product_history.source IN ('invoice_backfill', 'invoice_and_sage', 'manual_and_invoice')
        THEN company_product_history.total_purchases  -- Already backfilled, don't add again
      ELSE company_product_history.total_purchases + EXCLUDED.total_purchases  -- Add invoice data to Sage data
    END,
    -- Add invoice quantity to existing quantity
    total_quantity = CASE
      WHEN company_product_history.source IN ('invoice_backfill', 'invoice_and_sage', 'manual_and_invoice')
        THEN company_product_history.total_quantity  -- Already backfilled, don't add again
      ELSE company_product_history.total_quantity + EXCLUDED.total_quantity  -- Add invoice data to Sage data
    END,
    -- Update source to indicate it now includes invoice data
    source = CASE
      WHEN company_product_history.source IN ('invoice_backfill', 'invoice_and_sage', 'manual_and_invoice')
        THEN company_product_history.source  -- Already merged, keep existing source
      WHEN company_product_history.source = 'manual'
        THEN 'manual_and_invoice'
      WHEN company_product_history.source = 'invoice'
        THEN 'invoice_and_sage'  -- Merge Sage data with invoice data
      ELSE 'invoice_backfill'
    END,
    updated_at = NOW();

  GET DIAGNOSTICS v_total_processed = ROW_COUNT;

  -- Count new vs merged
  SELECT COUNT(*) INTO v_new_entries
  FROM company_product_history
  WHERE source = 'invoice_backfill'
    AND created_at > NOW() - INTERVAL '5 seconds';

  v_merged_entries := v_total_processed - v_new_entries;

  RAISE NOTICE 'Smart backfill complete:';
  RAISE NOTICE '  - New product_history entries: %', v_new_entries;
  RAISE NOTICE '  - Merged with existing Sage data: %', v_merged_entries;
  RAISE NOTICE '  - Total processed: %', v_total_processed;

  -- The triggers on company_product_history will automatically sync updates
  -- to company_consumables and company_tools
END $smart_backfill$;

-- Verify the results
DO $verify$
DECLARE
  v_invoice_count INTEGER;
  v_backfill_count INTEGER;
  v_merged_count INTEGER;
  v_sage_only INTEGER;
  v_manual_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_invoice_count FROM company_product_history WHERE source = 'invoice';
  SELECT COUNT(*) INTO v_backfill_count FROM company_product_history WHERE source = 'invoice_backfill';
  SELECT COUNT(*) INTO v_merged_count FROM company_product_history WHERE source = 'invoice_and_sage';
  SELECT COUNT(*) INTO v_sage_only FROM company_product_history WHERE source NOT IN ('invoice', 'invoice_backfill', 'invoice_and_sage', 'manual', 'manual_and_invoice');
  SELECT COUNT(*) INTO v_manual_count FROM company_product_history WHERE source LIKE '%manual%';

  RAISE NOTICE '';
  RAISE NOTICE 'Post-backfill breakdown by source:';
  RAISE NOTICE '  - Old Sage data only: %', v_invoice_count - v_merged_count;
  RAISE NOTICE '  - Sage + Invoice merged: %', v_merged_count;
  RAISE NOTICE '  - Invoice only (new products): %', v_backfill_count;
  RAISE NOTICE '  - Manual entries: %', v_manual_count;
  RAISE NOTICE '  - TOTAL: %', (SELECT COUNT(*) FROM company_product_history);
END $verify$;
