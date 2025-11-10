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
  psm.id,
  psm.machine_id,
  psm.problem_solution_id,
  m.brand,
  m.model,
  m.display_name,
  m.slug as machine_slug,
  ps.solution_name,
  ps.title,
  ps.problem_description,
  ps.card_preview_copy,
  ps.full_solution_copy,
  ps.action_cta,
  ps.active,
  ps.slug,
  ps.is_hero,
  ps.relevance_rank as generic_relevance_rank,
  psm.card_preview_copy as override_card_copy,
  psm.full_solution_copy as override_full_copy,
  psm.action_cta as override_cta,
  psm.curated_skus,
  psm.relevance_rank as machine_relevance_rank,
  psm.is_primary_pitch,
  COALESCE(psm.card_preview_copy, ps.card_preview_copy) as resolved_card_copy,
  COALESCE(psm.full_solution_copy, ps.full_solution_copy) as resolved_full_copy,
  COALESCE(psm.action_cta, ps.action_cta) as resolved_cta,
  COALESCE(psm.image_url, ps.image_url) as resolved_image_url,
  COALESCE(psm.before_image_url, ps.before_image_url) as resolved_before_image_url,
  COALESCE(psm.after_image_url, ps.after_image_url) as resolved_after_image_url,
  COALESCE(psm.product_image_url, ps.product_image_url) as resolved_product_image_url,
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
ORDER BY psm.relevance_rank ASC NULLS LAST;

COMMENT ON VIEW v_problem_solution_machine IS 'Unified view of problem/solution data with machine-specific overrides. Uses COALESCE to prioritize machine-specific values over generic values.';
