-- =====================================================
-- SQL QUERIES TO REGENERATE SCHEMA CSV FILES
-- Run these queries in Supabase SQL Editor
-- Then save the results as CSV files in /supabase/
-- =====================================================

-- =====================================================
-- 1. SCHEMA EXPORT (schema_export.csv)
-- Table and column definitions with data types, nullable, defaults
-- =====================================================
COPY (
  SELECT
    c.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    COALESCE(c.column_default, 'null') as column_default
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name NOT LIKE 'pg_%'
    AND c.table_name NOT LIKE 'sql_%'
  ORDER BY c.table_name, c.ordinal_position
  LIMIT 5000
) TO STDOUT WITH (FORMAT CSV, HEADER true);


-- =====================================================
-- 2. FOREIGN KEYS (foreign_keys.csv)
-- All foreign key constraints showing table relationships
-- =====================================================
COPY (
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
  ORDER BY tc.table_name, kcu.column_name
  LIMIT 5000
) TO STDOUT WITH (FORMAT CSV, HEADER true);


-- =====================================================
-- 3. PRIMARY KEYS (primary_keys.csv)
-- All primary key constraints
-- =====================================================
COPY (
  SELECT
    kcu.table_name,
    kcu.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
  ORDER BY kcu.table_name, kcu.ordinal_position
  LIMIT 5000
) TO STDOUT WITH (FORMAT CSV, HEADER true);


-- =====================================================
-- 4. INDEXES (indexes.csv)
-- All indexes including unique, btree, gin, etc.
-- =====================================================
COPY (
  SELECT
    schemaname as schema_name,
    tablename as table_name,
    indexname as index_name,
    indexdef as index_definition
  FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY tablename, indexname
  LIMIT 5000
) TO STDOUT WITH (FORMAT CSV, HEADER true);


-- =====================================================
-- 5. TRIGGERS (triggers.csv)
-- All triggers showing when they fire and what they execute
-- =====================================================
COPY (
  SELECT
    t.trigger_name,
    t.event_object_table as table_name,
    t.action_timing as when_fires,
    t.event_manipulation as on_event,
    t.action_statement as executes
  FROM information_schema.triggers t
  WHERE t.trigger_schema = 'public'
    AND t.trigger_name NOT LIKE 'pg_%'
  ORDER BY t.event_object_table, t.trigger_name
  LIMIT 5000
) TO STDOUT WITH (FORMAT CSV, HEADER true);


-- =====================================================
-- 6. RLS POLICIES (rls_policies.csv) - NEW
-- Row Level Security policies showing who can access what
-- =====================================================
COPY (
  SELECT
    schemaname as schema_name,
    tablename as table_name,
    policyname as policy_name,
    permissive as is_permissive,
    roles as applies_to_roles,
    cmd as command_type,
    qual as using_expression,
    with_check as with_check_expression
  FROM pg_policies
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname
  LIMIT 5000
) TO STDOUT WITH (FORMAT CSV, HEADER true);


-- =====================================================
-- 7. RLS STATUS (rls_status.csv) - NEW
-- Shows which tables have RLS enabled/enforced
-- =====================================================
COPY (
  SELECT
    n.nspname as schema_name,
    c.relname as table_name,
    CASE c.relrowsecurity
      WHEN true THEN 'ENABLED'
      ELSE 'DISABLED'
    END as rls_enabled,
    CASE c.relforcerowsecurity
      WHEN true THEN 'FORCED'
      ELSE 'NOT_FORCED'
    END as rls_forced
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'  -- regular tables only
    AND n.nspname = 'public'
  ORDER BY c.relname
  LIMIT 5000
) TO STDOUT WITH (FORMAT CSV, HEADER true);


-- =====================================================
-- 8. FUNCTIONS (functions.csv) - NEW
-- All custom functions and stored procedures
-- =====================================================
COPY (
  SELECT
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    CASE p.provolatile
      WHEN 'i' THEN 'IMMUTABLE'
      WHEN 's' THEN 'STABLE'
      WHEN 'v' THEN 'VOLATILE'
    END as volatility,
    CASE p.prosecdef
      WHEN true THEN 'SECURITY DEFINER'
      ELSE 'SECURITY INVOKER'
    END as security_type,
    l.lanname as language
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_language l ON l.oid = p.prolang
  WHERE n.nspname = 'public'
    AND p.prokind IN ('f', 'p')  -- functions and procedures
  ORDER BY p.proname
  LIMIT 5000
) TO STDOUT WITH (FORMAT CSV, HEADER true);


-- =====================================================
-- 9. VIEWS (views.csv) - NEW
-- All views and materialized views
-- =====================================================
COPY (
  SELECT
    table_schema as schema_name,
    table_name as view_name,
    view_definition,
    is_updatable,
    is_insertable_into
  FROM information_schema.views
  WHERE table_schema = 'public'
  ORDER BY table_name
  LIMIT 5000
) TO STDOUT WITH (FORMAT CSV, HEADER true);


-- =====================================================
-- 10. CONSTRAINTS (constraints.csv) - NEW
-- All constraints including CHECK, UNIQUE, NOT NULL
-- =====================================================
COPY (
  SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    COALESCE(cc.check_clause, '') as check_clause,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
  FROM information_schema.table_constraints tc
  LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
    AND tc.constraint_schema = cc.constraint_schema
  LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.table_schema = 'public'
    AND tc.constraint_type IN ('CHECK', 'UNIQUE')
  GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type, cc.check_clause
  ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name
  LIMIT 5000
) TO STDOUT WITH (FORMAT CSV, HEADER true);
