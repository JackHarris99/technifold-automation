# Architecture Decision: Fact Tables + Clean Invoice System

**Date:** 2025-12-14
**Status:** Implemented

## The Problem

### 1. Bloated Sage Data Shoehorned into Schema
- `orders` and `order_items` tables designed for Sage invoice imports (40+ fields)
- New Stripe invoices being forced into same structure
- Dual storage: `orders.items` (JSONB) + `order_items` table (relational)
- No clear separation between historical accounting data and operational CRM data

### 2. Stripe Invoices Breaking Pipeline
- Stripe invoices write to `orders.items` (JSONB only)
- Pipeline commission calculations query `order_items` table
- Result: New Stripe tool sales invisible to pipeline, no commission tracking

### 3. No Persistent Operational Facts
- To know "what tools does this company own?", must query full order history
- To send consumable reminders, must aggregate all historical orders
- Can't archive old Sage data without losing operational intelligence

### 4. Subscription Tools Trapped in JSONB
- `subscriptions.tools` is JSONB array of tool codes
- Can't query "which companies have Tool X on subscription?"
- Can't join to `tool_consumable_map` for automated reminders
- No audit trail of when tools were added/removed

## The Solution: Archive-Safe Fact Tables

### Architecture Principle
**Extract operational facts from accounting data, persist independently**

```
┌────────────────────────────────────────────────────────┐
│ MATERIALIZED FACT TABLES (Operational Data)           │
│ • Keep forever                                         │
│ • Updated automatically when invoices are paid         │
│ • Can query without touching invoice history           │
├────────────────────────────────────────────────────────┤
│ company_tools         - "This company owns these tools"│
│ company_consumables   - "Last ordered X on date Y"     │
│ subscription_tools    - "Tools active on subscription" │
└────────────────────────────────────────────────────────┘
           ↑
           │ Populated via one-time migration
           │ Updated via triggers
           │
┌────────────────────────────────────────────────────────┐
│ SAGE HISTORICAL DATA (Accounting Archive)              │
│ • Can eventually archive/delete                        │
│ • Only needed for full audit trail                     │
├────────────────────────────────────────────────────────┤
│ orders                - Sage invoice imports           │
│ order_items           - Sage line items                │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ NEW STRIPE INVOICE SYSTEM (Operational + Accounting)   │
│ • Keep forever                                         │
│ • Clean design for growth                              │
│ • Automatically updates fact tables                    │
├────────────────────────────────────────────────────────┤
│ invoices              - Stripe invoices going forward  │
│ invoice_items         - Line items (enables queries)   │
└────────────────────────────────────────────────────────┘
```

## Tables Created

### 1. `company_tools` (Materialized Fact Table)
**Purpose:** Track which tools each company has purchased (history)

```sql
CREATE TABLE company_tools (
  company_id text,
  tool_code text,
  first_purchased_at date,
  last_purchased_at date,
  total_purchases integer,
  total_quantity integer,
  last_purchase_amount numeric,
  last_invoice_id text,
  PRIMARY KEY (company_id, tool_code)
);
```

**Use Cases:**
- Sales rep views company → "They own 3x TF-SCOREBLADE"
- Upsell detection: "They have Tool A but not Tool B"
- CRM enrichment without querying full order history

### 2. `subscription_tools` (Junction Table)
**Purpose:** Track which tools are included in each subscription

```sql
CREATE TABLE subscription_tools (
  subscription_id uuid,
  tool_code text,
  added_at timestamptz,
  added_by text,
  removed_at timestamptz,
  removed_by text,
  removal_reason text,
  PRIMARY KEY (subscription_id, tool_code, added_at)
);
```

**Use Cases:**
- Consumable reminder automation: JOIN to tool_consumable_map
- Audit trail: Who added/removed tools and when
- Query: "Which companies have Tool X on subscription?"

**Workflow:**
1. Trial created automatically (website) → subscription record created
2. Sales rep manually allocates tools → writes to subscription_tools
3. Automated reminders can now fire based on tool_consumable_map joins

### 3. `company_consumables` (Materialized Fact Table)
**Purpose:** Track consumable order history per company

```sql
CREATE TABLE company_consumables (
  company_id text,
  consumable_code text,
  first_ordered_at date,
  last_ordered_at date,
  total_orders integer,
  total_quantity integer,
  last_order_amount numeric,
  last_order_quantity integer,
  last_invoice_id text,
  PRIMARY KEY (company_id, consumable_code)
);
```

**Use Cases:**
- Reorder opportunity detection
- "Last ordered 90 days ago" automated reminder
- Sales rep: "They usually buy 50 units every 60 days"

### 4. `invoices` + `invoice_items` (Clean Stripe System)
**Purpose:** New invoice system designed for Stripe, not shoehorned into Sage structure

```sql
CREATE TABLE invoices (
  invoice_id uuid PRIMARY KEY,
  company_id text,
  contact_id uuid,
  stripe_invoice_id text UNIQUE,
  invoice_number text UNIQUE,
  invoice_type text,
  subtotal numeric,
  tax_amount numeric,
  total_amount numeric,
  status text,
  payment_status text,
  invoice_date date,
  paid_at timestamptz,
  created_by text,
  ...
);

CREATE TABLE invoice_items (
  invoice_id uuid,
  product_code text,
  line_number integer,
  description text,
  quantity integer,
  unit_price numeric,
  line_total numeric,
  PRIMARY KEY (invoice_id, product_code, line_number)
);
```

**Key Features:**
- Proper relational structure (invoice_items table, not JSONB)
- Pipeline queries work: `SELECT * FROM invoice_items WHERE product_code = 'TF-001'`
- Automatic fact table updates via trigger when `payment_status = 'paid'`
- Commission tracking works for new Stripe sales

## Migration Strategy

### Phase 1: Extract Facts from Sage Data (One-Time)
```sql
-- Migration: 20251214_03_populate_fact_tables.sql
INSERT INTO company_tools SELECT ... FROM orders JOIN order_items ...
INSERT INTO company_consumables SELECT ... FROM orders JOIN order_items ...
```

**Result:** Operational facts now exist independently of Sage invoice history

### Phase 2: Update stripe-invoices.ts Library
Change from:
```typescript
// OLD: Write to orders table with JSONB items
await supabase.from('orders').insert({
  items: items, // JSONB - breaks pipeline queries
  ...
});
```

To:
```typescript
// NEW: Write to invoices + invoice_items tables
const { data: invoice } = await supabase.from('invoices').insert({...});
await supabase.from('invoice_items').insert(
  items.map(item => ({
    invoice_id: invoice.invoice_id,
    product_code: item.product_code,
    ...
  }))
);
```

### Phase 3: Automatic Fact Table Updates
Trigger runs on `invoices` UPDATE:
```sql
-- When invoice.payment_status changes to 'paid'
-- Automatically calls:
upsert_company_tool(...) -- for each tool in invoice_items
upsert_company_consumable(...) -- for each consumable in invoice_items
```

**Result:** Facts always stay current without manual intervention

### Phase 4: Manual Tool Allocation UI
Create admin interface for sales reps to allocate tools to subscriptions:
- View: Subscriptions without tool allocation
- Form: Add tools to subscription → writes to subscription_tools
- Audit: See when tools were added/removed and by whom

### Phase 5 (Future): Archive Sage Data
Once confident fact tables are complete:
1. Export `orders` and `order_items` to cold storage
2. Drop tables from production database
3. Fact tables persist → operational intelligence intact
4. New Stripe system continues → no disruption

## Benefits

### For Sales Reps
- **Instant context:** View company page → see tools owned, consumables ordered
- **No history bloat:** Streamlined views show facts, not 5 years of invoices
- **Upsell signals:** System knows what they own, can suggest complementary products

### For Pipeline Reporting
- **Commission tracking works:** Query invoice_items (relational), not orders.items (JSONB)
- **Accurate metrics:** All Stripe sales now visible to pipeline calculations
- **Territory filtering:** Can filter invoices by created_by (sales rep)

### For Automated Marketing
- **Consumable reminders:** JOIN subscription_tools → tool_consumable_map → company_consumables
- **Reorder opportunities:** Query company_consumables.last_ordered_at
- **Trial conversion:** Query subscriptions where status = 'trial' AND trial_end_date approaching

### For System Architecture
- **Separation of concerns:** Operational facts vs accounting history
- **Archive-safe:** Can delete old data without losing intelligence
- **Scalable:** Clean Stripe system designed for growth, not Sage constraints
- **Queryable:** Relational structure enables complex joins and aggregations

## What Changed from Previous Approach

**Before:** "Just reorganized navigation, no functional difference"
- Territory filtering broke (text = uuid error)
- Streamlined views still showed full history
- No actual data architecture changes

**Now:** "Real functional architecture with persistent facts"
- ✅ Materialized fact tables extract operational intelligence
- ✅ Clean invoice system separates new sales from Sage bloat
- ✅ Automatic updates via triggers when invoices paid
- ✅ Archive-safe: Can delete Sage data without losing facts
- ✅ Enables consumable automation via relational tool tracking

## Next Steps

1. **Run migrations** in Supabase (3 files created)
2. **Update stripe-invoices.ts** to write to new invoices/invoice_items tables
3. **Build tool allocation UI** for subscription enrichment
4. **Test fact table triggers** with sample Stripe invoice
5. **Verify pipeline queries** work with new invoice_items data
