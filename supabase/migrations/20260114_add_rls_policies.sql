-- ============================================================================
-- Row Level Security (RLS) Policies
-- Protects sensitive customer and business data
-- ============================================================================
--
-- IMPORTANT: These policies won't be enforced while using SUPABASE_SERVICE_ROLE_KEY
-- They activate when switching to authenticated Supabase client with proper JWT tokens
--
-- Access Levels:
-- - Directors: See all data across all companies
-- - Sales Reps: See only companies assigned to them (account_owner = their sales_rep_id)
-- - Distributors: See only their own company data (authenticated via JWT)
-- ============================================================================

-- Helper function to get current user's role from JWT
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    NULL
  )::TEXT;
$$ LANGUAGE SQL STABLE;

-- Helper function to get current user's sales_rep_id from JWT
CREATE OR REPLACE FUNCTION auth.user_sales_rep_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sales_rep_id',
    NULL
  )::TEXT;
$$ LANGUAGE SQL STABLE;

-- Helper function to get current user's company_id (for distributors)
CREATE OR REPLACE FUNCTION auth.user_company_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'company_id',
    NULL
  )::TEXT;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own record
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (
    auth.uid()::TEXT = user_id::TEXT
  );

-- Directors can read all users
CREATE POLICY "users_select_directors" ON users
  FOR SELECT
  USING (
    auth.user_role() = 'director'
  );

-- Directors can update any user
CREATE POLICY "users_update_directors" ON users
  FOR UPDATE
  USING (
    auth.user_role() = 'director'
  );

-- Directors can insert new users
CREATE POLICY "users_insert_directors" ON users
  FOR INSERT
  WITH CHECK (
    auth.user_role() = 'director'
  );

-- ============================================================================
-- 2. COMPANIES TABLE
-- ============================================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Directors see all companies
CREATE POLICY "companies_select_directors" ON companies
  FOR SELECT
  USING (
    auth.user_role() = 'director'
  );

-- Sales reps see their assigned companies
CREATE POLICY "companies_select_sales_reps" ON companies
  FOR SELECT
  USING (
    auth.user_role() = 'sales_rep'
    AND account_owner = auth.user_sales_rep_id()
  );

-- Distributors see their own company
CREATE POLICY "companies_select_distributors" ON companies
  FOR SELECT
  USING (
    company_id = auth.user_company_id()
  );

-- Directors can update any company
CREATE POLICY "companies_update_directors" ON companies
  FOR UPDATE
  USING (
    auth.user_role() = 'director'
  );

-- Sales reps can update their assigned companies
CREATE POLICY "companies_update_sales_reps" ON companies
  FOR UPDATE
  USING (
    auth.user_role() = 'sales_rep'
    AND account_owner = auth.user_sales_rep_id()
  );

-- Directors can insert companies
CREATE POLICY "companies_insert_directors" ON companies
  FOR INSERT
  WITH CHECK (
    auth.user_role() = 'director'
  );

-- Directors can delete companies
CREATE POLICY "companies_delete_directors" ON companies
  FOR DELETE
  USING (
    auth.user_role() = 'director'
  );

-- ============================================================================
-- 3. CONTACTS TABLE
-- ============================================================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Directors see all contacts
CREATE POLICY "contacts_select_directors" ON contacts
  FOR SELECT
  USING (
    auth.user_role() = 'director'
  );

-- Sales reps see contacts for their companies
CREATE POLICY "contacts_select_sales_reps" ON contacts
  FOR SELECT
  USING (
    auth.user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = contacts.company_id
      AND companies.account_owner = auth.user_sales_rep_id()
    )
  );

-- Distributors see contacts for their company
CREATE POLICY "contacts_select_distributors" ON contacts
  FOR SELECT
  USING (
    company_id = auth.user_company_id()
  );

-- Directors and sales reps can insert/update/delete contacts
CREATE POLICY "contacts_modify_admins" ON contacts
  FOR ALL
  USING (
    auth.user_role() IN ('director', 'sales_rep')
  );

-- ============================================================================
-- 4. QUOTES TABLE
-- ============================================================================
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Directors see all quotes
CREATE POLICY "quotes_select_directors" ON quotes
  FOR SELECT
  USING (
    auth.user_role() = 'director'
  );

-- Sales reps see quotes for their companies
CREATE POLICY "quotes_select_sales_reps" ON quotes
  FOR SELECT
  USING (
    auth.user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = quotes.company_id
      AND companies.account_owner = auth.user_sales_rep_id()
    )
  );

-- Distributors see quotes for their company
CREATE POLICY "quotes_select_distributors" ON quotes
  FOR SELECT
  USING (
    company_id = auth.user_company_id()
  );

-- Directors and sales reps can create/update quotes
CREATE POLICY "quotes_modify_admins" ON quotes
  FOR ALL
  USING (
    auth.user_role() IN ('director', 'sales_rep')
  );

-- ============================================================================
-- 5. INVOICES TABLE
-- ============================================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Directors see all invoices
CREATE POLICY "invoices_select_directors" ON invoices
  FOR SELECT
  USING (
    auth.user_role() = 'director'
  );

-- Sales reps see invoices for their companies
CREATE POLICY "invoices_select_sales_reps" ON invoices
  FOR SELECT
  USING (
    auth.user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = invoices.company_id
      AND companies.account_owner = auth.user_sales_rep_id()
    )
  );

-- Distributors see invoices for their company
CREATE POLICY "invoices_select_distributors" ON invoices
  FOR SELECT
  USING (
    company_id = auth.user_company_id()
  );

-- Only directors can modify invoices (financial data)
CREATE POLICY "invoices_modify_directors" ON invoices
  FOR ALL
  USING (
    auth.user_role() = 'director'
  );

-- ============================================================================
-- 6. SUBSCRIPTIONS TABLE
-- ============================================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Directors see all subscriptions
CREATE POLICY "subscriptions_select_directors" ON subscriptions
  FOR SELECT
  USING (
    auth.user_role() = 'director'
  );

-- Sales reps see subscriptions for their companies
CREATE POLICY "subscriptions_select_sales_reps" ON subscriptions
  FOR SELECT
  USING (
    auth.user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = subscriptions.company_id
      AND companies.account_owner = auth.user_sales_rep_id()
    )
  );

-- Distributors see their company's subscriptions
CREATE POLICY "subscriptions_select_distributors" ON subscriptions
  FOR SELECT
  USING (
    company_id = auth.user_company_id()
  );

-- Directors and sales reps can modify subscriptions
CREATE POLICY "subscriptions_modify_admins" ON subscriptions
  FOR ALL
  USING (
    auth.user_role() IN ('director', 'sales_rep')
  );

-- ============================================================================
-- 7. SHIPPING_ADDRESSES TABLE
-- ============================================================================
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Directors see all addresses
CREATE POLICY "shipping_addresses_select_directors" ON shipping_addresses
  FOR SELECT
  USING (
    auth.user_role() = 'director'
  );

-- Sales reps see addresses for their companies
CREATE POLICY "shipping_addresses_select_sales_reps" ON shipping_addresses
  FOR SELECT
  USING (
    auth.user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = shipping_addresses.company_id
      AND companies.account_owner = auth.user_sales_rep_id()
    )
  );

-- Distributors see their company's addresses
CREATE POLICY "shipping_addresses_select_distributors" ON shipping_addresses
  FOR SELECT
  USING (
    company_id = auth.user_company_id()
  );

-- Directors and sales reps can modify addresses
CREATE POLICY "shipping_addresses_modify_admins" ON shipping_addresses
  FOR ALL
  USING (
    auth.user_role() IN ('director', 'sales_rep')
  );

-- ============================================================================
-- 8. ENGAGEMENT_EVENTS TABLE
-- ============================================================================
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

-- Directors see all engagement
CREATE POLICY "engagement_events_select_directors" ON engagement_events
  FOR SELECT
  USING (
    auth.user_role() = 'director'
  );

-- Sales reps see engagement for their companies
CREATE POLICY "engagement_events_select_sales_reps" ON engagement_events
  FOR SELECT
  USING (
    auth.user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = engagement_events.company_id
      AND companies.account_owner = auth.user_sales_rep_id()
    )
  );

-- Anyone can insert engagement events (for tracking)
CREATE POLICY "engagement_events_insert_all" ON engagement_events
  FOR INSERT
  WITH CHECK (true);

-- Only directors can delete engagement events
CREATE POLICY "engagement_events_delete_directors" ON engagement_events
  FOR DELETE
  USING (
    auth.user_role() = 'director'
  );

-- ============================================================================
-- 9. ACTIVITY_LOG TABLE
-- ============================================================================
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Only directors can read activity logs (audit trail)
CREATE POLICY "activity_log_select_directors" ON activity_log
  FOR SELECT
  USING (
    auth.user_role() = 'director'
  );

-- Anyone can insert activity logs (for audit trail)
CREATE POLICY "activity_log_insert_all" ON activity_log
  FOR INSERT
  WITH CHECK (true);

-- No one can update or delete activity logs (immutable audit trail)
-- (Directors can do this via service role if absolutely necessary)

-- ============================================================================
-- DONE
-- ============================================================================
-- These policies are now in place but NOT enforced while using service role key
-- To activate: Switch from getSupabaseClient() with service role to authenticated client
-- ============================================================================
