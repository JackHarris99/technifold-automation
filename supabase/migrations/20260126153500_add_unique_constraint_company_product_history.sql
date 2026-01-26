-- Add missing unique constraint for ON CONFLICT clause in trigger
-- This is required by sync_invoice_to_product_history trigger
ALTER TABLE company_product_history
ADD CONSTRAINT company_product_history_company_product_unique
UNIQUE (company_id, product_code);
