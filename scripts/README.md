# Import Historical Stripe Invoices

This script imports paid Stripe invoices that were created outside the system into your Supabase database. Once imported, the database triggers will automatically sync them to `company_product_history`, `company_consumables`, and `company_tools`.

## Why Use This?

If you have Stripe invoices that were:
- Created manually in Stripe Dashboard
- Paid before your system went live
- Created for existing customers who are in your database

...then those invoices won't be in your Supabase `invoices` table, and your sales reps won't see that purchase history in the CRM.

This script fixes that by importing historical Stripe invoices.

## Prerequisites

1. Company must exist in your database with `stripe_customer_id` set
2. Products must be mappable to your internal `product_code` (see mapping section below)
3. Stripe API key must be in your `.env.local`

## Installation

```bash
npm install
```

This installs `tsx` which is needed to run the TypeScript script.

## Usage

### Dry Run (Recommended First)

Test what would be imported without actually writing to the database:

```bash
npm run import-stripe-invoices -- --dry-run
```

### Import All Historical Invoices

```bash
npm run import-stripe-invoices
```

### Import Invoices Since a Specific Date

```bash
npm run import-stripe-invoices -- --since=2024-01-01
```

### Combine Options

```bash
npm run import-stripe-invoices -- --dry-run --since=2025-01-01
```

## Product Mapping

The script needs to map Stripe products to your internal `product_code`. It tries three strategies:

### 1. Stripe Product Metadata (Recommended)

Add `product_code` to your Stripe product metadata:

In Stripe Dashboard:
1. Products → [Your Product] → Edit
2. Scroll to "Metadata"
3. Add key: `product_code`, value: `MOULD-161` (your internal code)

### 2. Description Matching

The script will try to match Stripe line item descriptions to your `products.description` field.

### 3. Manual Mapping

If neither works, the script will warn you about unmapped products. You can either:
- Add metadata to Stripe products and re-run
- Manually import those specific invoices (see SQL method below)
- Customize the `mapStripeProductToCode()` function in the script

## What Happens When You Import

1. Script fetches paid invoices from Stripe
2. For each invoice:
   - Finds company by `stripe_customer_id`
   - Maps line items to internal `product_code`
   - Inserts into `invoices` table with `payment_status = 'paid'`
   - Inserts into `invoice_items` table
3. Database triggers automatically fire:
   - `trigger_sync_invoice_to_history` → updates `company_product_history`
   - `trigger_sync_history_to_consumables` → updates `company_consumables`
   - `trigger_sync_history_to_tools` → updates `company_tools`

## Output

The script shows a summary:

```
📊 Import Summary
============================================================
Total Stripe invoices:       45
Already imported:            4
No matching company:         2
Missing product mapping:     3
Successfully imported:       36
Errors:                      0
============================================================
```

## Common Issues

### "No matching company for Stripe customer cus_XXX"

**Solution:** Set the `stripe_customer_id` field in the `companies` table:

```sql
UPDATE companies
SET stripe_customer_id = 'cus_XXX'
WHERE company_id = 'YOUR_COMPANY_ID';
```

### "No mapping found for Stripe product"

**Solution:** Add `product_code` to Stripe product metadata (see Product Mapping above).

### "Already imported"

This is fine - the script skips invoices that already exist in your database.

## Manual Import (Alternative)

If you only need to import a few invoices, or prefer SQL, use:

`/supabase/MANUAL_IMPORT_STRIPE_INVOICE.sql`

This provides step-by-step SQL to manually insert a single invoice at a time.

## Safety

- Script checks for existing invoices and skips them (no duplicates)
- `--dry-run` mode lets you preview changes
- If items fail to insert, the invoice is automatically rolled back
- Database triggers handle the sync automatically (no manual steps)

## Verification

After import, verify in Supabase SQL Editor:

```sql
-- Check recently imported invoices
SELECT
  i.invoice_id,
  i.company_id,
  c.company_name,
  i.invoice_date,
  i.total_amount,
  COUNT(ii.product_code) as items
FROM invoices i
LEFT JOIN companies c ON i.company_id = c.company_id
LEFT JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
WHERE i.created_at > NOW() - INTERVAL '1 hour'
GROUP BY i.invoice_id, i.company_id, c.company_name, i.invoice_date, i.total_amount
ORDER BY i.created_at DESC;

-- Check if they synced to product_history
SELECT source, COUNT(*)
FROM company_product_history
GROUP BY source;
-- Should see entries with source containing 'invoice'
```
