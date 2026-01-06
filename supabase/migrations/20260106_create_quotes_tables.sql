-- Create quotes table (similar to invoices but for quote management)
CREATE TABLE IF NOT EXISTS quotes (
  quote_id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id text NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(contact_id) ON DELETE CASCADE,

  -- Quote configuration
  quote_type text NOT NULL,  -- 'consumable_interactive' or 'tool_static'
  pricing_mode text,  -- 'standard' or 'premium' (for consumables)

  -- Status tracking
  status text NOT NULL DEFAULT 'draft',  -- 'draft', 'sent', 'viewed', 'accepted', 'expired', 'rejected'

  -- Pricing
  currency text NOT NULL DEFAULT 'GBP',
  subtotal numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,

  -- Conversion tracking
  invoice_id uuid REFERENCES invoices(invoice_id) ON DELETE SET NULL,  -- If quote converted to invoice

  -- Dates
  expires_at timestamp with time zone,
  sent_at timestamp with time zone,
  viewed_at timestamp with time zone,
  accepted_at timestamp with time zone,

  -- Meta
  is_test boolean DEFAULT FALSE,
  notes text,
  created_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create quote_items table (similar to invoice_items)
CREATE TABLE IF NOT EXISTS quote_items (
  quote_id uuid NOT NULL REFERENCES quotes(quote_id) ON DELETE CASCADE,
  product_code text NOT NULL REFERENCES products(product_code) ON DELETE RESTRICT,
  line_number integer NOT NULL,

  -- Line item details
  description text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  discount_percent numeric DEFAULT 0,
  line_total numeric NOT NULL,

  -- Product metadata (denormalized for historical record)
  product_type text,  -- 'tool', 'consumable', etc.
  category text,
  image_url text,

  PRIMARY KEY (quote_id, product_code, line_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_contact_id ON quotes(contact_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);

-- Create updated_at trigger for quotes table
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotes_updated_at_trigger
BEFORE UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION update_quotes_updated_at();

-- Grant permissions (adjust based on your RLS setup)
-- This assumes you have a similar permission structure to other tables
-- GRANT ALL ON quotes TO authenticated;
-- GRANT ALL ON quote_items TO authenticated;
