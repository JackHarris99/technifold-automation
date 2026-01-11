-- Add distributor login credentials to companies table
-- For companies with type='distributor'

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS distributor_email TEXT,
ADD COLUMN IF NOT EXISTS distributor_password TEXT;

-- Add comment
COMMENT ON COLUMN companies.distributor_email IS 'Email for distributor portal login';
COMMENT ON COLUMN companies.distributor_password IS 'Password for distributor portal login (should be hashed in production)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_distributor_email ON companies(distributor_email) WHERE distributor_email IS NOT NULL;
