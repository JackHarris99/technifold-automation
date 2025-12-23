# Verify Fact Table Trigger is Deployed

## Method 1: Check Trigger Exists (Direct SQL)

**Run this in Supabase SQL Editor:**

```sql
-- Check if trigger exists
SELECT
  trigger_name,
  event_object_table AS table_name,
  action_timing AS when_fires,
  event_manipulation AS on_event,
  action_statement AS executes
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_facts_on_invoice_paid';
```

**Expected Result if deployed:**
```
trigger_name: trigger_update_facts_on_invoice_paid
table_name: invoices
when_fires: AFTER
on_event: UPDATE
executes: EXECUTE FUNCTION update_facts_on_invoice_paid()
```

**If you get 0 rows:** Trigger is NOT deployed - need to run `sql/migrations/CREATE_FACT_TABLE_TRIGGER.sql`

---

## Method 2: Check Trigger Function Exists

**Run this in Supabase SQL Editor:**

```sql
-- Check if trigger function exists
SELECT
  routine_name AS function_name,
  routine_type AS type
FROM information_schema.routines
WHERE routine_name = 'update_facts_on_invoice_paid'
  AND routine_schema = 'public';
```

**Expected Result:**
```
function_name: update_facts_on_invoice_paid
type: FUNCTION
```

---

## Method 3: Verify It's Actually Working (Functional Test)

**Run this to see if trigger is populating company_product_history:**

```sql
-- Check if company_product_history is being populated
SELECT
  cph.company_id,
  cph.product_code,
  cph.total_purchases,
  cph.total_quantity,
  cph.last_purchased_at,
  cph.source
FROM company_product_history cph
ORDER BY cph.last_purchased_at DESC
LIMIT 10;
```

**If trigger is working:**
- You should see rows with `source = 'invoice'`
- `last_purchased_at` should match recent invoice payments
- `total_purchases` and `total_quantity` should be accurate

**If you see NO rows or very old dates:**
- Trigger might not be deployed
- OR no invoices have been paid since deployment

---

## Method 4: Test by Simulating Invoice Payment

**Warning: Only run this on test data!**

```sql
-- Find an unpaid invoice (or create a test one)
SELECT invoice_id, payment_status, company_id
FROM invoices
WHERE payment_status = 'unpaid'
LIMIT 1;

-- Note the invoice_id, then simulate payment:
UPDATE invoices
SET payment_status = 'paid', paid_at = NOW()
WHERE invoice_id = '<your-invoice-id>';

-- Now check if company_product_history was updated:
SELECT *
FROM company_product_history
WHERE company_id = '<company-id-from-invoice>'
ORDER BY updated_at DESC;
```

**Expected:** New rows should appear or existing rows should have updated timestamps

---

## Quick Status Check

Based on your statement "Yeah that is working just how I want it to", the trigger is almost certainly deployed and working. You can confirm by running Method 1 or Method 3 above.
