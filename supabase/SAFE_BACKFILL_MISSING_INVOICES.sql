-- ============================================================================
-- SAFE BACKFILL: Only process invoices NOT already in product_history
-- ============================================================================
-- This version won't double-count existing entries
-- It calculates the correct totals from scratch for missing entries

DO $safe_backfill$
DECLARE
  v_synced_count INTEGER := 0;
  v_skipped_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting safe backfill of missing paid invoices...';

  -- For each company+product combination in paid invoices
  WITH invoice_aggregates AS (
    SELECT
      i.company_id,
      ii.product_code,
      MIN(i.invoice_date) as first_date,
      MAX(i.invoice_date) as last_date,
      COUNT(DISTINCT i.invoice_id) as purchase_count,
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
    ia.first_date,
    ia.last_date,
    ia.purchase_count,
    ia.total_qty,
    'invoice_backfill',
    NOW(),
    NOW()
  FROM invoice_aggregates ia
  LEFT JOIN products p ON ia.product_code = p.product_code
  WHERE NOT EXISTS (
    -- Skip if this company+product already exists
    SELECT 1 FROM company_product_history cph
    WHERE cph.company_id = ia.company_id
      AND cph.product_code = ia.product_code
  );

  GET DIAGNOSTICS v_synced_count = ROW_COUNT;

  RAISE NOTICE 'Safe backfill complete:';
  RAISE NOTICE '  - Added % new entries', v_synced_count;
  RAISE NOTICE '  - Skipped existing entries (no double-counting)';

  -- The triggers on company_product_history will automatically sync to
  -- company_consumables and company_tools
END $safe_backfill$;

-- Verify the sync
DO $verify$
DECLARE
  v_invoice_count INTEGER;
  v_backfill_count INTEGER;
  v_manual_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_invoice_count FROM company_product_history WHERE source = 'invoice';
  SELECT COUNT(*) INTO v_backfill_count FROM company_product_history WHERE source = 'invoice_backfill';
  SELECT COUNT(*) INTO v_manual_count FROM company_product_history WHERE source = 'manual';

  RAISE NOTICE 'Post-backfill counts:';
  RAISE NOTICE '  - invoice (from trigger): %', v_invoice_count;
  RAISE NOTICE '  - invoice_backfill (from this migration): %', v_backfill_count;
  RAISE NOTICE '  - manual: %', v_manual_count;
  RAISE NOTICE '  - TOTAL: %', v_invoice_count + v_backfill_count + v_manual_count;
END $verify$;
