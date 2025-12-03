-- Migration: Clean machines table
-- Purpose: Remove shaft-as-model garbage, normalize type values
-- Date: 2025-02-03

-- ============================================================================
-- STEP 1: DELETE shaft-as-model rows (126 rows)
-- These have shaft sizes like "35mm", "20mm (50mm)" as the model name
-- ============================================================================

DELETE FROM public.machines
WHERE
  -- Matches patterns like: 35mm, 20mm, 25.43mm, etc.
  model ~ '^\d+(\.\d+)?mm'
  -- Matches patterns like: 20mm (36OD), 35mm (58.25mm), etc.
  OR model ~ '^\d+mm\s*\('
  -- Matches nullmm entries
  OR model LIKE '%nullmm%'
  -- Matches OD entries
  OR model LIKE '%OD)'
  -- Matches multi-shaft entries
  OR model LIKE '%multi-shaft%'
  -- Matches Direct Mount entries
  OR model = 'Direct Mount';

-- ============================================================================
-- STEP 2: NORMALIZE type values
-- Change folding_machine → folder for consistency
-- Keep: booklet_maker, perfect_binder, saddle_stitcher as-is
-- ============================================================================

UPDATE public.machines
SET type = 'folder'
WHERE type = 'folding_machine';

-- Also normalize the 'folder' entries that might exist
-- (some rows already have 'folder' from previous imports)
-- This ensures consistency

-- ============================================================================
-- VERIFICATION QUERIES (run manually to check)
-- ============================================================================

-- Check remaining types:
-- SELECT type, COUNT(*) FROM machines GROUP BY type ORDER BY type;

-- Check remaining count:
-- SELECT COUNT(*) FROM machines;

-- Should see only: folder, booklet_maker, perfect_binder, saddle_stitcher
