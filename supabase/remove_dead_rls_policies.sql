-- =====================================================
-- Remove Dead RLS Policies
-- Run this in Supabase SQL Editor
-- =====================================================
--
-- CONTEXT: These RLS policies are defined but NOT ENFORCED because:
-- 1. RLS is DISABLED on these tables
-- 2. All API routes use service role (bypasses RLS)
-- 3. Authentication is handled in API routes via getCurrentUser()
-- 4. Territory permissions handled via canActOnCompany()
--
-- These policies are dead code and should be removed.
-- =====================================================

-- Remove companies RLS policies (RLS is DISABLED on this table)
DROP POLICY IF EXISTS companies_delete_directors ON companies;
DROP POLICY IF EXISTS companies_insert_all_staff ON companies;
DROP POLICY IF EXISTS companies_select_all_staff ON companies;
DROP POLICY IF EXISTS companies_select_distributors ON companies;
DROP POLICY IF EXISTS companies_update_all_staff ON companies;

-- Remove shipping_addresses RLS policies (RLS is DISABLED on this table)
DROP POLICY IF EXISTS shipping_addresses_insert_distributors ON shipping_addresses;
DROP POLICY IF EXISTS shipping_addresses_modify_all_staff ON shipping_addresses;
DROP POLICY IF EXISTS shipping_addresses_modify_staff ON shipping_addresses;
DROP POLICY IF EXISTS shipping_addresses_select_all_staff ON shipping_addresses;
DROP POLICY IF EXISTS shipping_addresses_select_distributors ON shipping_addresses;
DROP POLICY IF EXISTS shipping_addresses_update_distributors ON shipping_addresses;

-- Verify RLS is disabled (should return DISABLED for both)
SELECT
  c.relname as table_name,
  CASE c.relrowsecurity
    WHEN true THEN 'ENABLED'
    ELSE 'DISABLED'
  END as rls_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname = 'public'
  AND c.relname IN ('companies', 'shipping_addresses')
ORDER BY c.relname;

-- Expected output:
-- table_name            | rls_status
-- ----------------------+-----------
-- companies             | DISABLED
-- shipping_addresses    | DISABLED
