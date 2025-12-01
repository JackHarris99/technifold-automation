/**
 * Create Subscriptions Table
 * Tracks tool rental subscriptions with flexible pricing
 */

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stripe reference
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),

  -- Customer
  company_id TEXT NOT NULL REFERENCES companies(company_id),
  contact_id UUID REFERENCES contacts(contact_id),

  -- Pricing
  monthly_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',

  -- Tools assigned (JSONB array of product codes)
  tools JSONB DEFAULT '[]'::jsonb,

  -- Status
  status VARCHAR(50) DEFAULT 'trial', -- trial, active, past_due, cancelled, paused

  -- Trial period
  trial_start_date TIMESTAMP,
  trial_end_date TIMESTAMP,

  -- Billing cycle
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  next_billing_date TIMESTAMP,

  -- Ratcheting (price can only increase)
  ratchet_max DECIMAL(10,2), -- Highest price ever charged

  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,

  -- Tracking (optional - type depends on your users table)
  created_by TEXT,
  updated_by TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE subscriptions IS 'Tool rental subscriptions with flexible bundle pricing';
COMMENT ON COLUMN subscriptions.tools IS 'JSONB array of product codes assigned to this subscription, e.g. ["TRI-CREASER", "QUAD-CREASER"]';
COMMENT ON COLUMN subscriptions.monthly_price IS 'Current monthly price in GBP (or currency specified)';
COMMENT ON COLUMN subscriptions.ratchet_max IS 'Maximum price ever charged - subscriptions can only increase, never decrease';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status: trial, active, past_due, cancelled, paused';

-- Create subscription_events table for audit trail
CREATE TABLE IF NOT EXISTS subscription_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(subscription_id),

  event_type VARCHAR(50) NOT NULL, -- created, trial_started, trial_ended, price_increased, tool_added, tool_removed, cancelled, reactivated
  event_name VARCHAR(100),

  -- Event details
  old_value JSONB,
  new_value JSONB,

  -- Context
  performed_by TEXT,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  notes TEXT
);

-- Index for event lookups
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_date ON subscription_events(performed_at);

-- Enable RLS
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to subscription events"
  ON subscription_events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE subscription_events IS 'Audit trail for subscription changes';

-- Create view for active subscriptions
CREATE OR REPLACE VIEW v_active_subscriptions AS
SELECT
  s.subscription_id,
  s.stripe_subscription_id,
  s.company_id,
  c.company_name,
  s.contact_id,
  ct.full_name as contact_name,
  ct.email as contact_email,
  s.monthly_price,
  s.currency,
  s.tools,
  s.status,
  s.trial_end_date,
  s.next_billing_date,
  s.ratchet_max,
  s.created_at,

  -- Calculate trial days remaining
  CASE
    WHEN s.status = 'trial' AND s.trial_end_date > NOW()
    THEN EXTRACT(DAY FROM s.trial_end_date - NOW())::INTEGER
    ELSE 0
  END as trial_days_remaining,

  -- Calculate total tool count
  jsonb_array_length(s.tools) as tool_count

FROM subscriptions s
JOIN companies c ON s.company_id = c.company_id
LEFT JOIN contacts ct ON s.contact_id = ct.contact_id
WHERE s.status IN ('trial', 'active')
ORDER BY s.created_at DESC;

COMMENT ON VIEW v_active_subscriptions IS 'All active and trial subscriptions with company and contact details';
