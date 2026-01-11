-- Set all Jack Harris companies to type = 'distributor'
-- Run this in Supabase SQL Editor

-- 1. First, check which companies will be updated
SELECT
  company_id,
  company_name,
  account_owner,
  type as current_type,
  'distributor' as new_type
FROM companies
WHERE account_owner = 'jack_harris';

-- 2. Update all Jack Harris companies to distributor type
UPDATE companies
SET
  type = 'distributor',
  updated_at = NOW()
WHERE account_owner = 'jack_harris';

-- 3. Verify the update
SELECT
  company_id,
  company_name,
  account_owner,
  type
FROM companies
WHERE type = 'distributor'
ORDER BY company_name;

-- 4. Show summary
SELECT
  type,
  COUNT(*) as count
FROM companies
GROUP BY type
ORDER BY count DESC;
