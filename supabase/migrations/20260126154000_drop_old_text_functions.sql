-- Drop old TEXT versions of functions to prevent PostgREST ambiguity
-- These were replaced with UUID versions in 20260126152110_fix_remaining_functions_uuid.sql

-- Drop old TEXT version of regenerate_company_payload
DROP FUNCTION IF EXISTS public.regenerate_company_payload(text);

-- Drop old TEXT version of upsert_company_consumable
DROP FUNCTION IF EXISTS public.upsert_company_consumable(text, text, date, integer, numeric, text);

-- Drop old TEXT version of upsert_company_product_history
DROP FUNCTION IF EXISTS public.upsert_company_product_history(text, text, text, date, integer);

-- Drop old TEXT version of upsert_company_tool
DROP FUNCTION IF EXISTS public.upsert_company_tool(text, text, date, integer, numeric, text);
