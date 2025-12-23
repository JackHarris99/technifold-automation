-- ============================================================================
-- SUPABASE SCHEMA EXPORT QUERIES
-- ============================================================================
-- Run each query in Supabase SQL Editor, then export results as CSV
-- Save to the corresponding file in /supabase folder
-- ============================================================================

-- ============================================================================
-- 1. SCHEMA EXPORT (save as: supabase/schema_export.csv)
-- ============================================================================
-- All columns in all tables with their data types and constraints
-- ============================================================================

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

-- ============================================================================
-- 2. PRIMARY KEYS (save as: supabase/primary_keys.csv)
-- ============================================================================
-- All primary key columns for each table
-- ============================================================================

SELECT
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- ============================================================================
-- 3. FOREIGN KEYS (save as: supabase/foreign_keys.csv)
-- ============================================================================
-- All foreign key relationships between tables
-- ============================================================================

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- 4. INDEXES (save as: supabase/indexes.csv)
-- ============================================================================
-- All indexes on all tables
-- ============================================================================

SELECT
  schemaname AS schema_name,
  tablename AS table_name,
  indexname AS index_name,
  indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- BONUS: TRIGGERS (save as: supabase/triggers.csv - NEW FILE)
-- ============================================================================
-- All triggers on all tables (including your fact table trigger!)
-- ============================================================================

SELECT
  trigger_name,
  event_object_table AS table_name,
  action_timing AS when_fires,
  event_manipulation AS on_event,
  action_statement AS executes
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- BONUS: FUNCTIONS (save as: supabase/functions.csv - NEW FILE)
-- ============================================================================
-- All custom functions (including trigger functions!)
-- ============================================================================

SELECT
  routine_name AS function_name,
  routine_type AS type,
  data_type AS return_type,
  routine_definition AS definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;

-- ============================================================================
-- INSTRUCTIONS:
-- ============================================================================
-- 1. Open Supabase SQL Editor
-- 2. Run each query one at a time
-- 3. Click "Export" or "Download" to save results as CSV
-- 4. Replace the corresponding file in /supabase folder
-- 5. Commit the updated files to git
--
-- This ensures your local schema documentation stays in sync with Supabase!
-- ============================================================================
