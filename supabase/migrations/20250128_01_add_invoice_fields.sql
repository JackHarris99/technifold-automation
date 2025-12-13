-- Migration: Add invoice-led fields to orders table
-- Description: Support Stripe invoice-led flow for consumables and quotes

-- ============================================================================
-- Add invoice fields to orders table
-- ============================================================================

-- Add stripe_invoice_id column
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;

-- Add invoice_status column
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS invoice_status TEXT
CHECK (invoice_status IN ('draft', 'open', 'sent', 'paid', 'void', 'uncollectible'));

-- Add invoice_url (Stripe hosted invoice page)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Add invoice PDF URL (downloadable PDF)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT;

-- Add commercial invoice PDF URL (for international shipments)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS commercial_invoice_pdf_url TEXT;

-- Add invoice timestamps
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMPTZ;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS invoice_voided_at TIMESTAMPTZ;

-- Add shipping details for commercial invoices
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_weight_kg NUMERIC(10, 2);

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS incoterms TEXT; -- DDP, DAP, EXW, etc.

-- ============================================================================
-- Create indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_stripe_invoice_id
  ON public.orders(stripe_invoice_id)
  WHERE stripe_invoice_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_invoice_status
  ON public.orders(invoice_status)
  WHERE invoice_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_unpaid
  ON public.orders(invoice_status, created_at DESC)
  WHERE invoice_status IN ('open', 'sent');

-- ============================================================================
-- Add comments
-- ============================================================================

COMMENT ON COLUMN public.orders.stripe_invoice_id IS 'Stripe invoice ID for invoice-led orders';
COMMENT ON COLUMN public.orders.invoice_status IS 'Invoice status: draft, open, sent, paid, void, uncollectible';
COMMENT ON COLUMN public.orders.invoice_url IS 'Stripe hosted invoice payment page URL';
COMMENT ON COLUMN public.orders.invoice_pdf_url IS 'Stripe invoice PDF download URL';
COMMENT ON COLUMN public.orders.commercial_invoice_pdf_url IS 'Commercial invoice PDF for international customs';
COMMENT ON COLUMN public.orders.shipping_weight_kg IS 'Total shipment weight for commercial invoice';
COMMENT ON COLUMN public.orders.incoterms IS 'International shipping terms (DDP, DAP, EXW, etc.)';
