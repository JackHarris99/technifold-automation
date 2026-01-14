-- ============================================================================
-- URGENT FIX: Allow distributors to add/update their own shipping addresses
-- ============================================================================
-- Issue: Customers getting "Unauthorized" when filling in addresses on reorder portal
-- Cause: RLS policies only allowed SELECT for distributors, not INSERT/UPDATE
-- Fix: Add policies allowing distributors to modify their own company's addresses
-- ============================================================================

-- Drop the existing "admins only" modify policy
DROP POLICY IF EXISTS "shipping_addresses_modify_admins" ON shipping_addresses;

-- Directors and sales reps can do everything
CREATE POLICY "shipping_addresses_modify_staff" ON shipping_addresses
  FOR ALL
  USING (
    public.current_user_role() IN ('director', 'sales_rep')
  );

-- Distributors can INSERT addresses for their own company
CREATE POLICY "shipping_addresses_insert_distributors" ON shipping_addresses
  FOR INSERT
  WITH CHECK (
    company_id = public.current_user_company_id()
  );

-- Distributors can UPDATE addresses for their own company
CREATE POLICY "shipping_addresses_update_distributors" ON shipping_addresses
  FOR UPDATE
  USING (
    company_id = public.current_user_company_id()
  );

-- ============================================================================
-- DEPLOYED - Distributors can now add and update their own addresses
-- ============================================================================
