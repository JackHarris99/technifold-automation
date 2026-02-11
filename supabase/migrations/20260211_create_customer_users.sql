/**
 * Customer Users Table
 * Enables login-based customer portal (replaces token-based reorder links)
 */

-- Create customer_users table
CREATE TABLE IF NOT EXISTS customer_users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customer_users_company_id ON customer_users(company_id);
CREATE INDEX idx_customer_users_email ON customer_users(email);

-- RLS Policies
ALTER TABLE customer_users ENABLE ROW LEVEL SECURITY;

-- Service role can do anything
CREATE POLICY customer_users_service_access ON customer_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE customer_users IS 'Customer user accounts for login-based portal access';
COMMENT ON COLUMN customer_users.role IS 'User role: admin (can manage team) or user (can only order)';
COMMENT ON COLUMN customer_users.is_active IS 'Whether the user account is active. Deactivated users cannot log in.';

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_customer_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_users_updated_at
  BEFORE UPDATE ON customer_users
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_users_updated_at();
