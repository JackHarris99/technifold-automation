# Schema CSV Regeneration Guide

## Overview
This directory contains CSV exports of the database schema. These files document:
- Table structures and column definitions
- Foreign key relationships
- Primary keys and indexes
- Triggers and functions
- RLS policies and constraints

## How to Regenerate the CSV Files

### Method 1: Using Supabase SQL Editor (RECOMMENDED)

1. Open Supabase Dashboard → SQL Editor
2. Run each query from `regenerate_schema_csvs.sql` **one at a time**
3. Click "Download CSV" button for each result
4. Save the CSV files with these exact names:

```
schema_export.csv         - Table and column definitions
foreign_keys.csv          - Foreign key relationships
primary_keys.csv          - Primary key constraints
indexes.csv               - All indexes
triggers.csv              - All triggers
rls_policies.csv          - RLS policies (NEW)
rls_status.csv            - RLS enabled/disabled status (NEW)
functions.csv             - Custom functions and procedures (NEW)
views.csv                 - Views and materialized views (NEW)
constraints.csv           - CHECK and UNIQUE constraints (NEW)
```

### Method 2: Using psql Command Line

If you have direct database access via psql:

```bash
# Set your connection string
export DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/postgres"

# Run the regeneration script
psql $DATABASE_URL -f regenerate_schema_csvs.sql > /dev/null

# Files will be output to stdout, you'll need to redirect each query separately
```

### Method 3: Using Supabase CLI

```bash
# From project root
supabase db dump --schema public > supabase/full_schema_dump.sql

# Then run individual queries to generate CSVs
supabase db execute -f supabase/regenerate_schema_csvs.sql
```

## What Each File Contains

### Original Files (Must Keep Updated)

1. **schema_export.csv**
   - Every table and column in the database
   - Data types (text, uuid, timestamp, etc.)
   - Nullable (YES/NO)
   - Default values
   - **Purpose**: Quick reference for table structure

2. **foreign_keys.csv**
   - All foreign key relationships
   - Which columns reference which tables
   - **Purpose**: Understand table dependencies

3. **primary_keys.csv**
   - Primary key for each table
   - Composite keys shown as multiple rows
   - **Purpose**: Identify unique record identifiers

4. **indexes.csv**
   - All indexes (btree, gin, unique, etc.)
   - Full CREATE INDEX statements
   - **Purpose**: Query optimization reference

5. **triggers.csv**
   - All database triggers
   - When they fire (BEFORE/AFTER)
   - What events trigger them (INSERT/UPDATE/DELETE)
   - What functions they execute
   - **Purpose**: Understand automated database behavior

### New Files (Added 2025-01-15)

6. **rls_policies.csv**
   - All Row Level Security policies
   - Which roles they apply to
   - USING expressions (row visibility)
   - WITH CHECK expressions (row modification rules)
   - **Purpose**: Security and access control documentation

7. **rls_status.csv**
   - Which tables have RLS enabled
   - Which tables have RLS forced
   - **Purpose**: Quick RLS status overview

8. **functions.csv**
   - Custom PostgreSQL functions
   - Arguments and return types
   - Volatility (IMMUTABLE/STABLE/VOLATILE)
   - Security type (DEFINER/INVOKER)
   - **Purpose**: Stored procedure documentation

9. **views.csv**
   - All views and materialized views
   - View definitions (SQL)
   - Whether updatable/insertable
   - **Purpose**: Virtual table documentation

10. **constraints.csv**
    - CHECK constraints (validation rules)
    - UNIQUE constraints
    - Constraint expressions
    - **Purpose**: Data validation rules

## When to Regenerate

Regenerate these CSV files whenever you:
- Add/modify/delete tables
- Add/modify/delete columns
- Change data types
- Add/modify foreign keys or indexes
- Add/modify triggers
- Add/modify RLS policies
- Add/modify functions or views
- Add/modify constraints

## Why This Matters

1. **Schema Documentation**: These files serve as human-readable schema documentation
2. **Diff Tracking**: Git diffs show exactly what changed in the database schema
3. **AI Context**: Claude can read these CSVs to understand the current schema without querying the database
4. **Schema Comparison**: Compare local development schema vs production
5. **Migration Validation**: Verify migrations applied correctly

## Integration with Development

When you run migrations:

```bash
# After running migrations
supabase db push

# Regenerate schema CSVs to capture changes
# (Run queries from regenerate_schema_csvs.sql)

# Commit changes
git add supabase/*.csv
git commit -m "Update schema CSVs after [migration name]"
```

## Current Schema Stats (as of last regeneration)

- Tables: ~45
- Columns: ~400+
- Foreign Keys: ~60+
- Indexes: ~150+
- Triggers: ~20+
- RLS Policies: TBD (run rls_policies.csv to see)
- Functions: TBD (run functions.csv to see)
- Views: TBD (run views.csv to see)

---

**Last Updated**: 2025-01-15
**Updated By**: Claude Sonnet 4.5
