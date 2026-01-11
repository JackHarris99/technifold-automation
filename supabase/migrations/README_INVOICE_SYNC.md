# Invoice → Product History Sync Migration

## Overview

These migrations establish the **correct invoice-led data flow** and remove dependency on the old `orders` table system.

## Data Flow (After Migration)

```
Payment Success
  ↓
invoices + invoice_items created
  ↓
TRIGGER: sync_invoice_to_product_history()
  ↓
company_product_history populated/updated
  ↓
TRIGGERS: sync to consumables & tools
  ↓
company_consumables + company_tools updated
  ↓
regenerate_company_payload() caches portal data
```

## Migration Files (Apply in Order)

### 1. `20260111_sync_invoice_to_history.sql`
**What it does:**
- Creates trigger on `invoices` table
- When `payment_status` changes to `'paid'`, automatically syncs all `invoice_items` to `company_product_history`
- Handles first-time purchases and repeat purchases
- Maintains: first_purchased_at, last_purchased_at, total_purchases, total_quantity

**When it fires:**
- Invoice INSERT with payment_status='paid'
- Invoice UPDATE where payment_status changes to 'paid'

### 2. `20260111_sync_history_to_consumables_tools.sql`
**What it does:**
- Creates triggers on `company_product_history` table
- When product_history is updated, automatically syncs to:
  - `company_consumables` (if product_type = 'consumable')
  - `company_tools` (if product_type = 'tool')
- Keeps specialized tables in perfect sync

**When it fires:**
- Any INSERT or UPDATE on `company_product_history`

### 3. `20260111_backfill_history_from_invoices.sql`
**What it does:**
- ONE-TIME DATA MIGRATION
- Processes all existing paid invoices
- Populates `company_product_history` from historical invoice data
- Triggers automatically cascade to `company_consumables` and `company_tools`
- Prints summary of records synced

**Important:** Run this AFTER the first two migrations

## How to Apply

### Option A: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste each migration file in order
3. Execute them one by one
4. Check the output logs for success messages

### Option B: Supabase CLI
```bash
# If you have Supabase CLI configured
supabase db push

# Or apply individually
psql $DATABASE_URL -f supabase/migrations/20260111_sync_invoice_to_history.sql
psql $DATABASE_URL -f supabase/migrations/20260111_sync_history_to_consumables_tools.sql
psql $DATABASE_URL -f supabase/migrations/20260111_backfill_history_from_invoices.sql
```

## Verification

After applying all migrations, verify the data:

```sql
-- Check trigger functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%sync%product%';

-- Check triggers are active
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%sync%';

-- Check data counts
SELECT
  (SELECT COUNT(*) FROM company_product_history WHERE source IN ('invoice', 'invoice_backfill')) as history_count,
  (SELECT COUNT(*) FROM company_consumables) as consumables_count,
  (SELECT COUNT(*) FROM company_tools) as tools_count;

-- Test with a sample company
SELECT
  cph.company_id,
  cph.product_code,
  cph.product_type,
  cph.total_purchases,
  cph.total_quantity,
  CASE
    WHEN cph.product_type = 'consumable' THEN (SELECT COUNT(*) FROM company_consumables WHERE consumable_code = cph.product_code AND company_id = cph.company_id)
    WHEN cph.product_type = 'tool' THEN (SELECT COUNT(*) FROM company_tools WHERE tool_code = cph.product_code AND company_id = cph.company_id)
    ELSE 0
  END as synced_to_specialized_table
FROM company_product_history cph
LIMIT 10;
```

## Testing the Triggers

After migration, test that new invoices automatically populate history:

```sql
-- 1. Create test invoice (will trigger sync)
INSERT INTO invoices (company_id, invoice_type, currency, subtotal, total_amount, status, payment_status, invoice_date)
VALUES ('TEST_COMPANY', 'sale', 'gbp', 100.00, 120.00, 'paid', 'paid', CURRENT_DATE)
RETURNING invoice_id;

-- 2. Add invoice items (use the invoice_id from above)
INSERT INTO invoice_items (invoice_id, product_code, line_number, description, quantity, unit_price, line_total)
VALUES
  ('YOUR_INVOICE_ID', 'TC006', 1, 'Test Product', 2, 50.00, 100.00);

-- 3. Check if it synced to product_history
SELECT * FROM company_product_history
WHERE company_id = 'TEST_COMPANY'
AND product_code = 'TC006';

-- 4. Check if it synced to specialized tables
SELECT * FROM company_tools WHERE company_id = 'TEST_COMPANY' AND tool_code = 'TC006';
-- OR
SELECT * FROM company_consumables WHERE company_id = 'TEST_COMPANY' AND consumable_code = 'TC006';

-- 5. Clean up test data
DELETE FROM invoice_items WHERE invoice_id = 'YOUR_INVOICE_ID';
DELETE FROM invoices WHERE company_id = 'TEST_COMPANY';
DELETE FROM company_product_history WHERE company_id = 'TEST_COMPANY';
DELETE FROM company_tools WHERE company_id = 'TEST_COMPANY';
DELETE FROM company_consumables WHERE company_id = 'TEST_COMPANY';
```

## What About the Old `orders` Table?

The `orders` table is now **legacy/deprecated** for most use cases. After this migration:

✅ **Invoices are the source of truth**
- All sales flow through invoices
- Triggers keep everything in sync
- Clean, simple data model

❌ **Orders table should NOT be used** for:
- Regular product purchases
- Tracking purchase history
- Powering reorder portals

⚠️ **Orders table MAY still be used** for:
- Tool rental setup records (`order_type: 'tool_rental_setup'`)
- Legacy admin views (can be migrated later)
- Shipping manifest links (can be refactored to use invoices)

### Future Cleanup (Optional)
Consider removing/refactoring these files that still use `orders`:
- `/api/admin/orders/*` - Could show invoices instead
- `/api/track-order/*` - Could use invoice_id
- `/api/invoices/commercial/[order_id]/*` - Rename to invoice_id

## Troubleshooting

### Trigger not firing?
```sql
-- Check if triggers are enabled
SELECT * FROM pg_trigger WHERE tgname LIKE '%sync%';

-- Check invoice payment_status
SELECT invoice_id, payment_status FROM invoices LIMIT 10;
```

### Data not syncing to consumables/tools?
```sql
-- Check product types are correct
SELECT product_code, type FROM products WHERE product_code IN
  (SELECT product_code FROM company_product_history LIMIT 10);

-- Manually fire the trigger
UPDATE company_product_history SET updated_at = NOW()
WHERE company_id = 'YOUR_COMPANY_ID';
```

### Backfill didn't run?
```sql
-- Check for backfilled records
SELECT COUNT(*), source
FROM company_product_history
GROUP BY source;

-- Re-run the backfill (safe to run multiple times)
-- Copy/paste the DO $$ block from 20260111_backfill_history_from_invoices.sql
```

## Summary

After these migrations:
- ✅ All new paid invoices automatically populate `company_product_history`
- ✅ Product history automatically syncs to `company_consumables` and `company_tools`
- ✅ Historical data backfilled from existing invoices
- ✅ Reorder portals powered by accurate, up-to-date data
- ✅ Clean invoice-led architecture (no more orders mess)
