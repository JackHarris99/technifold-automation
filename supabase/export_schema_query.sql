-- ============================================================================
-- Query to export schema (for Supabase Dashboard SQL Editor)
-- ============================================================================
-- This version works in Supabase Dashboard
-- Copy the results and save as schema_export.csv

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT LIKE 'sql_%'
ORDER BY table_name, ordinal_position;
