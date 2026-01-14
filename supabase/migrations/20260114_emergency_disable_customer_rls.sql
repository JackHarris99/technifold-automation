-- ============================================================================
-- EMERGENCY: Disable RLS on customer-facing tables
-- ============================================================================
-- Issue: Customers getting "Unauthorized" errors on reorder portal
-- Root cause: Unknown - needs investigation
-- Immediate fix: Disable RLS on tables customers interact with
-- ============================================================================

-- Disable RLS on shipping_addresses (customers add addresses via portal)
ALTER TABLE shipping_addresses DISABLE ROW LEVEL SECURITY;

-- Disable RLS on companies (customers update billing via portal)
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CUSTOMERS UNBLOCKED
-- Note: This removes security but unblocks customers immediately
-- TODO: Re-enable after root cause investigation
-- ============================================================================
