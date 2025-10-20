-- Migration: Harden outbox with atomic claim function and add missing indexes
-- Description: Adds claim_outbox_job RPC for proper concurrency control,
--              unique indexes for idempotency, and composite indexes for performance

-- ============================================================================
-- 1. Create atomic job claim function for outbox worker
-- ============================================================================

CREATE OR REPLACE FUNCTION public.claim_outbox_job(
  max_attempts_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  job_type TEXT,
  payload JSONB,
  status TEXT,
  attempts INT,
  max_attempts INT,
  last_error TEXT,
  last_attempted_at TIMESTAMPTZ,
  company_id TEXT,
  order_id UUID,
  result JSONB,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  locked_until TIMESTAMPTZ
) AS $$
DECLARE
  claimed_job public.outbox;
  lock_duration INTERVAL := '5 minutes';
BEGIN
  -- Atomically claim next available job using FOR UPDATE SKIP LOCKED
  SELECT * INTO claimed_job
  FROM public.outbox
  WHERE status IN ('pending', 'failed')
    AND attempts < max_attempts_limit
    AND scheduled_for <= NOW()
    AND (locked_until IS NULL OR locked_until < NOW())
  ORDER BY
    -- Prioritize: pending > failed, then oldest first
    CASE WHEN status = 'pending' THEN 1 ELSE 2 END,
    created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- If no job found, return empty
  IF claimed_job.id IS NULL THEN
    RETURN;
  END IF;

  -- Update job status to processing and set lock
  UPDATE public.outbox
  SET
    status = 'processing',
    locked_until = NOW() + lock_duration,
    last_attempted_at = NOW(),
    attempts = attempts + 1
  WHERE outbox.id = claimed_job.id;

  -- Return the claimed job with updated values
  RETURN QUERY
  SELECT
    claimed_job.id,
    claimed_job.job_type,
    claimed_job.payload,
    'processing'::TEXT AS status,
    claimed_job.attempts + 1 AS attempts,
    claimed_job.max_attempts,
    claimed_job.last_error,
    NOW() AS last_attempted_at,
    claimed_job.company_id,
    claimed_job.order_id,
    claimed_job.result,
    claimed_job.created_at,
    claimed_job.completed_at,
    claimed_job.scheduled_for,
    NOW() + lock_duration AS locked_until;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.claim_outbox_job IS 'Atomically claims next available outbox job using SELECT FOR UPDATE SKIP LOCKED';

-- ============================================================================
-- 2. Add composite index on outbox for optimal worker queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_outbox_worker_query
  ON public.outbox(status, scheduled_for, created_at)
  WHERE status IN ('pending', 'failed')
    AND (locked_until IS NULL OR locked_until < NOW());

-- ============================================================================
-- 3. Add unique constraint on orders.stripe_payment_intent_id
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_unique
  ON public.orders(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

COMMENT ON INDEX public.idx_orders_stripe_payment_intent_unique IS 'Ensures idempotency for Stripe payment_intent webhooks';

-- ============================================================================
-- 4. Add missing index on orders.stripe_invoice_id (for future use)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_stripe_invoice_id
  ON public.orders(stripe_invoice_id)
  WHERE stripe_invoice_id IS NOT NULL;

-- ============================================================================
-- 5. Ensure orders table has all necessary constraints
-- ============================================================================

-- Verify unique constraint on stripe_checkout_session_id exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_stripe_checkout_session_id_key'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT orders_stripe_checkout_session_id_key
    UNIQUE (stripe_checkout_session_id);
  END IF;
END $$;
