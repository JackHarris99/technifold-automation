/**
 * Add invitation fields to customer_users table
 * Allows sending invitation emails for account setup
 */

-- Add invitation fields
ALTER TABLE customer_users
  ADD COLUMN IF NOT EXISTS invitation_token TEXT,
  ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ;

-- Create index for invitation token lookups
CREATE INDEX IF NOT EXISTS idx_customer_users_invitation_token
  ON customer_users(invitation_token)
  WHERE invitation_token IS NOT NULL;

-- Allow password_hash to be NULL initially (set when accepting invitation)
ALTER TABLE customer_users
  ALTER COLUMN password_hash DROP NOT NULL;

-- Comments
COMMENT ON COLUMN customer_users.invitation_token IS 'Token for invitation link, expires after 7 days';
COMMENT ON COLUMN customer_users.invitation_expires_at IS 'When the invitation expires';
