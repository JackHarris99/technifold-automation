-- Make product_code nullable in invoice_items to support Stripe invoice imports
-- Stripe uses product IDs (prod_XXX) that don't map to our product codes
-- This allows us to import Stripe invoices with line items that have no product_code

-- Step 1: Drop the existing primary key constraint
ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS invoice_items_pkey;

-- Step 2: Make product_code nullable
ALTER TABLE invoice_items ALTER COLUMN product_code DROP NOT NULL;

-- Step 3: Create a new primary key using invoice_id and line_number
-- This is the correct primary key since each invoice has sequential line numbers
ALTER TABLE invoice_items ADD PRIMARY KEY (invoice_id, line_number);

-- Step 4: Add an index on product_code for performance (since it's no longer in PK)
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_code ON invoice_items(product_code) WHERE product_code IS NOT NULL;

-- Step 5: Fix the trigger to skip NULL product_codes
-- The sync_invoice_to_product_history trigger tries to insert product_code into company_product_history
-- which has a PK on (company_id, product_code), so NULL values must be skipped
CREATE OR REPLACE FUNCTION public.sync_invoice_to_product_history()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_company_id text;
  v_invoice_date date;
  v_payment_status text;
  v_product_type text;
  v_item record;
BEGIN
  -- Only process if invoice is paid
  IF (TG_OP = 'INSERT' AND NEW.payment_status = 'paid') OR
     (TG_OP = 'UPDATE' AND OLD.payment_status != 'paid' AND NEW.payment_status = 'paid') THEN

    -- Get company_id and invoice_date from the invoice
    SELECT company_id, invoice_date, payment_status
    INTO v_company_id, v_invoice_date, v_payment_status
    FROM invoices
    WHERE invoice_id = NEW.invoice_id;

    -- Only proceed if invoice is actually paid
    IF v_payment_status != 'paid' THEN
      RETURN NEW;
    END IF;

    -- Loop through all items in this invoice
    -- IMPORTANT: Skip items with NULL product_code (Stripe imports)
    FOR v_item IN
      SELECT product_code, quantity
      FROM invoice_items
      WHERE invoice_id = NEW.invoice_id
        AND product_code IS NOT NULL  -- Skip Stripe items with no product mapping
    LOOP
      -- Get product type from products table
      SELECT type INTO v_product_type
      FROM products
      WHERE product_code = v_item.product_code;

      -- Default to 'other' if product not found
      IF v_product_type IS NULL THEN
        v_product_type := 'other';
      END IF;

      -- Upsert into company_product_history
      INSERT INTO company_product_history (
        company_id,
        product_code,
        product_type,
        first_purchased_at,
        last_purchased_at,
        total_purchases,
        total_quantity,
        source,
        created_at,
        updated_at
      ) VALUES (
        v_company_id,
        v_item.product_code,
        v_product_type,
        v_invoice_date,
        v_invoice_date,
        1,
        v_item.quantity,
        'invoice',
        NOW(),
        NOW()
      )
      ON CONFLICT (company_id, product_code)
      DO UPDATE SET
        last_purchased_at = EXCLUDED.last_purchased_at,
        total_purchases = company_product_history.total_purchases + 1,
        total_quantity = company_product_history.total_quantity + EXCLUDED.total_quantity,
        updated_at = NOW();
    END LOOP;

    RAISE NOTICE 'Synced invoice % items to product_history for company %', NEW.invoice_id, v_company_id;
  END IF;

  RETURN NEW;
END;
$function$;

COMMENT ON COLUMN invoice_items.product_code IS 'Product code - nullable to support Stripe imports where product mapping is unknown';
