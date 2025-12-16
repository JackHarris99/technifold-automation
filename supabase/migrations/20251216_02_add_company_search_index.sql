-- Add indexes for fast company search
-- ILIKE queries benefit from pg_trgm indexes

-- Enable the pg_trgm extension for fast ILIKE searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index on company_name for fast ILIKE queries
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm
ON companies USING gin (company_name gin_trgm_ops);

-- Create GIN index on company_id for fast ILIKE queries
CREATE INDEX IF NOT EXISTS idx_companies_id_trgm
ON companies USING gin (company_id gin_trgm_ops);

-- Create regular index on company_name for ORDER BY
CREATE INDEX IF NOT EXISTS idx_companies_name
ON companies (company_name);

-- Add comment
COMMENT ON INDEX idx_companies_name_trgm IS 'Fast ILIKE search on company_name using trigram';
COMMENT ON INDEX idx_companies_id_trgm IS 'Fast ILIKE search on company_id using trigram';
