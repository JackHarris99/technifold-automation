/**
 * Rename total_quantity to total_units in company_tools
 * Fix schema mismatch - code expects total_units but migration created total_quantity
 */

-- Rename column for semantic clarity
-- "units" better represents physical tool count vs "quantity" which implies consumables
ALTER TABLE company_tools
  RENAME COLUMN total_quantity TO total_units;

COMMENT ON COLUMN company_tools.total_units IS 'Total number of tool units owned by company';

-- Update the upsert function to use the new column name
CREATE OR REPLACE FUNCTION upsert_company_tool(
  p_company_id text,
  p_tool_code text,
  p_purchase_date date,
  p_quantity integer,
  p_amount numeric,
  p_invoice_id text
)
RETURNS void AS $$
BEGIN
  INSERT INTO company_tools (
    company_id,
    tool_code,
    first_purchased_at,
    last_purchased_at,
    total_purchases,
    total_units,
    last_purchase_amount,
    last_invoice_id
  ) VALUES (
    p_company_id,
    p_tool_code,
    p_purchase_date,
    p_purchase_date,
    1,
    p_quantity,
    p_amount,
    p_invoice_id
  )
  ON CONFLICT (company_id, tool_code)
  DO UPDATE SET
    last_purchased_at = p_purchase_date,
    total_purchases = company_tools.total_purchases + 1,
    total_units = company_tools.total_units + p_quantity,
    last_purchase_amount = p_amount,
    last_invoice_id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;
