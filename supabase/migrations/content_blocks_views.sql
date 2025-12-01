-- View: Get all content blocks for a problem/solution (generic level)
-- Includes block details and display order
CREATE OR REPLACE VIEW v_problem_solution_content_blocks AS
SELECT
  psb.problem_solution_id,
  psb.display_order,
  psb.active as link_active,
  scb.block_id,
  scb.block_type,
  scb.title,
  scb.content,
  scb.icon,
  scb.active as block_active
FROM problem_solution_blocks psb
JOIN solution_content_blocks scb ON psb.block_id = scb.block_id
WHERE psb.active = true AND scb.active = true
ORDER BY psb.display_order ASC;

-- View: Get all content blocks for a problem/solution/machine combination
-- Includes machine-specific overrides
CREATE OR REPLACE VIEW v_problem_solution_machine_content_blocks AS
SELECT
  psmb.problem_solution_id,
  psmb.machine_id,
  psmb.display_order,
  psmb.active as link_active,
  psmb.override_content,
  scb.block_id,
  scb.block_type,
  scb.title,
  -- Use override content if available, otherwise use generic content
  COALESCE(psmb.override_content, scb.content) as resolved_content,
  scb.content as original_content,
  scb.icon,
  scb.active as block_active,
  -- Flag to show if this is an override
  (psmb.override_content IS NOT NULL) as is_override
FROM problem_solution_machine_blocks psmb
JOIN solution_content_blocks scb ON psmb.block_id = scb.block_id
WHERE psmb.active = true AND scb.active = true
ORDER BY psmb.display_order ASC;

COMMENT ON VIEW v_problem_solution_content_blocks IS 'Generic content blocks for problem/solutions';
COMMENT ON VIEW v_problem_solution_machine_content_blocks IS 'Machine-specific content blocks with overrides';
