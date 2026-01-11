# Invoice-to-Product-History Trigger System

## Overview

This system automatically syncs paid invoices to product purchase history using PostgreSQL triggers. When an invoice is marked as paid, the system cascades updates through three tables:

```
invoices (paid)
  → company_product_history
    → company_consumables (if type=consumable)
    → company_tools (if type=tool)
```

## Migration Files (Apply in Order)

### 1. `20260111_sync_invoice_to_history.sql`
Creates trigger that syncs paid invoices to `company_product_history`.

**What it does:**
- Watches `invoices` table for INSERT or UPDATE where `payment_status = 'paid'`
- Reads all `invoice_items` for that invoice
- For each item, upserts into `company_product_history`:
  - First purchase date
  - Last purchase date
  - Total purchase count
  - Total quantity purchased
  - Product type (from `products` table)

### 2. `20260111_sync_history_to_consumables_tools.sql`
Creates triggers that sync `company_product_history` to specialized tables.

**What it does:**
- Watches `company_product_history` for INSERT or UPDATE
- If `product_type = 'consumable'` → syncs to `company_consumables`
- If `product_type = 'tool'` → syncs to `company_tools`
- Maintains earliest/latest dates and running totals

### 3. `20260111_backfill_history_from_invoices.sql`
One-time backfill of existing paid invoices.

**What it does:**
- Loops through ALL existing paid invoices
- Populates `company_product_history` with historical data
- Triggers automatically cascade to consumables/tools tables
- Prints summary of records synced

## How to Apply Migrations

### Option A: Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `20260111_sync_invoice_to_history.sql`
3. Click "Run" - should see success message
4. Copy contents of `20260111_sync_history_to_consumables_tools.sql`
5. Click "Run" - should see success message
6. Copy contents of `20260111_backfill_history_from_invoices.sql`
7. Click "Run" - should see notice messages like "Backfill complete: Synced X invoice items"

### Option B: psql Command Line

```bash
psql "YOUR_SUPABASE_CONNECTION_STRING" < supabase/migrations/20260111_sync_invoice_to_history.sql
psql "YOUR_SUPABASE_CONNECTION_STRING" < supabase/migrations/20260111_sync_history_to_consumables_tools.sql
psql "YOUR_SUPABASE_CONNECTION_STRING" < supabase/migrations/20260111_backfill_history_from_invoices.sql
```

## Verification

After applying migrations, verify triggers are active:

```sql
-- Check triggers exist
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%sync%'
ORDER BY trigger_name;
```

Expected results:
- `trigger_sync_invoice_to_history` on `invoices`
- `trigger_sync_history_to_consumables` on `company_product_history`
- `trigger_sync_history_to_tools` on `company_product_history`

## Testing

Create a test paid invoice to verify the cascade:

```sql
-- 1. Create test invoice (replace with real company_id)
INSERT INTO invoices (
  invoice_id,
  company_id,
  invoice_date,
  payment_status
) VALUES (
  'TEST-' || gen_random_uuid()::text,
  'YOUR_COMPANY_ID',
  CURRENT_DATE,
  'paid'
) RETURNING invoice_id;

-- 2. Add test invoice item (use returned invoice_id)
INSERT INTO invoice_items (
  invoice_id,
  product_code,
  quantity
) VALUES (
  'TEST-...', -- from step 1
  'EXISTING_PRODUCT_CODE', -- must exist in products table
  5
);

-- 3. Check company_product_history
SELECT * FROM company_product_history
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY updated_at DESC
LIMIT 5;

-- 4. Check specialized tables
SELECT * FROM company_consumables
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY last_ordered_at DESC;

SELECT * FROM company_tools
WHERE company_id = 'YOUR_COMPANY_ID'
ORDER BY last_seen_at DESC;

-- 5. Clean up test data
DELETE FROM invoice_items WHERE invoice_id LIKE 'TEST-%';
DELETE FROM invoices WHERE invoice_id LIKE 'TEST-%';
```

## How It Works in Production

When Stripe webhook receives payment success:

1. `/api/stripe/webhook/route.ts` creates invoice record with `payment_status = 'paid'`
2. Creates `invoice_items` records
3. **Trigger automatically fires** → populates `company_product_history`
4. **Cascading triggers fire** → updates `company_consumables` and `company_tools`
5. Portal cache regenerates with updated product history

No manual intervention needed - fully automated.

## Troubleshooting

### Trigger not firing
```sql
-- Check if triggers are enabled
SELECT * FROM pg_trigger WHERE tgname LIKE '%sync%';
```

### Backfill shows 0 synced items
- Check that invoices exist with `payment_status = 'paid'`
- Verify invoice_items exist for those invoices
- Check that product_codes in invoice_items exist in products table

### Products not appearing in consumables/tools
- Check `products.type` column - must be 'consumable' or 'tool'
- Verify `company_product_history` has correct `product_type`
- Check trigger logs in Supabase Logs panel

## Deprecated System

The old `orders` and `order_items` tables are **no longer used**. The invoice-led system is the single source of truth for purchase history.
