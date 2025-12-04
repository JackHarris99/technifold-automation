/**
 * Create Trial Intents Table
 * Stores tokenized trial offer links sent to prospects
 */

-- Create trial_intents table
CREATE TABLE IF NOT EXISTS trial_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Secure token for offer URL
  token VARCHAR(255) UNIQUE NOT NULL,

  -- References
  company_id TEXT NOT NULL REFERENCES companies(company_id),
  contact_id UUID REFERENCES contacts(contact_id),
  machine_id TEXT NOT NULL REFERENCES machines(machine_id),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Optional: track if converted to subscription
  converted_at TIMESTAMP,
  subscription_id UUID REFERENCES subscriptions(subscription_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trial_intents_token ON trial_intents(token);
CREATE INDEX IF NOT EXISTS idx_trial_intents_company ON trial_intents(company_id);
CREATE INDEX IF NOT EXISTS idx_trial_intents_contact ON trial_intents(contact_id);
CREATE INDEX IF NOT EXISTS idx_trial_intents_machine ON trial_intents(machine_id);
CREATE INDEX IF NOT EXISTS idx_trial_intents_created ON trial_intents(created_at);

-- Enable RLS
ALTER TABLE trial_intents ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to trial_intents"
  ON trial_intents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to read by token (for offer page validation)
CREATE POLICY "Allow reading trial_intents by token"
  ON trial_intents FOR SELECT
  TO anon
  USING (true);

-- Add comments
COMMENT ON TABLE trial_intents IS 'Tokenized trial offer links sent to prospects via email';
COMMENT ON COLUMN trial_intents.token IS 'Secure random token used in offer URL (base64url encoded, 32 bytes)';
COMMENT ON COLUMN trial_intents.converted_at IS 'Timestamp when prospect converted to subscription';
