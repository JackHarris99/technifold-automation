-- Migration: Add company_machine table and account_owner column
-- Description: Support machine discovery workflow and rep assignment

-- ============================================================================
-- Add account_owner column to companies
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'companies'
    AND column_name = 'account_owner'
  ) THEN
    ALTER TABLE public.companies
    ADD COLUMN account_owner TEXT;

    COMMENT ON COLUMN public.companies.account_owner IS 'Sales rep assigned to this account (rep_a, rep_b, rep_c)';
  END IF;
END $$;

-- ============================================================================
-- Create company_machine table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.company_machine (
  company_machine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  company_id TEXT NOT NULL,
  machine_id UUID NOT NULL,

  -- Discovery metadata
  source TEXT NOT NULL DEFAULT 'self_report' CHECK (source IN ('self_report', 'sales_confirmed', 'inferred', 'zoho_import')),
  confirmed BOOLEAN NOT NULL DEFAULT false,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 5),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE (company_id, machine_id)
);

-- ============================================================================
-- Add foreign keys
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_company_machine_company'
  ) THEN
    ALTER TABLE public.company_machine
    ADD CONSTRAINT fk_company_machine_company
    FOREIGN KEY (company_id)
    REFERENCES public.companies(company_id)
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_company_machine_machine'
  ) THEN
    ALTER TABLE public.company_machine
    ADD CONSTRAINT fk_company_machine_machine
    FOREIGN KEY (machine_id)
    REFERENCES public.machines(machine_id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- Create indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_company_machine_company
  ON public.company_machine(company_id);

CREATE INDEX IF NOT EXISTS idx_company_machine_machine
  ON public.company_machine(machine_id);

CREATE INDEX IF NOT EXISTS idx_company_machine_source
  ON public.company_machine(source);

CREATE INDEX IF NOT EXISTS idx_company_machine_confirmed
  ON public.company_machine(confirmed)
  WHERE confirmed = true;

-- ============================================================================
-- Add updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_company_machine_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Safely drop the trigger if it already exists before recreating it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_company_machine_updated_at_trigger'
  ) THEN
    DROP TRIGGER update_company_machine_updated_at_trigger ON public.company_machine;
  END IF;
END $$;

CREATE TRIGGER update_company_machine_updated_at_trigger
  BEFORE UPDATE ON public.company_machine
  FOR EACH ROW
  EXECUTE FUNCTION update_company_machine_updated_at();