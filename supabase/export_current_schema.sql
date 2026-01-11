-- ============================================================================
-- Export current database schema to CSV format
-- ============================================================================
-- Run this in Supabase SQL Editor to get the current schema
-- Copy the output and replace schema_export.csv

-- Export schema in CSV format matching schema_export.csv structure
COPY (
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
  ORDER BY table_name, ordinal_position
) TO STDOUT WITH CSV HEADER;
