-- Fix search_path vulnerability in all database functions
-- This prevents potential SQL injection via search path manipulation
-- No functional changes - purely security hardening

-- Set search_path to public for all affected functions (with correct signatures)
ALTER FUNCTION calculate_shipping_cost(p_country_code text, p_order_subtotal numeric) SET search_path = public;
ALTER FUNCTION current_user_company_id() SET search_path = public;
ALTER FUNCTION current_user_role() SET search_path = public;
ALTER FUNCTION current_user_sales_rep_id() SET search_path = public;
ALTER FUNCTION generate_rental_serial_number() SET search_path = public;
ALTER FUNCTION regenerate_company_payload(p_company_id text) SET search_path = public;
ALTER FUNCTION set_engagement_company_from_contact() SET search_path = public;
ALTER FUNCTION set_rental_serial_number() SET search_path = public;
ALTER FUNCTION set_updated_at() SET search_path = public;
ALTER FUNCTION sync_invoice_to_product_history() SET search_path = public;
ALTER FUNCTION sync_product_history_to_consumables() SET search_path = public;
ALTER FUNCTION sync_product_history_to_tools() SET search_path = public;
ALTER FUNCTION update_company_machine_updated_at() SET search_path = public;
ALTER FUNCTION update_quote_requests_updated_at() SET search_path = public;
ALTER FUNCTION update_quotes_updated_at() SET search_path = public;
ALTER FUNCTION update_updated_at_column() SET search_path = public;
ALTER FUNCTION update_users_updated_at() SET search_path = public;
ALTER FUNCTION upsert_company_consumable(p_company_id text, p_consumable_code text, p_order_date date, p_quantity integer, p_amount numeric, p_invoice_id text) SET search_path = public;
ALTER FUNCTION upsert_company_product_history(p_company_id text, p_product_code text, p_product_type text, p_purchase_date date, p_quantity integer) SET search_path = public;
ALTER FUNCTION upsert_company_tool(p_company_id text, p_tool_code text, p_purchase_date date, p_quantity integer, p_amount numeric, p_invoice_id text) SET search_path = public;
