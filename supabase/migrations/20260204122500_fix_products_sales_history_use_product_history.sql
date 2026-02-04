/**
 * Fix get_products_with_sales_history to use company_product_history
 * This is the authoritative source for purchase history
 * Also adds total_quantity_ordered column
 */

-- Drop the old function first to allow changing the return type
DROP FUNCTION IF EXISTS public.get_products_with_sales_history();

CREATE OR REPLACE FUNCTION public.get_products_with_sales_history()
RETURNS TABLE(
  product_code text,
  description text,
  type text,
  category text,
  pricing_tier text,
  price numeric,
  active boolean,
  is_marketable boolean,
  is_reminder_eligible boolean,
  show_in_distributor_portal boolean,
  currency text,
  weight_kg numeric,
  hs_code text,
  country_of_origin text,
  cost_price numeric,
  image_url text,
  last_sold_date date,
  times_sold bigint,
  total_quantity_ordered bigint,
  ever_sold boolean,
  dist_price_20 numeric,
  dist_price_30 numeric,
  dist_price_40 numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.product_code,
    p.description,
    p.type,
    p.category,
    p.pricing_tier,
    p.price,
    p.active,
    p.is_marketable,
    p.is_reminder_eligible,
    p.show_in_distributor_portal,
    p.currency,
    p.weight_kg,
    p.hs_code,
    p.country_of_origin,
    p.cost_price,
    p.image_url,
    -- Use company_product_history for accurate sales data
    MAX(cph.last_purchased_at)::date as last_sold_date,
    COALESCE(SUM(cph.total_purchases), 0)::bigint as times_sold,
    COALESCE(SUM(cph.total_quantity), 0)::bigint as total_quantity_ordered,
    (COALESCE(SUM(cph.total_purchases), 0) > 0) as ever_sold,
    -- ALWAYS use percentage-based calculations (ignore distributor_pricing table)
    (p.price * 0.80) as dist_price_20,
    (p.price * 0.70) as dist_price_30,
    (p.price * 0.60) as dist_price_40
  FROM products p
  LEFT JOIN company_product_history cph ON p.product_code = cph.product_code
  GROUP BY
    p.product_code,
    p.description,
    p.type,
    p.category,
    p.pricing_tier,
    p.price,
    p.active,
    p.is_marketable,
    p.is_reminder_eligible,
    p.show_in_distributor_portal,
    p.currency,
    p.weight_kg,
    p.hs_code,
    p.country_of_origin,
    p.cost_price,
    p.image_url
  ORDER BY p.product_code;
END;
$function$;
