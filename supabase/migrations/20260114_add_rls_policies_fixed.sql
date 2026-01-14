-- ============================================================================
-- Row Level Security (RLS) Policies - FIXED VERSION
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

-- Helper function to get current user's role from JWT (in public schema)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    NULL
  )::TEXT;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to get current user's sales_rep_id from JWT
CREATE OR REPLACE FUNCTION public.current_user_sales_rep_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sales_rep_id',
    NULL
  )::TEXT;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to get current user's company_id (for distributors)
CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'company_id',
    NULL
  )::TEXT;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_directors" ON users;
DROP POLICY IF EXISTS "users_update_directors" ON users;
DROP POLICY IF EXISTS "users_insert_directors" ON users;

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
    public.current_user_role() = 'director'
  );

-- Directors can update any user
CREATE POLICY "users_update_directors" ON users
  FOR UPDATE
  USING (
    public.current_user_role() = 'director'
  );

-- Directors can insert new users
CREATE POLICY "users_insert_directors" ON users
  FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'director'
  );

-- ============================================================================
-- 2. COMPANIES TABLE
-- ============================================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "companies_select_directors" ON companies;
DROP POLICY IF EXISTS "companies_select_sales_reps" ON companies;
DROP POLICY IF EXISTS "companies_select_distributors" ON companies;
DROP POLICY IF EXISTS "companies_update_directors" ON companies;
DROP POLICY IF EXISTS "companies_update_sales_reps" ON companies;
DROP POLICY IF EXISTS "companies_insert_directors" ON companies;
DROP POLICY IF EXISTS "companies_delete_directors" ON companies;

-- Directors see all companies
CREATE POLICY "companies_select_directors" ON companies
  FOR SELECT
  USING (
    public.current_user_role() = 'director'
  );

-- Sales reps see their assigned companies
CREATE POLICY "companies_select_sales_reps" ON companies
  FOR SELECT
  USING (
    public.current_user_role() = 'sales_rep'
    AND account_owner = public.current_user_sales_rep_id()
  );

-- Distributors see their own company
CREATE POLICY "companies_select_distributors" ON companies
  FOR SELECT
  USING (
    company_id = public.current_user_company_id()
  );

-- Directors can update any company
CREATE POLICY "companies_update_directors" ON companies
  FOR UPDATE
  USING (
    public.current_user_role() = 'director'
  );

-- Sales reps can update their assigned companies
CREATE POLICY "companies_update_sales_reps" ON companies
  FOR UPDATE
  USING (
    public.current_user_role() = 'sales_rep'
    AND account_owner = public.current_user_sales_rep_id()
  );

-- Directors can insert companies
CREATE POLICY "companies_insert_directors" ON companies
  FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'director'
  );

-- Directors can delete companies
CREATE POLICY "companies_delete_directors" ON companies
  FOR DELETE
  USING (
    public.current_user_role() = 'director'
  );

-- ============================================================================
-- 3. CONTACTS TABLE
-- ============================================================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_select_directors" ON contacts;
DROP POLICY IF EXISTS "contacts_select_sales_reps" ON contacts;
DROP POLICY IF EXISTS "contacts_select_distributors" ON contacts;
DROP POLICY IF EXISTS "contacts_modify_admins" ON contacts;

-- Directors see all contacts
CREATE POLICY "contacts_select_directors" ON contacts
  FOR SELECT
  USING (
    public.current_user_role() = 'director'
  );

-- Sales reps see contacts for their companies
CREATE POLICY "contacts_select_sales_reps" ON contacts
  FOR SELECT
  USING (
    public.current_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = contacts.company_id
      AND companies.account_owner = public.current_user_sales_rep_id()
    )
  );

-- Distributors see contacts for their company
CREATE POLICY "contacts_select_distributors" ON contacts
  FOR SELECT
  USING (
    company_id = public.current_user_company_id()
  );

-- Directors and sales reps can insert/update/delete contacts
CREATE POLICY "contacts_modify_admins" ON contacts
  FOR ALL
  USING (
    public.current_user_role() IN ('director', 'sales_rep')
  );

-- ============================================================================
-- 4. QUOTES TABLE
-- ============================================================================
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotes_select_directors" ON quotes;
DROP POLICY IF EXISTS "quotes_select_sales_reps" ON quotes;
DROP POLICY IF EXISTS "quotes_select_distributors" ON quotes;
DROP POLICY IF EXISTS "quotes_modify_admins" ON quotes;

-- Directors see all quotes
CREATE POLICY "quotes_select_directors" ON quotes
  FOR SELECT
  USING (
    public.current_user_role() = 'director'
  );

-- Sales reps see quotes for their companies
CREATE POLICY "quotes_select_sales_reps" ON quotes
  FOR SELECT
  USING (
    public.current_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = quotes.company_id
      AND companies.account_owner = public.current_user_sales_rep_id()
    )
  );

-- Distributors see quotes for their company
CREATE POLICY "quotes_select_distributors" ON quotes
  FOR SELECT
  USING (
    company_id = public.current_user_company_id()
  );

-- Directors and sales reps can create/update quotes
CREATE POLICY "quotes_modify_admins" ON quotes
  FOR ALL
  USING (
    public.current_user_role() IN ('director', 'sales_rep')
  );

-- ============================================================================
-- 5. INVOICES TABLE
-- ============================================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_select_directors" ON invoices;
DROP POLICY IF EXISTS "invoices_select_sales_reps" ON invoices;
DROP POLICY IF EXISTS "invoices_select_distributors" ON invoices;
DROP POLICY IF EXISTS "invoices_modify_directors" ON invoices;

-- Directors see all invoices
CREATE POLICY "invoices_select_directors" ON invoices
  FOR SELECT
  USING (
    public.current_user_role() = 'director'
  );

-- Sales reps see invoices for their companies
CREATE POLICY "invoices_select_sales_reps" ON invoices
  FOR SELECT
  USING (
    public.current_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = invoices.company_id
      AND companies.account_owner = public.current_user_sales_rep_id()
    )
  );

-- Distributors see invoices for their company
CREATE POLICY "invoices_select_distributors" ON invoices
  FOR SELECT
  USING (
    company_id = public.current_user_company_id()
  );

-- Only directors can modify invoices (financial data)
CREATE POLICY "invoices_modify_directors" ON invoices
  FOR ALL
  USING (
    public.current_user_role() = 'director'
  );

-- ============================================================================
-- 6. SUBSCRIPTIONS TABLE
-- ============================================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_directors" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_sales_reps" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_distributors" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_modify_admins" ON subscriptions;

-- Directors see all subscriptions
CREATE POLICY "subscriptions_select_directors" ON subscriptions
  FOR SELECT
  USING (
    public.current_user_role() = 'director'
  );

-- Sales reps see subscriptions for their companies
CREATE POLICY "subscriptions_select_sales_reps" ON subscriptions
  FOR SELECT
  USING (
    public.current_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = subscriptions.company_id
      AND companies.account_owner = public.current_user_sales_rep_id()
    )
  );

-- Distributors see their company's subscriptions
CREATE POLICY "subscriptions_select_distributors" ON subscriptions
  FOR SELECT
  USING (
    company_id = public.current_user_company_id()
  );

-- Directors and sales reps can modify subscriptions
CREATE POLICY "subscriptions_modify_admins" ON subscriptions
  FOR ALL
  USING (
    public.current_user_role() IN ('director', 'sales_rep')
  );

-- ============================================================================
-- 7. SHIPPING_ADDRESSES TABLE
-- ============================================================================
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipping_addresses_select_directors" ON shipping_addresses;
DROP POLICY IF EXISTS "shipping_addresses_select_sales_reps" ON shipping_addresses;
DROP POLICY IF EXISTS "shipping_addresses_select_distributors" ON shipping_addresses;
DROP POLICY IF EXISTS "shipping_addresses_modify_admins" ON shipping_addresses;

-- Directors see all addresses
CREATE POLICY "shipping_addresses_select_directors" ON shipping_addresses
  FOR SELECT
  USING (
    public.current_user_role() = 'director'
  );

-- Sales reps see addresses for their companies
CREATE POLICY "shipping_addresses_select_sales_reps" ON shipping_addresses
  FOR SELECT
  USING (
    public.current_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = shipping_addresses.company_id
      AND companies.account_owner = public.current_user_sales_rep_id()
    )
  );

-- Distributors see their company's addresses
CREATE POLICY "shipping_addresses_select_distributors" ON shipping_addresses
  FOR SELECT
  USING (
    company_id = public.current_user_company_id()
  );

-- Directors and sales reps can modify addresses
CREATE POLICY "shipping_addresses_modify_admins" ON shipping_addresses
  FOR ALL
  USING (
    public.current_user_role() IN ('director', 'sales_rep')
  );

-- ============================================================================
-- 8. ENGAGEMENT_EVENTS TABLE
-- ============================================================================
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "engagement_events_select_directors" ON engagement_events;
DROP POLICY IF EXISTS "engagement_events_select_sales_reps" ON engagement_events;
DROP POLICY IF EXISTS "engagement_events_insert_all" ON engagement_events;
DROP POLICY IF EXISTS "engagement_events_delete_directors" ON engagement_events;

-- Directors see all engagement
CREATE POLICY "engagement_events_select_directors" ON engagement_events
  FOR SELECT
  USING (
    public.current_user_role() = 'director'
  );

-- Sales reps see engagement for their companies
CREATE POLICY "engagement_events_select_sales_reps" ON engagement_events
  FOR SELECT
  USING (
    public.current_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = engagement_events.company_id
      AND companies.account_owner = public.current_user_sales_rep_id()
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
    public.current_user_role() = 'director'
  );

-- ============================================================================
-- 9. ACTIVITY_LOG TABLE
-- ============================================================================
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_log_select_directors" ON activity_log;
DROP POLICY IF EXISTS "activity_log_insert_all" ON activity_log;

-- Only directors can read activity logs (audit trail)
CREATE POLICY "activity_log_select_directors" ON activity_log
  FOR SELECT
  USING (
    public.current_user_role() = 'director'
  );

-- Anyone can insert activity logs (for audit trail)
CREATE POLICY "activity_log_insert_all" ON activity_log
  FOR INSERT
  WITH CHECK (true);

-- No one can update or delete activity logs (immutable audit trail)

-- ============================================================================
-- 10. SHIPPING_MANIFESTS TABLE
-- ============================================================================
-- Note: This table already had basic RLS - we're replacing with granular policies

DROP POLICY IF EXISTS "Admin full access to shipping manifests" ON shipping_manifests;
DROP POLICY IF EXISTS "shipping_manifests_select_directors" ON shipping_manifests;
DROP POLICY IF EXISTS "shipping_manifests_select_sales_reps" ON shipping_manifests;
DROP POLICY IF EXISTS "shipping_manifests_modify_directors" ON shipping_manifests;

-- Directors see all shipping manifests
CREATE POLICY "shipping_manifests_select_directors" ON shipping_manifests
  FOR SELECT
  USING (
    public.current_user_role() = 'director'
  );

-- Sales reps see manifests for their companies
CREATE POLICY "shipping_manifests_select_sales_reps" ON shipping_manifests
  FOR SELECT
  USING (
    public.current_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.company_id = shipping_manifests.company_id
      AND companies.account_owner = public.current_user_sales_rep_id()
    )
  );

-- Only directors can create/update/delete manifests
CREATE POLICY "shipping_manifests_modify_directors" ON shipping_manifests
  FOR ALL
  USING (
    public.current_user_role() = 'director'
  );

-- ============================================================================
-- 11. SUBSCRIPTION_EVENTS TABLE
-- ============================================================================
-- Note: This table already had basic RLS - we're replacing with granular policies

DROP POLICY IF EXISTS "Admin full access to subscription events" ON subscription_events;
DROP POLICY IF EXISTS "subscription_events_select_directors" ON subscription_events;
DROP POLICY IF EXISTS "subscription_events_select_sales_reps" ON subscription_events;
DROP POLICY IF EXISTS "subscription_events_insert_all" ON subscription_events;

-- Directors see all subscription events
CREATE POLICY "subscription_events_select_directors" ON subscription_events
  FOR SELECT
  USING (
    public.current_user_role() = 'director'
  );

-- Sales reps see events for subscriptions of their companies
CREATE POLICY "subscription_events_select_sales_reps" ON subscription_events
  FOR SELECT
  USING (
    public.current_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM subscriptions
      JOIN companies ON companies.company_id = subscriptions.company_id
      WHERE subscriptions.subscription_id = subscription_events.subscription_id
      AND companies.account_owner = public.current_user_sales_rep_id()
    )
  );

-- Anyone can insert subscription events (for webhook tracking)
CREATE POLICY "subscription_events_insert_all" ON subscription_events
  FOR INSERT
  WITH CHECK (true);

-- Only directors can delete subscription events
CREATE POLICY "subscription_events_delete_directors" ON subscription_events
  FOR DELETE
  USING (
    public.current_user_role() = 'director'
  );

-- ============================================================================
-- DONE
-- ============================================================================
-- These policies are now in place but NOT enforced while using service role key
-- To activate: Switch from getSupabaseClient() with service role to authenticated client
--
-- Updated 11 tables total:
-- 1. users
-- 2. companies
-- 3. contacts
-- 4. quotes
-- 5. invoices
-- 6. subscriptions (replaced basic policy with granular)
-- 7. shipping_addresses
-- 8. engagement_events
-- 9. activity_log
-- 10. shipping_manifests (replaced basic policy with granular)
-- 11. subscription_events (replaced basic policy with granular)
--
-- Left unchanged: site_branding (public read access is intentional)
-- ============================================================================
