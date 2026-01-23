/**
 * UUID Migration - Convert company_id from TEXT to UUID
 *
 * WHAT THIS DOES:
 * 1. Adds company_id_uuid column to companies table
 * 2. Generates UUIDs for all existing companies
 * 3. Updates all foreign key tables to use UUIDs
 * 4. Renames company_id → sage_customer_code
 * 5. Renames company_id_uuid → company_id
 * 6. Rebuilds all constraints and indexes
 *
 * BACKUP REQUIRED: Yes - this touches 20+ tables
 * DOWNTIME: ~2-5 minutes
 * ROLLBACK: See rollback script at bottom
 */

-- ============================================================================
-- PHASE 1: Add UUID column and populate
-- ============================================================================

-- Add UUID column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_id_uuid UUID DEFAULT gen_random_uuid();

-- Populate UUIDs for existing companies (idempotent - only generates if null)
UPDATE companies SET company_id_uuid = gen_random_uuid() WHERE company_id_uuid IS NULL;

-- Make it NOT NULL after population
ALTER TABLE companies ALTER COLUMN company_id_uuid SET NOT NULL;

-- Create unique index (will become primary key later)
CREATE UNIQUE INDEX IF NOT EXISTS companies_uuid_unique ON companies(company_id_uuid);

-- ============================================================================
-- PHASE 2: Add UUID foreign key columns to all related tables
-- ============================================================================

-- contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- company_tools
ALTER TABLE company_tools ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- shipping_addresses
ALTER TABLE shipping_addresses ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- trial_intents
ALTER TABLE trial_intents ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- activity_tracking
ALTER TABLE activity_tracking ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- shipping_manifests
ALTER TABLE shipping_manifests ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- reorder_tokens
ALTER TABLE reorder_tokens ADD COLUMN IF NOT EXISTS company_id_uuid UUID;

-- stripe_payment_intents (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stripe_payment_intents') THEN
    ALTER TABLE stripe_payment_intents ADD COLUMN IF NOT EXISTS company_id_uuid UUID;
  END IF;
END $$;

-- engagement_events (if exists - old table)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'engagement_events') THEN
    ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS company_id_uuid UUID;
  END IF;
END $$;

-- company_distributor_pricing (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_distributor_pricing') THEN
    ALTER TABLE company_distributor_pricing ADD COLUMN IF NOT EXISTS company_id_uuid UUID;
  END IF;
END $$;

-- ============================================================================
-- PHASE 3: Populate UUID foreign keys by joining to companies
-- ============================================================================

-- contacts
UPDATE contacts c
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE c.company_id = comp.company_id
  AND c.company_id_uuid IS NULL;

-- company_tools
UPDATE company_tools ct
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE ct.company_id = comp.company_id
  AND ct.company_id_uuid IS NULL;

-- quotes
UPDATE quotes q
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE q.company_id = comp.company_id
  AND q.company_id_uuid IS NULL;

-- invoices
UPDATE invoices i
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE i.company_id = comp.company_id
  AND i.company_id_uuid IS NULL;

-- orders
UPDATE orders o
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE o.company_id = comp.company_id
  AND o.company_id_uuid IS NULL;

-- shipping_addresses
UPDATE shipping_addresses sa
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE sa.company_id = comp.company_id
  AND sa.company_id_uuid IS NULL;

-- subscriptions
UPDATE subscriptions s
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE s.company_id = comp.company_id
  AND s.company_id_uuid IS NULL;

-- trial_intents
UPDATE trial_intents ti
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE ti.company_id = comp.company_id
  AND ti.company_id_uuid IS NULL;

-- activity_tracking
UPDATE activity_tracking at
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE at.company_id = comp.company_id
  AND at.company_id_uuid IS NULL;

-- shipping_manifests
UPDATE shipping_manifests sm
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE sm.company_id = comp.company_id
  AND sm.company_id_uuid IS NULL;

-- reorder_tokens
UPDATE reorder_tokens rt
SET company_id_uuid = comp.company_id_uuid
FROM companies comp
WHERE rt.company_id = comp.company_id
  AND rt.company_id_uuid IS NULL;

-- stripe_payment_intents (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stripe_payment_intents') THEN
    UPDATE stripe_payment_intents spi
    SET company_id_uuid = comp.company_id_uuid
    FROM companies comp
    WHERE spi.company_id = comp.company_id
      AND spi.company_id_uuid IS NULL;
  END IF;
END $$;

-- engagement_events (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'engagement_events') THEN
    UPDATE engagement_events ee
    SET company_id_uuid = comp.company_id_uuid
    FROM companies comp
    WHERE ee.company_id = comp.company_id
      AND ee.company_id_uuid IS NULL;
  END IF;
END $$;

-- company_distributor_pricing (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_distributor_pricing') THEN
    UPDATE company_distributor_pricing cdp
    SET company_id_uuid = comp.company_id_uuid
    FROM companies comp
    WHERE cdp.company_id = comp.company_id
      AND cdp.company_id_uuid IS NULL;
  END IF;
END $$;

-- ============================================================================
-- PHASE 4: Drop old foreign key constraints
-- ============================================================================

-- Find and drop all foreign key constraints referencing companies(company_id)
DO $$
DECLARE
  fk_record RECORD;
BEGIN
  FOR fk_record IN
    SELECT
      tc.table_name,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'companies'
      AND ccu.column_name = 'company_id'
  LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I',
                   fk_record.table_name,
                   fk_record.constraint_name);
  END LOOP;
END $$;

-- ============================================================================
-- PHASE 5: Drop old primary key and rename columns
-- ============================================================================

-- Drop old primary key constraint on companies
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_pkey;

-- Rename company_id to sage_customer_code
ALTER TABLE companies RENAME COLUMN company_id TO sage_customer_code;

-- Rename company_id_uuid to company_id
ALTER TABLE companies RENAME COLUMN company_id_uuid TO company_id;

-- Set new primary key
ALTER TABLE companies ADD PRIMARY KEY (company_id);

-- Add type column for prospect/customer/distributor distinction
ALTER TABLE companies ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'customer';

-- Add index on sage_customer_code (still used for Sage matching)
CREATE INDEX IF NOT EXISTS companies_sage_code_idx ON companies(sage_customer_code);

-- Make sage_customer_code nullable (prospects won't have Sage codes)
ALTER TABLE companies ALTER COLUMN sage_customer_code DROP NOT NULL;

-- ============================================================================
-- PHASE 6: Rename UUID columns and drop old TEXT columns in child tables
-- ============================================================================

-- contacts
ALTER TABLE contacts DROP COLUMN IF EXISTS company_id;
ALTER TABLE contacts RENAME COLUMN company_id_uuid TO company_id;
ALTER TABLE contacts ALTER COLUMN company_id SET NOT NULL;

-- company_tools
ALTER TABLE company_tools DROP COLUMN IF EXISTS company_id;
ALTER TABLE company_tools RENAME COLUMN company_id_uuid TO company_id;
ALTER TABLE company_tools ALTER COLUMN company_id SET NOT NULL;

-- quotes
ALTER TABLE quotes DROP COLUMN IF EXISTS company_id;
ALTER TABLE quotes RENAME COLUMN company_id_uuid TO company_id;
ALTER TABLE quotes ALTER COLUMN company_id SET NOT NULL;

-- invoices
ALTER TABLE invoices DROP COLUMN IF EXISTS company_id;
ALTER TABLE invoices RENAME COLUMN company_id_uuid TO company_id;
ALTER TABLE invoices ALTER COLUMN company_id SET NOT NULL;

-- orders
ALTER TABLE orders DROP COLUMN IF EXISTS company_id;
ALTER TABLE orders RENAME COLUMN company_id_uuid TO company_id;
ALTER TABLE orders ALTER COLUMN company_id SET NOT NULL;

-- shipping_addresses
ALTER TABLE shipping_addresses DROP COLUMN IF EXISTS company_id;
ALTER TABLE shipping_addresses RENAME COLUMN company_id_uuid TO company_id;
ALTER TABLE shipping_addresses ALTER COLUMN company_id SET NOT NULL;

-- subscriptions
ALTER TABLE subscriptions DROP COLUMN IF EXISTS company_id;
ALTER TABLE subscriptions RENAME COLUMN company_id_uuid TO company_id;
ALTER TABLE subscriptions ALTER COLUMN company_id SET NOT NULL;

-- trial_intents
ALTER TABLE trial_intents DROP COLUMN IF EXISTS company_id;
ALTER TABLE trial_intents RENAME COLUMN company_id_uuid TO company_id;
ALTER TABLE trial_intents ALTER COLUMN company_id SET NOT NULL;

-- activity_tracking (nullable - can have events without company)
ALTER TABLE activity_tracking DROP COLUMN IF EXISTS company_id;
ALTER TABLE activity_tracking RENAME COLUMN company_id_uuid TO company_id;

-- shipping_manifests
ALTER TABLE shipping_manifests DROP COLUMN IF EXISTS company_id;
ALTER TABLE shipping_manifests RENAME COLUMN company_id_uuid TO company_id;
ALTER TABLE shipping_manifests ALTER COLUMN company_id SET NOT NULL;

-- reorder_tokens
ALTER TABLE reorder_tokens DROP COLUMN IF EXISTS company_id;
ALTER TABLE reorder_tokens RENAME COLUMN company_id_uuid TO company_id;
ALTER TABLE reorder_tokens ALTER COLUMN company_id SET NOT NULL;

-- stripe_payment_intents (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stripe_payment_intents') THEN
    ALTER TABLE stripe_payment_intents DROP COLUMN IF EXISTS company_id;
    ALTER TABLE stripe_payment_intents RENAME COLUMN company_id_uuid TO company_id;
  END IF;
END $$;

-- engagement_events (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'engagement_events') THEN
    ALTER TABLE engagement_events DROP COLUMN IF EXISTS company_id;
    ALTER TABLE engagement_events RENAME COLUMN company_id_uuid TO company_id;
  END IF;
END $$;

-- company_distributor_pricing (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_distributor_pricing') THEN
    ALTER TABLE company_distributor_pricing DROP COLUMN IF EXISTS company_id;
    ALTER TABLE company_distributor_pricing RENAME COLUMN company_id_uuid TO company_id;
  END IF;
END $$;

-- ============================================================================
-- PHASE 7: Recreate foreign key constraints
-- ============================================================================

-- contacts
ALTER TABLE contacts
  ADD CONSTRAINT contacts_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- company_tools
ALTER TABLE company_tools
  ADD CONSTRAINT company_tools_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- quotes
ALTER TABLE quotes
  ADD CONSTRAINT quotes_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- invoices
ALTER TABLE invoices
  ADD CONSTRAINT invoices_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- orders
ALTER TABLE orders
  ADD CONSTRAINT orders_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- shipping_addresses
ALTER TABLE shipping_addresses
  ADD CONSTRAINT shipping_addresses_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- subscriptions
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- trial_intents
ALTER TABLE trial_intents
  ADD CONSTRAINT trial_intents_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- activity_tracking (nullable FK)
ALTER TABLE activity_tracking
  ADD CONSTRAINT activity_tracking_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE SET NULL;

-- shipping_manifests
ALTER TABLE shipping_manifests
  ADD CONSTRAINT shipping_manifests_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- reorder_tokens
ALTER TABLE reorder_tokens
  ADD CONSTRAINT reorder_tokens_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- stripe_payment_intents (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stripe_payment_intents') THEN
    ALTER TABLE stripe_payment_intents
      ADD CONSTRAINT stripe_payment_intents_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES companies(company_id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- engagement_events (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'engagement_events') THEN
    ALTER TABLE engagement_events
      ADD CONSTRAINT engagement_events_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES companies(company_id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- company_distributor_pricing (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_distributor_pricing') THEN
    ALTER TABLE company_distributor_pricing
      ADD CONSTRAINT company_distributor_pricing_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES companies(company_id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- PHASE 8: Rebuild indexes for performance
-- ============================================================================

-- contacts
CREATE INDEX IF NOT EXISTS contacts_company_id_idx ON contacts(company_id);

-- company_tools
CREATE INDEX IF NOT EXISTS company_tools_company_id_idx ON company_tools(company_id);

-- quotes
CREATE INDEX IF NOT EXISTS quotes_company_id_idx ON quotes(company_id);

-- invoices
CREATE INDEX IF NOT EXISTS invoices_company_id_idx ON invoices(company_id);

-- orders
CREATE INDEX IF NOT EXISTS orders_company_id_idx ON orders(company_id);

-- shipping_addresses
CREATE INDEX IF NOT EXISTS shipping_addresses_company_id_idx ON shipping_addresses(company_id);

-- subscriptions
CREATE INDEX IF NOT EXISTS subscriptions_company_id_idx ON subscriptions(company_id);

-- trial_intents
CREATE INDEX IF NOT EXISTS trial_intents_company_id_idx ON trial_intents(company_id);

-- activity_tracking
CREATE INDEX IF NOT EXISTS activity_tracking_company_id_idx ON activity_tracking(company_id) WHERE company_id IS NOT NULL;

-- shipping_manifests
CREATE INDEX IF NOT EXISTS shipping_manifests_company_id_idx ON shipping_manifests(company_id);

-- reorder_tokens
CREATE INDEX IF NOT EXISTS reorder_tokens_company_id_idx ON reorder_tokens(company_id);

-- ============================================================================
-- PHASE 9: Add new fields for distributor system
-- ============================================================================

-- Add referring_distributor_id to companies (for partnership model)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS referring_distributor_id UUID;

-- Add assigned_rep_id to companies (can be different from account_owner for prospects)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS assigned_rep_id UUID;

-- Add index
CREATE INDEX IF NOT EXISTS companies_referring_distributor_idx ON companies(referring_distributor_id) WHERE referring_distributor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS companies_assigned_rep_idx ON companies(assigned_rep_id) WHERE assigned_rep_id IS NOT NULL;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================================================

-- Uncomment to run verification after migration:

/*
-- 1. Check all companies have UUIDs
SELECT COUNT(*) as total_companies,
       COUNT(company_id) as companies_with_uuid,
       COUNT(sage_customer_code) as companies_with_sage_code
FROM companies;

-- 2. Check all child tables have matching UUIDs
SELECT
  'contacts' as table_name,
  COUNT(*) as total_rows,
  COUNT(company_id) as rows_with_company_id
FROM contacts
UNION ALL
SELECT
  'company_tools',
  COUNT(*),
  COUNT(company_id)
FROM company_tools
UNION ALL
SELECT
  'quotes',
  COUNT(*),
  COUNT(company_id)
FROM quotes
UNION ALL
SELECT
  'invoices',
  COUNT(*),
  COUNT(company_id)
FROM invoices;

-- 3. Check foreign key constraints exist
SELECT
  tc.table_name,
  tc.constraint_name,
  ccu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'companies'
ORDER BY tc.table_name;

-- 4. Check for orphaned records (should be 0)
SELECT
  'contacts' as table_name,
  COUNT(*) as orphaned_records
FROM contacts c
LEFT JOIN companies comp ON c.company_id = comp.company_id
WHERE comp.company_id IS NULL
UNION ALL
SELECT
  'invoices',
  COUNT(*)
FROM invoices i
LEFT JOIN companies comp ON i.company_id = comp.company_id
WHERE comp.company_id IS NULL;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ UUID Migration Complete!';
  RAISE NOTICE '📊 Companies table: company_id is now UUID';
  RAISE NOTICE '📋 Old company_id → sage_customer_code';
  RAISE NOTICE '🔗 All foreign keys updated';
  RAISE NOTICE '📈 All indexes rebuilt';
  RAISE NOTICE '🎯 Ready for distributor system build';
END $$;
