/**
 * New Invoice System for Stripe
 * Clean tables designed for growth, not shoehorned into Sage structure
 *
 * Replaces: Writing to orders.items (JSONB) - breaks pipeline queries
 * New approach: Proper relational structure with invoice_items table
 */

-- Invoices table (Stripe invoices going forward)
CREATE TABLE IF NOT EXISTS invoices (
  invoice_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text NOT NULL REFERENCES companies(company_id),
  contact_id uuid REFERENCES contacts(contact_id),

  -- Stripe references
  stripe_invoice_id text UNIQUE,
  stripe_customer_id text,
  stripe_payment_intent_id text,

  -- Invoice details
  invoice_number text UNIQUE, -- Our internal invoice number
  invoice_type text, -- 'sale', 'subscription', 'rental'
  currency text NOT NULL DEFAULT 'gbp',

  -- Amounts
  subtotal numeric(10,2) NOT NULL,
  tax_amount numeric(10,2) DEFAULT 0,
  shipping_amount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,

  -- Status tracking
  status text NOT NULL, -- 'draft', 'sent', 'paid', 'void'
  payment_status text NOT NULL, -- 'unpaid', 'paid', 'partial', 'refunded'

  -- Dates
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  paid_at timestamptz,
  sent_at timestamptz,
  voided_at timestamptz,

  -- URLs
  invoice_url text,
  invoice_pdf_url text,

  -- Shipping (if physical goods)
  shipping_address_id uuid REFERENCES shipping_addresses(address_id),
  shipping_country text,
  tracking_number text,
  carrier text,
  shipped_at timestamptz,

  -- Metadata
  notes text,
  created_by text, -- Sales rep who created it
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_contact ON invoices(contact_id);
CREATE INDEX idx_invoices_stripe_invoice ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status, payment_status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_created_by ON invoices(created_by);

COMMENT ON TABLE invoices IS 'Stripe invoices going forward - clean design for new sales';

-- Invoice Items table (line items)
CREATE TABLE IF NOT EXISTS invoice_items (
  invoice_id uuid NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
  product_code text NOT NULL REFERENCES products(product_code),
  line_number integer NOT NULL, -- Order of items in invoice

  -- Item details
  description text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  line_total numeric(10,2) NOT NULL,

  -- Metadata
  notes text,

  PRIMARY KEY (invoice_id, product_code, line_number)
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_items(product_code);

COMMENT ON TABLE invoice_items IS 'Line items for Stripe invoices - enables pipeline queries and fact table updates';

/**
 * Trigger: Update fact tables when invoice is paid
 * Automatically maintains company_tools and company_consumables
 */
CREATE OR REPLACE FUNCTION update_facts_on_invoice_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when payment_status changes to 'paid'
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN

    -- Update company_tools for each tool in this invoice
    PERFORM upsert_company_tool(
      NEW.company_id,
      ii.product_code,
      NEW.invoice_date,
      ii.quantity,
      ii.line_total,
      NEW.stripe_invoice_id
    )
    FROM invoice_items ii
    JOIN products p ON ii.product_code = p.product_code
    WHERE ii.invoice_id = NEW.invoice_id
      AND p.type = 'tool';

    -- Update company_consumables for each consumable in this invoice
    PERFORM upsert_company_consumable(
      NEW.company_id,
      ii.product_code,
      NEW.invoice_date,
      ii.quantity,
      ii.line_total,
      NEW.stripe_invoice_id
    )
    FROM invoice_items ii
    JOIN products p ON ii.product_code = p.product_code
    WHERE ii.invoice_id = NEW.invoice_id
      AND p.type = 'consumable';

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_facts_on_invoice_paid
  AFTER UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_facts_on_invoice_paid();

-- Trigger: Update updated_at timestamp
CREATE TRIGGER trigger_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

/**
 * View: Invoice Summary with Line Items
 * Useful for displaying invoices with their items
 */
CREATE OR REPLACE VIEW v_invoice_details AS
SELECT
  i.invoice_id,
  i.invoice_number,
  i.company_id,
  c.company_name,
  i.contact_id,
  COALESCE(ct.full_name, ct.first_name || ' ' || ct.last_name) as contact_name,
  i.stripe_invoice_id,
  i.invoice_type,
  i.total_amount,
  i.currency,
  i.status,
  i.payment_status,
  i.invoice_date,
  i.paid_at,
  i.created_by,
  -- Aggregate line items
  jsonb_agg(
    jsonb_build_object(
      'product_code', ii.product_code,
      'description', ii.description,
      'quantity', ii.quantity,
      'unit_price', ii.unit_price,
      'line_total', ii.line_total
    ) ORDER BY ii.line_number
  ) as line_items
FROM invoices i
JOIN companies c ON i.company_id = c.company_id
LEFT JOIN contacts ct ON i.contact_id = ct.contact_id
LEFT JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
GROUP BY
  i.invoice_id, i.invoice_number, i.company_id, c.company_name,
  i.contact_id, ct.full_name, ct.first_name, ct.last_name,
  i.stripe_invoice_id, i.invoice_type, i.total_amount, i.currency,
  i.status, i.payment_status, i.invoice_date, i.paid_at, i.created_by;

COMMENT ON VIEW v_invoice_details IS 'Invoice summary with aggregated line items for easy display';
