-- Migration: Add Stripe and Zoho integration fields
-- Description: Adds stripe_customer_id, zoho_account_id to companies table
--              and zoho_contact_id to contacts table

-- ============================================================================
-- 1. Add integration fields to companies table
-- ============================================================================

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS zoho_account_id TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer_id
  ON public.companies(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_zoho_account_id
  ON public.companies(zoho_account_id)
  WHERE zoho_account_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN public.companies.stripe_customer_id IS 'Stripe customer ID for billing integration';
COMMENT ON COLUMN public.companies.zoho_account_id IS 'Zoho Books account ID for invoicing';

-- ============================================================================
-- 2. Add integration field to contacts table
-- ============================================================================

ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS zoho_contact_id TEXT;

-- Add index
CREATE INDEX IF NOT EXISTS idx_contacts_zoho_contact_id
  ON public.contacts(zoho_contact_id)
  WHERE zoho_contact_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.contacts.zoho_contact_id IS 'Zoho CRM/Books contact ID for sync';
