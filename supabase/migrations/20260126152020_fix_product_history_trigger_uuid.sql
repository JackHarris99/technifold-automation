-- Fix sync_invoice_to_product_history trigger to use UUID instead of TEXT
CREATE OR REPLACE FUNCTION public.sync_invoice_to_product_history()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_company_id uuid;  -- Changed from TEXT to UUID
  v_invoice_date date;
  v_payment_status text;
  v_product_type text;
  v_item record;
BEGIN
  -- Only process if invoice is paid
  IF (TG_OP = 'INSERT' AND NEW.payment_status = 'paid') OR
     (TG_OP = 'UPDATE' AND OLD.payment_status != 'paid' AND NEW.payment_status = 'paid') THEN

    -- Get company_id from invoice
    SELECT company_id, invoice_date, payment_status
    INTO v_company_id, v_invoice_date, v_payment_status
    FROM invoices
    WHERE invoice_id = NEW.invoice_id;

    -- Loop through invoice items and upsert to company_product_history
    FOR v_item IN
      SELECT product_code, quantity
      FROM invoice_items
      WHERE invoice_id = NEW.invoice_id
    LOOP
      -- Get product type
      SELECT type INTO v_product_type
      FROM products
      WHERE product_code = v_item.product_code;

      -- Upsert into company_product_history
      INSERT INTO company_product_history (
        company_id,
        product_code,
        product_type,
        first_purchased_at,
        last_purchased_at,
        total_purchases,
        total_quantity
      ) VALUES (
        v_company_id,
        v_item.product_code,
        v_product_type,
        v_invoice_date,
        v_invoice_date,
        1,
        v_item.quantity
      )
      ON CONFLICT (company_id, product_code)
      DO UPDATE SET
        last_purchased_at = EXCLUDED.last_purchased_at,
        total_purchases = company_product_history.total_purchases + 1,
        total_quantity = company_product_history.total_quantity + EXCLUDED.total_quantity;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;
