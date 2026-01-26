-- Fix all remaining functions to use UUID instead of TEXT for company_id

-- 1. Fix regenerate_company_payload
CREATE OR REPLACE FUNCTION public.regenerate_company_payload(p_company_id uuid)  -- Changed from TEXT
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE companies
  SET
    portal_payload = (
      SELECT jsonb_build_object(
        'company_id', company_id,
        'company_name', company_name,
        'reorder_items', reorder_items,
        'by_tool_tabs', by_tool_tabs
      )
      FROM vw_company_consumable_payload
      WHERE company_id = p_company_id
    ),
    payload_generated_at = NOW()
  WHERE company_id = p_company_id;
END;
$function$;

-- 2. Fix upsert_company_consumable
CREATE OR REPLACE FUNCTION public.upsert_company_consumable(
  p_company_id uuid,  -- Changed from TEXT
  p_consumable_code text,
  p_order_date date,
  p_quantity integer,
  p_amount numeric,
  p_invoice_id text
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO company_consumables (
    company_id,
    consumable_code,
    first_ordered_at,
    last_ordered_at,
    total_orders,
    total_quantity,
    last_order_amount,
    last_order_quantity,
    last_invoice_id
  ) VALUES (
    p_company_id,
    p_consumable_code,
    p_order_date,
    p_order_date,
    1,
    p_quantity,
    p_amount,
    p_quantity,
    p_invoice_id
  )
  ON CONFLICT (company_id, consumable_code)
  DO UPDATE SET
    last_ordered_at = p_order_date,
    total_orders = company_consumables.total_orders + 1,
    total_quantity = company_consumables.total_quantity + p_quantity,
    last_order_amount = p_amount,
    last_order_quantity = p_quantity,
    last_invoice_id = p_invoice_id;
END;
$function$;

-- 3. Fix upsert_company_product_history
CREATE OR REPLACE FUNCTION public.upsert_company_product_history(
  p_company_id uuid,  -- Changed from TEXT
  p_product_code text,
  p_product_type text,
  p_purchase_date date,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO company_product_history (
    company_id,
    product_code,
    product_type,
    first_purchased_at,
    last_purchased_at,
    total_purchases,
    total_quantity,
    source
  ) VALUES (
    p_company_id,
    p_product_code,
    p_product_type,
    p_purchase_date,
    p_purchase_date,
    1,
    p_quantity,
    'invoice'
  )
  ON CONFLICT (company_id, product_code)
  DO UPDATE SET
    last_purchased_at = p_purchase_date,
    total_purchases = company_product_history.total_purchases + 1,
    total_quantity = company_product_history.total_quantity + p_quantity,
    updated_at = now();
END;
$function$;

-- 4. Fix upsert_company_tool
CREATE OR REPLACE FUNCTION public.upsert_company_tool(
  p_company_id uuid,  -- Changed from TEXT
  p_tool_code text,
  p_purchase_date date,
  p_quantity integer,
  p_amount numeric,
  p_invoice_id text
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO company_tools (
    company_id,
    tool_code,
    first_seen_at,
    last_seen_at,
    total_units
  ) VALUES (
    p_company_id,
    p_tool_code,
    p_purchase_date,
    p_purchase_date,
    p_quantity
  )
  ON CONFLICT (company_id, tool_code)
  DO UPDATE SET
    last_seen_at = p_purchase_date,
    total_units = company_tools.total_units + p_quantity;
END;
$function$;
