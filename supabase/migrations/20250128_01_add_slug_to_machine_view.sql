-- Recreate v_machine_solution_problem_full with copy fallback chain and curated_skus
-- Each row = ONE CARD = one (machine, solution, problem) combination
-- CRITICAL: Do NOT group by solution - each problem gets its own card

DROP VIEW IF EXISTS public.v_machine_solution_problem_full;

CREATE OR REPLACE VIEW public.v_machine_solution_problem_full AS
SELECT
  -- Machine info
  m.machine_id,
  m.brand AS machine_brand,
  m.model AS machine_model,
  m.display_name AS machine_display_name,
  m.type AS machine_type,
  m.slug AS machine_slug,

  -- Solution info
  s.solution_id,
  s.name AS solution_name,
  s.core_benefit AS solution_core_benefit,
  s.long_description AS solution_long_description,
  s.media_urls AS solution_media_urls,

  -- Problem info
  p.problem_id,
  p.title AS problem_title,
  p.description AS problem_description,

  -- COPY FALLBACK CHAIN (Source of Truth)
  COALESCE(
    msp.problem_solution_copy,
    sp.problem_solution_copy,
    CONCAT(sp.pitch_headline, E'\n\n', sp.pitch_detail)
  ) AS resolved_copy,

  -- Individual copy fields (for editing/debugging)
  msp.problem_solution_copy AS msp_copy_override,
  sp.problem_solution_copy AS sp_copy_base,

  -- Legacy fields (backward compat during transition)
  sp.pitch_headline,
  sp.pitch_detail,
  sp.action_cta,

  -- SKU CURATION (Source of Truth)
  msp.curated_skus,

  -- Ranking
  sp.relevance_rank AS pitch_relevance_rank,
  ms.relevance_rank AS machine_solution_rank,
  ms.machine_solution_id

FROM public.machines m
INNER JOIN public.machine_solution ms ON m.machine_id = ms.machine_id
INNER JOIN public.solutions s ON ms.solution_id = s.solution_id
INNER JOIN public.machine_solution_problem msp ON ms.machine_solution_id = msp.machine_solution_id
INNER JOIN public.problems p ON msp.problem_id = p.problem_id
INNER JOIN public.solution_problem sp ON sp.solution_id = s.solution_id AND sp.problem_id = p.problem_id
WHERE s.active = true
ORDER BY m.machine_id, ms.relevance_rank, sp.relevance_rank;
