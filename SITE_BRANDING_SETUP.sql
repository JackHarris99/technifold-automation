-- =====================================================
-- SITE BRANDING TABLE SETUP
-- =====================================================
-- This creates a table for your 3 company branding logos
-- (Technifold, Technicrease, CreaseStream)
-- that appear in the marketing site header.
--
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- =====================================================

-- 1. Create the site_branding table
CREATE TABLE IF NOT EXISTS site_branding (
  brand_key TEXT PRIMARY KEY,  -- 'technifold', 'technicrease', 'creasestream'
  brand_name TEXT NOT NULL,     -- Display name
  logo_url TEXT,                -- Logo URL in Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert the 3 company brands
INSERT INTO site_branding (brand_key, brand_name, logo_url)
VALUES
  ('technifold', 'Technifold', NULL),
  ('technicrease', 'Technicrease', NULL),
  ('creasestream', 'CreaseStream', NULL)
ON CONFLICT (brand_key) DO NOTHING;

-- 3. Add RLS (Row Level Security) policies
ALTER TABLE site_branding ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for marketing site)
CREATE POLICY "Public read access for site branding"
ON site_branding FOR SELECT
TO public
USING (true);

-- Allow authenticated users to update (for admin panel)
CREATE POLICY "Authenticated update access for site branding"
ON site_branding FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Verify the setup
SELECT * FROM site_branding ORDER BY brand_key;

-- =====================================================
-- EXPECTED OUTPUT:
-- brand_key     | brand_name   | logo_url | created_at | updated_at
-- --------------|--------------|----------|------------|------------
-- creasestream  | CreaseStream | NULL     | [now]      | [now]
-- technicrease  | Technicrease | NULL     | [now]      | [now]
-- technifold    | Technifold   | NULL     | [now]      | [now]
-- =====================================================
