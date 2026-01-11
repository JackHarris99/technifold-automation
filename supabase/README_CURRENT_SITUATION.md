# Current Invoice Sync Situation - EXPLAINED

## What's Actually in Your Database Right Now

### Triggers: ✅ INSTALLED AND WORKING
From `triggers.csv`, these are **already active**:
- `trigger_sync_invoice_to_history` on invoices table
- `trigger_sync_history_to_consumables` on company_product_history
- `trigger_sync_history_to_tools` on company_product_history

**This means:** Any NEW invoice marked as paid will automatically sync to product_history, consumables, and tools going forward.

### Data in company_product_history
- **19,685 rows** with `source = 'invoice'`
  - These are **NOT from real invoices**
  - They're from your old Sage data imported via deprecated `orders`/`order_items` tables
  - The label `source = 'invoice'` is misleading (should be 'sage' or 'order')

- **1 row** with `source = 'manual'`
  - Manually added entry

- **0 rows** with `source = 'invoice_backfill'`
  - Means the backfill migration never successfully ran

### The Problem
Real Stripe invoices (created through `/api/stripe/webhook`) **may not be in product_history** because:
1. Triggers were only just installed (today)
2. Any invoices paid BEFORE trigger installation = not synced
3. We don't know how many real invoices exist or if they're missing

## What to Do Next

### Step 1: Check if Real Invoices Are Missing

Run this query in Supabase SQL Editor:
```
supabase/CHECK_REAL_INVOICES_MISSING.sql
```

**This will show:**
- How many paid invoices exist in the `invoices` table
- How many invoice items are missing from `company_product_history`
- Sample of missing invoices with dates

**Expected outcomes:**
- If "Invoice items not in product_history" = **0** → All good, no backfill needed!
- If > 0 → Real invoice data is missing, proceed to Step 2

### Step 2: Run Smart Backfill

If Step 1 shows missing data, run:
```
supabase/BACKFILL_MERGE_INVOICES_WITH_SAGE.sql
```

**What this does:**
- Processes all paid invoices from `invoices` table
- For company+product combinations that already exist (from Sage):
  - Keeps earliest purchase date
  - Updates to latest purchase date
  - ADDS invoice purchases to existing count
  - Changes source to `invoice_and_sage`
- For NEW company+product combinations:
  - Creates new entry with source `invoice_backfill`
- **Safe to run multiple times** (won't double-count)

### Step 3: Verify Everything Worked

After backfill, check the source breakdown:
```sql
SELECT source, COUNT(*)
FROM company_product_history
GROUP BY source;
```

**Expected results:**
- `invoice` = Old Sage data that wasn't updated (no matching invoice)
- `invoice_and_sage` = Sage data merged with invoice data
- `invoice_backfill` = New products only in invoices (not in Sage)
- `manual` = Manual entries

## Future: How It Works Going Forward

### When Stripe Payment Succeeds:
1. `/api/stripe/webhook/route.ts` creates invoice with `payment_status = 'paid'`
2. Creates `invoice_items` records
3. **Trigger fires automatically** → `company_product_history` updated
4. **Cascading triggers fire** → `company_consumables` and `company_tools` updated
5. Portal cache regenerates

**No manual intervention needed** - fully automated via database triggers.

## Old System (Deprecated)

The `orders` and `order_items` tables are **no longer used**. They were part of an old system to recreate Sage invoices in Supabase. The invoice-led system is now the single source of truth.

**Do not add new data to orders/order_items tables.**

## Files Overview

### Diagnostic Queries
- `CHECK_IF_BACKFILL_RAN.sql` - Quick check if backfill completed
- `CHECK_REAL_INVOICES_MISSING.sql` - Detailed analysis of missing invoice data
- `CHECK_MISSING_INVOICE_DATA.sql` - General data completeness check

### Migration Files (Already Applied)
- `20260111_sync_invoice_to_history.sql` - ✅ Applied (trigger exists)
- `20260111_sync_history_to_consumables_tools.sql` - ✅ Applied (triggers exist)
- `20260111_backfill_history_from_invoices.sql` - ⚠️ DO NOT USE (wrong logic for current situation)

### Backfill Scripts
- `BACKFILL_MERGE_INVOICES_WITH_SAGE.sql` - **USE THIS ONE** (smart merge)
- `SAFE_BACKFILL_MISSING_INVOICES.sql` - Alternative (only adds new, doesn't merge)

### Cleanup Scripts
- `CLEANUP_PARTIAL_MIGRATIONS.sql` - Remove broken triggers (not needed, triggers are working)
- `DIAGNOSTIC_CHECK_CURRENT_STATE.sql` - General database state check

### Documentation
- `README_INVOICE_TRIGGERS.md` - Original trigger system documentation
- `README_CURRENT_SITUATION.md` - This file

## Summary

✅ **Working:** Triggers installed, new invoices will sync automatically
⚠️ **Unknown:** Whether historical Stripe invoices are in product_history
📋 **Action:** Run diagnostic, then smart backfill if needed
