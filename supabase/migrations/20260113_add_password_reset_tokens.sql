-- Add password reset token columns to users table
-- Enables self-service password reset via email

ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.reset_token IS 'Temporary token for password reset (expires in 1 hour)';
COMMENT ON COLUMN users.reset_token_expires IS 'Expiry timestamp for reset token';
