-- ============================================================================
-- Manual Import: Single Stripe Invoice
-- ============================================================================
-- Use this to manually import one Stripe invoice at a time
-- Get the invoice details from Stripe Dashboard

-- Step 1: Find the company_id from Stripe customer ID
-- Replace 'cus_XXXXX' with actual Stripe customer ID
SELECT
  company_id,
  company_name,
  stripe_customer_id
FROM companies
WHERE stripe_customer_id = 'cus_XXXXX';  -- Replace with actual Stripe customer ID

-- Step 2: Insert the invoice
-- Replace values with actual invoice data from Stripe
INSERT INTO invoices (
  invoice_id,           -- Stripe invoice ID (e.g., 'in_XXXXX')
  company_id,           -- From Step 1
  invoice_date,         -- Date invoice was finalized
  payment_status,       -- 'paid'
  total_amount,         -- Total in your currency
  currency,             -- e.g., 'gbp', 'usd'
  stripe_invoice_id,    -- Same as invoice_id
  created_at            -- When invoice was created
) VALUES (
  'in_XXXXX',           -- Replace with Stripe invoice ID
  'COMPANY_ID',         -- Replace with company_id from Step 1
  '2025-12-15',         -- Replace with actual date
  'paid',
  150.00,               -- Replace with actual amount
  'gbp',                -- Replace with actual currency
  'in_XXXXX',           -- Same as invoice_id
  '2025-12-15 10:30:00+00'  -- Replace with actual timestamp
);

-- Step 3: Insert invoice items
-- Add one INSERT for each line item from Stripe invoice
INSERT INTO invoice_items (
  invoice_id,
  product_code,         -- Your internal product code
  quantity,
  unit_price
) VALUES
  ('in_XXXXX', 'PRODUCT_CODE_1', 10, 10.00),  -- Replace with actual data
  ('in_XXXXX', 'PRODUCT_CODE_2', 5, 8.00);    -- Add more rows as needed

-- Step 4: Verify the import
-- This should show the invoice and trigger should have synced it
SELECT
  i.invoice_id,
  i.company_id,
  c.company_name,
  i.invoice_date,
  i.total_amount,
  COUNT(ii.product_code) as item_count
FROM invoices i
LEFT JOIN companies c ON i.company_id = c.company_id
LEFT JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
WHERE i.invoice_id = 'in_XXXXX'  -- Replace with invoice ID
GROUP BY i.invoice_id, i.company_id, c.company_name, i.invoice_date, i.total_amount;

-- Step 5: Check if it synced to product_history
SELECT
  cph.company_id,
  cph.product_code,
  cph.last_purchased_at,
  cph.total_purchases,
  cph.total_quantity,
  cph.source
FROM company_product_history cph
WHERE cph.company_id = 'COMPANY_ID'  -- Replace with company_id
  AND cph.last_purchased_at = '2025-12-15';  -- Replace with invoice_date

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 1. Get Stripe invoice details from: Stripe Dashboard → Invoices → [Invoice]
-- 2. Match Stripe customer to company using stripe_customer_id
-- 3. Map Stripe line items to your internal product_code
-- 4. The trigger will automatically sync once inserted with payment_status='paid'
-- 5. If product_code doesn't exist, the trigger will default type to 'other'
-- ============================================================================
