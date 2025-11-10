/**
 * Migration: Add before/after/product images to problem_solution tables
 *
 * Adds 3 new image columns:
 * - before_image_url: Shows the problem BEFORE using Technifold solution
 * - after_image_url: Shows the result AFTER using Technifold solution
 * - product_image_url: Pack shot/studio shot of the actual Technifold tool
 *
 * These are added to:
 * 1. problem_solution (generic images)
 * 2. problem_solution_machine (machine-specific overrides)
 * 3. v_problem_solution_machine (view with COALESCE fallback)
 */

-- Step 1: Add columns to problem_solution table
ALTER TABLE problem_solution
ADD COLUMN IF NOT EXISTS before_image_url TEXT,
ADD COLUMN IF NOT EXISTS after_image_url TEXT,
ADD COLUMN IF NOT EXISTS product_image_url TEXT;

-- Step 2: Add columns to problem_solution_machine table
ALTER TABLE problem_solution_machine
ADD COLUMN IF NOT EXISTS before_image_url TEXT,
ADD COLUMN IF NOT EXISTS after_image_url TEXT,
ADD COLUMN IF NOT EXISTS product_image_url TEXT;

-- Step 3: Drop and recreate the view with new image columns
DROP VIEW IF EXISTS v_problem_solution_machine;

CREATE VIEW v_problem_solution_machine AS
SELECT
  -- IDs
  psm.id,
  psm.machine_id,
  psm.problem_solution_id,

  -- Machine info
  m.brand,
  m.model,
  m.display_name,
  m.slug as machine_slug,

  -- Base problem_solution data
  ps.solution_name,
  ps.title,
  ps.subtitle,
  ps.problem_description,
  ps.marketing_copy,
  ps.card_copy,
  ps.full_solution_copy,
  ps.cta_text,
  ps.active,

  -- Machine-specific overrides (if set)
  psm.marketing_copy as override_copy,
  psm.title as override_title,
  psm.subtitle as override_subtitle,
  psm.problem_description as override_problem_description,
  psm.card_copy as override_card_copy,
  psm.full_solution_copy as override_full_solution_copy,
  psm.cta_text as override_cta_text,
  psm.curated_skus,
  psm.machine_relevance_rank,

  -- Resolved text fields (machine-specific first, then generic fallback)
  COALESCE(psm.marketing_copy, ps.marketing_copy) as resolved_copy,
  COALESCE(psm.title, ps.title) as resolved_title,
  COALESCE(psm.subtitle, ps.subtitle) as resolved_subtitle,
  COALESCE(psm.problem_description, ps.problem_description) as resolved_problem_description,
  COALESCE(psm.card_copy, ps.card_copy) as resolved_card_copy,
  COALESCE(psm.full_solution_copy, ps.full_solution_copy) as resolved_full_copy,
  COALESCE(psm.cta_text, ps.cta_text) as resolved_cta,

  -- Resolved image fields (machine-specific first, then generic fallback)
  COALESCE(psm.image_url, ps.image_url) as resolved_image_url,
  COALESCE(psm.before_image_url, ps.before_image_url) as resolved_before_image_url,
  COALESCE(psm.after_image_url, ps.after_image_url) as resolved_after_image_url,
  COALESCE(psm.product_image_url, ps.product_image_url) as resolved_product_image_url,

  -- Base image URLs (for reference)
  ps.image_url as generic_image_url,
  ps.before_image_url as generic_before_image_url,
  ps.after_image_url as generic_after_image_url,
  ps.product_image_url as generic_product_image_url,

  psm.image_url as machine_image_url,
  psm.before_image_url as machine_before_image_url,
  psm.after_image_url as machine_after_image_url,
  psm.product_image_url as machine_product_image_url

FROM problem_solution_machine psm
INNER JOIN problem_solution ps ON psm.problem_solution_id = ps.id
INNER JOIN machines m ON psm.machine_id = m.machine_id
WHERE ps.active = true
ORDER BY psm.machine_relevance_rank ASC NULLS LAST;

-- Add helpful comment
COMMENT ON VIEW v_problem_solution_machine IS 'Unified view of problem/solution data with machine-specific overrides. Uses COALESCE to prioritize machine-specific values over generic values.';
