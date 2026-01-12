-- Migration: Update shipping_manifests to use invoice_id instead of order_id
-- Date: 2026-01-12
-- Purpose: Remove legacy order_id references and properly link to invoices table

BEGIN;

-- Step 1: Add new invoice_id column
ALTER TABLE shipping_manifests
ADD COLUMN invoice_id uuid;

-- Step 2: Copy existing order_id values to invoice_id (if any exist)
-- This assumes order_id and invoice_id share the same UUID values for migrated data
UPDATE shipping_manifests
SET invoice_id = order_id
WHERE order_id IS NOT NULL;

-- Step 3: Drop the foreign key constraint to orders table
ALTER TABLE shipping_manifests
DROP CONSTRAINT IF EXISTS shipping_manifests_order_id_fkey;

-- Step 4: Drop the old order_id column
ALTER TABLE shipping_manifests
DROP COLUMN order_id;

-- Step 5: Add foreign key constraint to invoices table
ALTER TABLE shipping_manifests
ADD CONSTRAINT shipping_manifests_invoice_id_fkey
FOREIGN KEY (invoice_id)
REFERENCES invoices(invoice_id)
ON DELETE SET NULL;

-- Step 6: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_shipping_manifests_invoice_id
ON shipping_manifests(invoice_id);

COMMIT;

-- Note: After running this migration, update your application code to use invoice_id
