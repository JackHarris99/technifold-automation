# What's Actually New - Real Architecture Changes

**Date:** 2025-12-14

## Previous Attempt (What You Complained About)
> "you have just moved the exact same build parts into new categories, offers zero difference"

**What I did:**
- ❌ Reorganized navigation into 3 sections
- ❌ "Territory filtering" that didn't work (SQL error: text = uuid)
- ❌ "Streamlined views" that still showed full order history
- ❌ No actual data architecture changes

**Result:** Zero functional difference, just UI reorganization

## This Attempt (Actual Architecture)

### Real Problem Identified
After getting the ACTUAL Supabase schema (not assumptions from files):

1. **Stripe invoices breaking pipeline**
   - Writing to `orders.items` (JSONB) instead of `order_items` (relational)
   - Pipeline queries `order_items` for commission calculations
   - Result: New Stripe tool sales invisible, no commissions tracked

2. **Sage data shoehorned into schema**
   - `orders`/`order_items` designed for Sage imports (40+ fields of accounting bloat)
   - New Stripe invoices forced into same structure
   - No separation between historical accounting and operational CRM data

3. **No persistent operational facts**
   - "What tools does this company own?" → must query full order history
   - "When did they last order consumables?" → aggregate all historical orders
   - Can't archive old Sage data without losing operational intelligence

4. **Subscription tools trapped in JSONB**
   - `subscriptions.tools` is JSONB array (can't query "who has Tool X?")
   - Can't join to `tool_consumable_map` for automated consumable reminders
   - No audit trail of when tools added/removed

### Real Solution Built

**Materialized fact tables that persist independently of invoice history**

## Files Created

### Migration 1: Fact Tables
**File:** `supabase/migrations/20251214_02_create_fact_tables.sql`

**Creates:**
- `company_tools` - Purchased tools history (first_purchased, last_purchased, total_quantity)
- `subscription_tools` - Tools on subscription (added_at, removed_at, added_by, audit trail)
- `company_consumables` - Consumable order history (first_ordered, last_ordered, reorder signals)
- Upsert functions for automatic updates
- View: `v_active_subscription_tools`

### Migration 2: Populate from Sage Data
**File:** `supabase/migrations/20251214_03_populate_fact_tables.sql`

**Does:**
- ONE-TIME extraction of facts from existing `orders` + `order_items` (Sage data)
- Populates `company_tools` with historical tool purchases
- Populates `company_consumables` with historical consumable orders
- Result: Facts now exist independently - can archive Sage data later

### Migration 3: Clean Invoice System
**File:** `supabase/migrations/20251214_04_create_invoice_tables.sql`

**Creates:**
- `invoices` table - Clean Stripe invoice storage (not bloated Sage structure)
- `invoice_items` table - Relational line items (enables pipeline queries)
- Trigger: Auto-update fact tables when `payment_status = 'paid'`
- View: `v_invoice_details` with aggregated line items

**Key difference:**
```typescript
// OLD (broken for pipeline):
orders.items = [...] // JSONB storage

// NEW (enables queries):
invoice_items table with proper product_code column
→ Pipeline can query: WHERE product_code = 'TF-001'
→ Facts auto-update via trigger
```

### Documentation
**File:** `ARCHITECTURE_DECISION.md`

**Explains:**
- Why fact tables are needed (archive-safe operational intelligence)
- Migration strategy (extract → update → archive)
- Use cases for each table
- How automatic updates work

## What Actually Changes

### For Sales Reps
**Before:**
- View company → see 200 line items from 5 years of invoices
- "What tools do they own?" → scroll through bloat
- No reorder signals

**After:**
- View company → see `company_tools` facts (3x TF-SCOREBLADE, last purchased 2024-05-12)
- See `company_consumables` (Blades: last ordered 90 days ago → reorder opportunity)
- Streamlined action view, full history available via "View in CRM"

### For Pipeline Reporting
**Before:**
- Stripe tool sales invisible (stored in orders.items JSONB)
- Commission calculations broken for new sales
- Can only track Sage historical data

**After:**
- All Stripe sales write to `invoice_items` (relational)
- Pipeline queries work: `SELECT * FROM invoice_items WHERE product_code = ...`
- Territory filtering by `created_by` (sales rep)
- Accurate commission tracking

### For Automated Marketing
**Before:**
- Can't query "who has Tool X on subscription?" (JSONB array)
- Can't automate consumable reminders (no relational tool tracking)
- Must manually aggregate order history for reorder signals

**After:**
- `subscription_tools` enables: `SELECT company_id WHERE tool_code = 'TF-001'`
- JOIN: subscription_tools → tool_consumable_map → company_consumables → automated reminders
- Reorder opportunities: Query `company_consumables.last_ordered_at`

### For System Architecture
**Before:**
- Sage accounting data mixed with operational CRM data
- Can't archive old invoices (would lose operational facts)
- Stripe sales shoehorned into Sage structure
- JSONB storage breaks relational queries

**After:**
- **Separation of concerns:** Facts (operational) vs Invoices (accounting)
- **Archive-safe:** Extract facts, delete old Sage data, keep intelligence
- **Clean Stripe system:** Designed for growth, not Sage constraints
- **Relational structure:** Enables complex joins and aggregations

## Migration Path

### Step 1: Run Migrations ✅ (Ready to run)
```bash
# In Supabase SQL editor:
# 1. Run 20251214_02_create_fact_tables.sql
# 2. Run 20251214_03_populate_fact_tables.sql
# 3. Run 20251214_04_create_invoice_tables.sql
```

### Step 2: Update Stripe Invoice Library (Next)
**File to modify:** `src/lib/stripe-invoices.ts`

Change from:
```typescript
// Write to old orders table
await supabase.from('orders').insert({
  items: items, // JSONB - breaks queries
  ...
});
```

To:
```typescript
// Write to new invoices + invoice_items tables
const { data: invoice } = await supabase.from('invoices').insert({...});
await supabase.from('invoice_items').insert(
  items.map((item, index) => ({
    invoice_id: invoice.invoice_id,
    product_code: item.product_code,
    line_number: index + 1,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.line_total,
    description: item.description
  }))
);
```

### Step 3: Build Tool Allocation UI (Next)
Create admin interface for enriching subscriptions with tools:

**Option A:** On company CRM page
- Section: "Subscriptions" with "Allocate Tools" button
- Modal: Select tools from company_tools or product catalog
- Writes to: subscription_tools table

**Option B:** Dedicated admin tab
- List: Subscriptions without tools allocated
- Action: "Add Tools" button per subscription
- Reminder badge: "5 subscriptions need tool allocation"

### Step 4: Test & Verify
1. Create test Stripe invoice → verify writes to `invoices` + `invoice_items`
2. Mark invoice as paid → verify fact tables auto-update
3. Pipeline page → verify new sales appear in commission calculations
4. Company CRM page → verify facts display (tools owned, consumables ordered)

### Step 5 (Future): Archive Sage Data
Once confident fact tables are complete:
1. Export `orders` and `order_items` to CSV/cold storage
2. Drop tables from production
3. Fact tables persist → operational intelligence intact

## The Key Difference

### Previous Approach
"Just moved navigation around, territory filtering broken, no real changes"

### This Approach
"Extracted operational facts into persistent tables, separated Stripe from Sage, enabled archive-safe architecture"

**This is real functional architecture, not just UI reorganization.**

## Next Action Required

**Run the 3 migration files** in Supabase SQL editor:
1. `20251214_02_create_fact_tables.sql`
2. `20251214_03_populate_fact_tables.sql`
3. `20251214_04_create_invoice_tables.sql`

Then I can update `stripe-invoices.ts` to use the new tables.
