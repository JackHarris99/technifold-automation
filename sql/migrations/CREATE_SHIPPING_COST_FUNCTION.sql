-- ============================================================================
-- CREATE SHIPPING COST CALCULATION FUNCTION
-- ============================================================================
-- Purpose: Calculate shipping cost based on country using shipping_rates table
-- Includes fallback logic for countries not in the table
-- Date: 2025-12-18
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  p_country_code TEXT,
  p_order_subtotal NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  v_shipping_cost NUMERIC;
  v_free_threshold NUMERIC;
BEGIN
  -- Look up shipping rate for the country
  SELECT
    rate_gbp,
    free_shipping_threshold
  INTO
    v_shipping_cost,
    v_free_threshold
  FROM shipping_rates
  WHERE
    country_code = UPPER(p_country_code)
    AND active = TRUE
  LIMIT 1;

  -- If country found in table
  IF FOUND THEN
    -- Check if order qualifies for free shipping
    IF v_free_threshold IS NOT NULL AND p_order_subtotal >= v_free_threshold THEN
      RETURN 0;
    END IF;

    RETURN COALESCE(v_shipping_cost, 0);
  END IF;

  -- ============================================================================
  -- FALLBACK LOGIC for countries NOT in shipping_rates table
  -- ============================================================================

  -- UK - free shipping (or low cost)
  IF UPPER(p_country_code) IN ('GB', 'UK') THEN
    RETURN 10.00; -- £10 UK shipping
  END IF;

  -- EU countries - medium cost
  IF UPPER(p_country_code) IN (
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ) THEN
    RETURN 50.00; -- £50 EU shipping
  END IF;

  -- European (non-EU) - medium-high cost
  IF UPPER(p_country_code) IN ('NO', 'CH', 'IS', 'LI') THEN
    RETURN 60.00; -- £60 European shipping
  END IF;

  -- North America - high cost
  IF UPPER(p_country_code) IN ('US', 'CA', 'MX') THEN
    RETURN 80.00; -- £80 North America shipping
  END IF;

  -- Rest of World - very high cost
  RETURN 100.00; -- £100 Rest of World shipping

END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION calculate_shipping_cost(TEXT, NUMERIC) TO anon, authenticated, service_role;

-- ============================================================================
-- EXAMPLE USAGE
-- ============================================================================
-- SELECT calculate_shipping_cost('GB', 100);  -- Returns: 10.00 (UK)
-- SELECT calculate_shipping_cost('FR', 100);  -- Returns: 50.00 (EU) or rate from table if exists
-- SELECT calculate_shipping_cost('US', 100);  -- Returns: 80.00 (USA) or rate from table if exists
-- SELECT calculate_shipping_cost('AU', 100);  -- Returns: 100.00 (Rest of World fallback)
-- ============================================================================

-- ============================================================================
-- TEST QUERIES
-- ============================================================================
-- Check which countries you have rates for:
-- SELECT country_code, zone_name, rate_gbp, free_shipping_threshold, active
-- FROM shipping_rates
-- ORDER BY zone_name, country_code;

-- Test the function with different countries:
-- SELECT
--   'GB' as country,
--   calculate_shipping_cost('GB', 100) as shipping_cost
-- UNION ALL
-- SELECT
--   'FR' as country,
--   calculate_shipping_cost('FR', 100) as shipping_cost
-- UNION ALL
-- SELECT
--   'US' as country,
--   calculate_shipping_cost('US', 100) as shipping_cost
-- UNION ALL
-- SELECT
--   'AU' as country,
--   calculate_shipping_cost('AU', 100) as shipping_cost;
-- ============================================================================
