-- Migration: Add 'not_yet' status and contact_again_date to quote_requests
-- Description: Support "Not Yet" workflow where prospects are interested but not ready

-- ============================================================================
-- Add contact_again_date column to quote_requests
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'quote_requests'
    AND column_name = 'contact_again_date'
  ) THEN
    ALTER TABLE public.quote_requests
    ADD COLUMN contact_again_date TIMESTAMPTZ;

    COMMENT ON COLUMN public.quote_requests.contact_again_date IS 'For "not_yet" status - when to contact this prospect again';
  END IF;
END $$;

-- ============================================================================
-- Create index for contact_again_date to optimize reminder queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_quote_requests_contact_again_date
  ON public.quote_requests(contact_again_date)
  WHERE contact_again_date IS NOT NULL;

-- ============================================================================
-- Add status check constraint if it doesn't exist
-- Note: This assumes the table has a status column. If there's an existing
-- constraint, you may need to drop it first and recreate with new values.
-- ============================================================================

-- First, check if the constraint exists and drop it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'quote_requests_status_check'
    AND table_name = 'quote_requests'
  ) THEN
    ALTER TABLE public.quote_requests DROP CONSTRAINT quote_requests_status_check;
  END IF;
END $$;

-- Add the constraint with all status values including 'not_yet'
ALTER TABLE public.quote_requests
ADD CONSTRAINT quote_requests_status_check
CHECK (status IN (
  'requested',
  'quote_sent',
  'not_yet',
  'won',
  'lost',
  'too_soon',
  'not_ready',
  'too_expensive'
));

COMMENT ON CONSTRAINT quote_requests_status_check ON public.quote_requests IS
  'Valid statuses: requested, quote_sent, not_yet, won, lost, too_soon, not_ready, too_expensive';
