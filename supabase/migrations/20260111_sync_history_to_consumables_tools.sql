-- ============================================================================
-- Sync company_product_history → company_consumables & company_tools
-- ============================================================================
-- When product_history is updated, automatically sync to specialized tables
-- This keeps company_consumables and company_tools in perfect sync

-- Function: Sync consumables from product_history
CREATE OR REPLACE FUNCTION sync_product_history_to_consumables()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process consumable products
  IF NEW.product_type = 'consumable' THEN

    -- Upsert into company_consumables
    INSERT INTO company_consumables (
      company_id,
      consumable_code,
      first_ordered_at,
      last_ordered_at,
      total_orders,
      total_quantity,
      last_order_amount,
      last_order_quantity
    ) VALUES (
      NEW.company_id,
      NEW.product_code,
      NEW.first_purchased_at,
      NEW.last_purchased_at,
      NEW.total_purchases,
      NEW.total_quantity,
      NULL, -- We don't track amount in product_history
      NULL  -- We don't track last order quantity separately
    )
    ON CONFLICT (company_id, consumable_code)
    DO UPDATE SET
      first_ordered_at = LEAST(company_consumables.first_ordered_at, EXCLUDED.first_ordered_at),
      last_ordered_at = GREATEST(company_consumables.last_ordered_at, EXCLUDED.last_ordered_at),
      total_orders = EXCLUDED.total_orders,
      total_quantity = EXCLUDED.total_quantity;

    RAISE NOTICE 'Synced consumable % for company % to company_consumables', NEW.product_code, NEW.company_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Sync tools from product_history
CREATE OR REPLACE FUNCTION sync_product_history_to_tools()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process tool products
  IF NEW.product_type = 'tool' THEN

    -- Upsert into company_tools
    INSERT INTO company_tools (
      company_id,
      tool_code,
      first_seen_at,
      last_seen_at,
      total_units
    ) VALUES (
      NEW.company_id,
      NEW.product_code,
      NEW.first_purchased_at,
      NEW.last_purchased_at,
      NEW.total_quantity
    )
    ON CONFLICT (company_id, tool_code)
    DO UPDATE SET
      first_seen_at = LEAST(company_tools.first_seen_at, EXCLUDED.first_seen_at),
      last_seen_at = GREATEST(company_tools.last_seen_at, EXCLUDED.last_seen_at),
      total_units = EXCLUDED.total_units;

    RAISE NOTICE 'Synced tool % for company % to company_tools', NEW.product_code, NEW.company_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on company_product_history for consumables
DROP TRIGGER IF EXISTS trigger_sync_history_to_consumables ON company_product_history;
CREATE TRIGGER trigger_sync_history_to_consumables
  AFTER INSERT OR UPDATE ON company_product_history
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_history_to_consumables();

-- Trigger on company_product_history for tools
DROP TRIGGER IF EXISTS trigger_sync_history_to_tools ON company_product_history;
CREATE TRIGGER trigger_sync_history_to_tools
  AFTER INSERT OR UPDATE ON company_product_history
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_history_to_tools();

COMMENT ON FUNCTION sync_product_history_to_consumables() IS
  'Automatically syncs consumable purchases from company_product_history to company_consumables';

COMMENT ON FUNCTION sync_product_history_to_tools() IS
  'Automatically syncs tool purchases from company_product_history to company_tools';
