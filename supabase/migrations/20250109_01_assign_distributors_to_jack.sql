-- Migration: Assign all distributors to jack_harris
-- Description: All distributor companies should be owned by jack_harris (director)

UPDATE public.companies
SET account_owner = 'jack_harris'
WHERE category = 'distributor'
  AND (account_owner IS NULL OR account_owner != 'jack_harris');

-- Log the change
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % distributor companies to jack_harris ownership', updated_count;
END $$;
