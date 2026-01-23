-- Universal Activity Tracking Table
-- Tracks ALL user activity across the entire platform
-- Customers, prospects, distributors, authenticated users

CREATE TABLE IF NOT EXISTS activity_tracking (
  activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who (one of these will be set depending on user type)
  -- Foreign keys removed for flexibility - IDs reference appropriate tables but without constraints
  prospect_contact_id UUID,
  customer_contact_id UUID,
  customer_company_id TEXT,
  distributor_user_id UUID,
  user_id UUID,

  -- What they did
  url TEXT NOT NULL,
  event_type TEXT, -- 'page_view', 'quote_view', 'reorder_view', 'login', 'order_placed', etc.
  source TEXT, -- 'marketing_email', 'reorder_link', 'quote_link', 'authenticated', 'direct', 'google'

  -- Object context (if applicable)
  object_type TEXT, -- 'quote', 'reorder', 'offer', 'trial', 'invoice', 'subscription'
  object_id TEXT, -- quote_id, invoice_id, subscription_id, etc.

  -- When
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Context metadata
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,

  -- Metadata JSON for additional context
  meta JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_prospect_contact ON activity_tracking(prospect_contact_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_customer_contact ON activity_tracking(customer_contact_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_customer_company ON activity_tracking(customer_company_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_distributor ON activity_tracking(distributor_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_tracking(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_event_type ON activity_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_occurred_at ON activity_tracking(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_source ON activity_tracking(source);
CREATE INDEX IF NOT EXISTS idx_activity_object ON activity_tracking(object_type, object_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activity_company_recent ON activity_tracking(customer_company_id, occurred_at DESC) WHERE customer_company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_prospect_recent ON activity_tracking(prospect_contact_id, occurred_at DESC) WHERE prospect_contact_id IS NOT NULL;

-- Index on session_id for session-based analytics
CREATE INDEX IF NOT EXISTS idx_activity_session ON activity_tracking(session_id, occurred_at DESC);
