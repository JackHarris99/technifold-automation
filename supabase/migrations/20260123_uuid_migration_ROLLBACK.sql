/**
 * UUID Migration ROLLBACK Script
 *
 * ⚠️ ONLY RUN THIS IF THE MIGRATION FAILS ⚠️
 *
 * This script reverses the UUID migration and restores the original
 * TEXT-based company_id structure.
 *
 * WARNING: This assumes the migration partially completed.
 * If migration fully completed, you may have data loss.
 */

-- ============================================================================
-- ROLLBACK PHASE 1: Re-add TEXT company_id columns
-- ============================================================================

-- Add TEXT company_id column back to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_id_text TEXT;

-- Populate from sage_customer_code
UPDATE companies SET company_id_text = sage_customer_code WHERE sage_customer_code IS NOT NULL;

-- ============================================================================
-- ROLLBACK PHASE 2: Add TEXT company_id columns back to child tables
-- ============================================================================

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_id_text TEXT;
ALTER TABLE company_tools ADD COLUMN IF NOT EXISTS company_id_text TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS company_id_text TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id_text TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_id_text TEXT;
ALTER TABLE shipping_addresses ADD COLUMN IF NOT EXISTS company_id_text TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS company_id_text TEXT;
ALTER TABLE trial_intents ADD COLUMN IF NOT EXISTS company_id_text TEXT;
ALTER TABLE activity_tracking ADD COLUMN IF NOT EXISTS company_id_text TEXT;
ALTER TABLE shipping_manifests ADD COLUMN IF NOT EXISTS company_id_text TEXT;
ALTER TABLE reorder_tokens ADD COLUMN IF NOT EXISTS company_id_text TEXT;

-- ============================================================================
-- ROLLBACK PHASE 3: Populate TEXT company_id from UUID join
-- ============================================================================

UPDATE contacts c
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE c.company_id = comp.company_id;

UPDATE company_tools ct
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE ct.company_id = comp.company_id;

UPDATE quotes q
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE q.company_id = comp.company_id;

UPDATE invoices i
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE i.company_id = comp.company_id;

UPDATE orders o
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE o.company_id = comp.company_id;

UPDATE shipping_addresses sa
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE sa.company_id = comp.company_id;

UPDATE subscriptions s
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE s.company_id = comp.company_id;

UPDATE trial_intents ti
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE ti.company_id = comp.company_id;

UPDATE activity_tracking at
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE at.company_id = comp.company_id;

UPDATE shipping_manifests sm
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE sm.company_id = comp.company_id;

UPDATE reorder_tokens rt
SET company_id_text = comp.sage_customer_code
FROM companies comp
WHERE rt.company_id = comp.company_id;

-- ============================================================================
-- ROLLBACK PHASE 4: Drop UUID foreign keys
-- ============================================================================

ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_company_id_fkey;
ALTER TABLE company_tools DROP CONSTRAINT IF EXISTS company_tools_company_id_fkey;
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_company_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_company_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_company_id_fkey;
ALTER TABLE shipping_addresses DROP CONSTRAINT IF EXISTS shipping_addresses_company_id_fkey;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_company_id_fkey;
ALTER TABLE trial_intents DROP CONSTRAINT IF EXISTS trial_intents_company_id_fkey;
ALTER TABLE activity_tracking DROP CONSTRAINT IF EXISTS activity_tracking_company_id_fkey;
ALTER TABLE shipping_manifests DROP CONSTRAINT IF EXISTS shipping_manifests_company_id_fkey;
ALTER TABLE reorder_tokens DROP CONSTRAINT IF EXISTS reorder_tokens_company_id_fkey;

-- ============================================================================
-- ROLLBACK PHASE 5: Drop UUID primary key and restore TEXT structure
-- ============================================================================

-- Drop UUID primary key
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_pkey;

-- Drop UUID company_id column
ALTER TABLE companies DROP COLUMN IF EXISTS company_id;

-- Rename TEXT column back to company_id
ALTER TABLE companies RENAME COLUMN company_id_text TO company_id;

-- Restore TEXT primary key
ALTER TABLE companies ADD PRIMARY KEY (company_id);

-- Drop sage_customer_code column
ALTER TABLE companies DROP COLUMN IF EXISTS sage_customer_code;

-- ============================================================================
-- ROLLBACK PHASE 6: Restore TEXT company_id in child tables
-- ============================================================================

-- Drop UUID columns, restore TEXT columns
ALTER TABLE contacts DROP COLUMN IF EXISTS company_id;
ALTER TABLE contacts RENAME COLUMN company_id_text TO company_id;

ALTER TABLE company_tools DROP COLUMN IF EXISTS company_id;
ALTER TABLE company_tools RENAME COLUMN company_id_text TO company_id;

ALTER TABLE quotes DROP COLUMN IF EXISTS company_id;
ALTER TABLE quotes RENAME COLUMN company_id_text TO company_id;

ALTER TABLE invoices DROP COLUMN IF EXISTS company_id;
ALTER TABLE invoices RENAME COLUMN company_id_text TO company_id;

ALTER TABLE orders DROP COLUMN IF EXISTS company_id;
ALTER TABLE orders RENAME COLUMN company_id_text TO company_id;

ALTER TABLE shipping_addresses DROP COLUMN IF EXISTS company_id;
ALTER TABLE shipping_addresses RENAME COLUMN company_id_text TO company_id;

ALTER TABLE subscriptions DROP COLUMN IF EXISTS company_id;
ALTER TABLE subscriptions RENAME COLUMN company_id_text TO company_id;

ALTER TABLE trial_intents DROP COLUMN IF EXISTS company_id;
ALTER TABLE trial_intents RENAME COLUMN company_id_text TO company_id;

ALTER TABLE activity_tracking DROP COLUMN IF EXISTS company_id;
ALTER TABLE activity_tracking RENAME COLUMN company_id_text TO company_id;

ALTER TABLE shipping_manifests DROP COLUMN IF EXISTS company_id;
ALTER TABLE shipping_manifests RENAME COLUMN company_id_text TO company_id;

ALTER TABLE reorder_tokens DROP COLUMN IF EXISTS company_id;
ALTER TABLE reorder_tokens RENAME COLUMN company_id_text TO company_id;

-- ============================================================================
-- ROLLBACK PHASE 7: Recreate TEXT foreign keys
-- ============================================================================

ALTER TABLE contacts
  ADD CONSTRAINT contacts_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

ALTER TABLE company_tools
  ADD CONSTRAINT company_tools_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

ALTER TABLE quotes
  ADD CONSTRAINT quotes_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

ALTER TABLE invoices
  ADD CONSTRAINT invoices_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

ALTER TABLE orders
  ADD CONSTRAINT orders_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

ALTER TABLE shipping_addresses
  ADD CONSTRAINT shipping_addresses_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

ALTER TABLE trial_intents
  ADD CONSTRAINT trial_intents_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

ALTER TABLE activity_tracking
  ADD CONSTRAINT activity_tracking_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE SET NULL;

ALTER TABLE shipping_manifests
  ADD CONSTRAINT shipping_manifests_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

ALTER TABLE reorder_tokens
  ADD CONSTRAINT reorder_tokens_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES companies(company_id)
  ON DELETE CASCADE;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '⚠️ ROLLBACK COMPLETE - System restored to TEXT company_id structure';
END $$;
