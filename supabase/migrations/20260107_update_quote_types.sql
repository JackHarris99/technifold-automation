-- Update quote_type to use 'interactive' or 'static' instead of product-specific types
-- This allows any product type (tools, consumables, parts) to use either quote mode

-- Update existing quotes to new naming convention
UPDATE quotes
SET quote_type = 'static'
WHERE quote_type = 'tool_static';

UPDATE quotes
SET quote_type = 'interactive'
WHERE quote_type = 'consumable_interactive';

-- Add comment to clarify the field
COMMENT ON COLUMN quotes.quote_type IS 'Quote behavior: "interactive" = customer can adjust quantities with live price recalculation, "static" = customer can adjust quantities but prices are locked at quoted amounts';

-- Update pricing_mode comment for clarity
COMMENT ON COLUMN quotes.pricing_mode IS 'For interactive quotes only: "standard" or "premium" tiered pricing mode. Ignored for static quotes.';
