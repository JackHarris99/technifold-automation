-- Migration: Create outbox table
-- Description: Transactional outbox pattern for reliable async job processing (Zoho sync, etc.)

-- ============================================================================
-- Create outbox table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job classification
  job_type TEXT NOT NULL,  -- e.g., 'zoho_create_invoice', 'zoho_record_payment', 'send_email'

  -- Payload
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,

  -- Error tracking
  last_error TEXT,
  last_attempted_at TIMESTAMPTZ,

  -- Related entities
  company_id TEXT,
  order_id UUID,  -- References orders table if needed

  -- Result storage
  result JSONB,  -- Store successful API responses (e.g., zoho_invoice_id)

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Scheduling
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),  -- Allow delayed execution
  locked_until TIMESTAMPTZ  -- Pessimistic locking for workers
);

-- ============================================================================
-- Create indexes for performance
-- ============================================================================

-- Primary index for worker queries (fetch next pending job)
CREATE INDEX IF NOT EXISTS idx_outbox_pending_jobs
  ON public.outbox(scheduled_for, status, attempts)
  WHERE status IN ('pending', 'failed')
    AND (locked_until IS NULL OR locked_until < NOW());

CREATE INDEX IF NOT EXISTS idx_outbox_status
  ON public.outbox(status);

CREATE INDEX IF NOT EXISTS idx_outbox_job_type
  ON public.outbox(job_type);

CREATE INDEX IF NOT EXISTS idx_outbox_company_id
  ON public.outbox(company_id)
  WHERE company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outbox_order_id
  ON public.outbox(order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outbox_created_at
  ON public.outbox(created_at DESC);

-- ============================================================================
-- Add comments
-- ============================================================================

COMMENT ON TABLE public.outbox IS 'Transactional outbox for reliable async job processing';
COMMENT ON COLUMN public.outbox.job_type IS 'Type of async job to execute (e.g., zoho_create_invoice)';
COMMENT ON COLUMN public.outbox.payload IS 'Job-specific data (order details, invoice data, etc.)';
COMMENT ON COLUMN public.outbox.status IS 'Current status: pending, processing, completed, failed, dead';
COMMENT ON COLUMN public.outbox.attempts IS 'Number of execution attempts made';
COMMENT ON COLUMN public.outbox.locked_until IS 'Pessimistic lock timestamp for worker coordination';
COMMENT ON COLUMN public.outbox.result IS 'Successful job result (API responses, IDs, etc.)';
