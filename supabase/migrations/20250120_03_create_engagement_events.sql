-- Migration: Create or update engagement_events table
-- Description: Ensures engagement_events table has all required columns per the brief

-- ============================================================================
-- Create engagement_events table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.engagement_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Company/Contact identification
  company_id TEXT,
  company_uuid UUID,
  contact_id UUID,

  -- Event source and classification
  source TEXT NOT NULL CHECK (source IN ('zoho', 'vercel', 'stripe', 'admin', 'other')),
  source_event_id TEXT,  -- External event ID for idempotency
  event_name TEXT NOT NULL,

  -- Campaign/Offer tracking
  offer_key TEXT,
  campaign_key TEXT,

  -- Session/URL tracking
  session_id UUID,
  url TEXT,

  -- UTM parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,

  -- Value tracking (for conversions, order values, etc.)
  value NUMERIC(10, 2),
  currency TEXT DEFAULT 'GBP',

  -- Flexible metadata storage
  meta JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns to existing table
DO $$
BEGIN
  -- Add columns that might be missing
  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS company_uuid UUID;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS source_event_id TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS offer_key TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS campaign_key TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS session_id UUID;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS url TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS utm_source TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS utm_medium TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS utm_term TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS utm_content TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS value NUMERIC(10, 2);
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GBP';
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;

  BEGIN
    ALTER TABLE public.engagement_events ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END;
END $$;

-- ============================================================================
-- Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_engagement_events_company_id
  ON public.engagement_events(company_id);

CREATE INDEX IF NOT EXISTS idx_engagement_events_company_uuid
  ON public.engagement_events(company_uuid);

CREATE INDEX IF NOT EXISTS idx_engagement_events_contact_id
  ON public.engagement_events(contact_id);

CREATE INDEX IF NOT EXISTS idx_engagement_events_occurred_at
  ON public.engagement_events(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_engagement_events_source
  ON public.engagement_events(source);

CREATE INDEX IF NOT EXISTS idx_engagement_events_event_name
  ON public.engagement_events(event_name);

CREATE INDEX IF NOT EXISTS idx_engagement_events_offer_key
  ON public.engagement_events(offer_key)
  WHERE offer_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_engagement_events_campaign_key
  ON public.engagement_events(campaign_key)
  WHERE campaign_key IS NOT NULL;

-- Unique index for idempotency (prevent duplicate events from same source)
CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_events_source_event_id
  ON public.engagement_events(source, source_event_id)
  WHERE source_event_id IS NOT NULL;

-- ============================================================================
-- Add foreign key constraints (if tables exist)
-- ============================================================================

-- Note: Using DO block to handle case where FKs might already exist
DO $$
BEGIN
  -- FK to companies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_engagement_events_company'
  ) THEN
    ALTER TABLE public.engagement_events
    ADD CONSTRAINT fk_engagement_events_company
    FOREIGN KEY (company_id)
    REFERENCES public.companies(company_id)
    ON DELETE CASCADE;
  END IF;

  -- FK to contacts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_engagement_events_contact'
  ) THEN
    ALTER TABLE public.engagement_events
    ADD CONSTRAINT fk_engagement_events_contact
    FOREIGN KEY (contact_id)
    REFERENCES public.contacts(contact_id)
    ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'FK constraint creation skipped or failed: %', SQLERRM;
END $$;

-- ============================================================================
-- Add comments
-- ============================================================================

COMMENT ON TABLE public.engagement_events IS 'Unified event tracking for all customer interactions';
COMMENT ON COLUMN public.engagement_events.source IS 'System that generated this event (zoho/vercel/stripe/admin/other)';
COMMENT ON COLUMN public.engagement_events.source_event_id IS 'External event ID for idempotency checking';
COMMENT ON COLUMN public.engagement_events.offer_key IS 'Identifier for specific promotional offer';
COMMENT ON COLUMN public.engagement_events.campaign_key IS 'Marketing campaign identifier';
COMMENT ON COLUMN public.engagement_events.meta IS 'Flexible JSON storage for event-specific data';
