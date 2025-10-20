-- Migration: Create orders table
-- Description: Store order data from Stripe checkouts and link to Zoho invoices

-- ============================================================================
-- Create orders table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company/Contact relationship
  company_id TEXT NOT NULL,
  contact_id UUID,

  -- Stripe data
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,

  -- Order details
  offer_key TEXT,  -- Track which offer/campaign generated this order
  campaign_key TEXT,

  -- Line items stored as JSONB
  items JSONB NOT NULL,  -- Array of {product_code, quantity, price, description}

  -- Financial
  subtotal NUMERIC(10, 2) NOT NULL,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partially_refunded', 'refunded')),

  -- Zoho integration
  zoho_invoice_id TEXT,
  zoho_payment_id TEXT,
  zoho_synced_at TIMESTAMPTZ,
  zoho_sync_error TEXT,

  -- Metadata
  meta JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- Create indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_company_id
  ON public.orders(company_id);

CREATE INDEX IF NOT EXISTS idx_orders_contact_id
  ON public.orders(contact_id)
  WHERE contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session
  ON public.orders(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent
  ON public.orders(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON public.orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_orders_zoho_invoice
  ON public.orders(zoho_invoice_id)
  WHERE zoho_invoice_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_offer_key
  ON public.orders(offer_key)
  WHERE offer_key IS NOT NULL;

-- ============================================================================
-- Add foreign keys
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_orders_company'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT fk_orders_company
    FOREIGN KEY (company_id)
    REFERENCES public.companies(company_id)
    ON DELETE RESTRICT;  -- Don't allow deleting companies with orders
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_orders_contact'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT fk_orders_contact
    FOREIGN KEY (contact_id)
    REFERENCES public.contacts(contact_id)
    ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'FK constraint creation skipped or failed: %', SQLERRM;
END $$;

-- ============================================================================
-- Add updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Add comments
-- ============================================================================

COMMENT ON TABLE public.orders IS 'Orders from Stripe checkout sessions';
COMMENT ON COLUMN public.orders.items IS 'Order line items as JSON array: [{product_code, quantity, price, description}]';
COMMENT ON COLUMN public.orders.offer_key IS 'Promotional offer that generated this order';
COMMENT ON COLUMN public.orders.zoho_invoice_id IS 'Zoho Books invoice ID after sync';
COMMENT ON COLUMN public.orders.zoho_payment_id IS 'Zoho Books payment ID after sync';
