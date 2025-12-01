-- Migration: NEW Content Blocks System with Relevance Tags
-- Replaces the OLD problem_solution_blocks architecture (which made the site look shite)
--
-- PHILOSOPHY:
-- - Content blocks are CREATIVE UNITS (intro, benefit, testimonial, stat, image)
-- - Relevance tags control WHERE they appear (tri-creaser, MBO, folder, etc.)
-- - Dynamic assembly based on customer's machine
-- - Scalable, flexible, world-class

-- Drop OLD views that reference problem_solution architecture
DROP VIEW IF EXISTS v_problem_solution_content_blocks CASCADE;
DROP VIEW IF EXISTS v_problem_solution_machine_content_blocks CASCADE;

-- NEW: Content Blocks Table
CREATE TABLE IF NOT EXISTS public.content_blocks (
  block_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Block metadata
  block_type TEXT NOT NULL, -- 'intro', 'benefit', 'stat', 'testimonial', 'image', 'hierarchy', 'tech_spec'
  solution_slug TEXT, -- 'tri-creaser', 'spine-creaser', NULL for generic Technifold content

  -- Relevance tags (JSONB array for flexible matching)
  -- Examples:
  --   ["tri-creaser"] = shows on all tri-creaser content
  --   ["tri-creaser", "MBO"] = only on MBO + tri-creaser
  --   ["tri-creaser", "MBO", "K88"] = only on MBO K88 + tri-creaser
  --   ["folder"] = all folder machines
  --   ["MBO"] = all MBO content
  relevance_tags JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Content (JSONB for flexibility)
  -- Structure varies by block_type:
  --   intro: {text, heading}
  --   benefit: {title, description, icon, metric}
  --   stat: {value, label, context}
  --   testimonial: {quote, customer, company, location, role}
  --   image: {url, alt, caption}
  --   hierarchy: {products: [{name, usp, features}]}
  content JSONB NOT NULL,

  -- Display control
  priority INTEGER DEFAULT 0, -- Higher = shown first
  active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_content_blocks_relevance ON public.content_blocks USING GIN (relevance_tags);
CREATE INDEX idx_content_blocks_solution ON public.content_blocks (solution_slug) WHERE solution_slug IS NOT NULL;
CREATE INDEX idx_content_blocks_type ON public.content_blocks (block_type);
CREATE INDEX idx_content_blocks_active ON public.content_blocks (active) WHERE active = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_content_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_content_blocks_updated_at();

-- Comments
COMMENT ON TABLE public.content_blocks IS 'Dynamic content blocks with relevance-based assembly - the RIGHT way to build marketing content';
COMMENT ON COLUMN public.content_blocks.relevance_tags IS 'JSONB array of tags controlling where this block appears (e.g., ["tri-creaser", "MBO", "folder"])';
COMMENT ON COLUMN public.content_blocks.content IS 'JSONB content structure varies by block_type - flexible and creative';
COMMENT ON COLUMN public.content_blocks.priority IS 'Display order - higher numbers shown first';

-- NEW: Helper function to query content blocks by relevance
-- Usage: SELECT * FROM get_content_blocks_for_machine('tri-creaser', 'MBO', 'K88', 'folder')
CREATE OR REPLACE FUNCTION get_content_blocks_for_machine(
  p_solution_slug TEXT,
  p_brand TEXT DEFAULT NULL,
  p_model TEXT DEFAULT NULL,
  p_machine_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  block_id UUID,
  block_type TEXT,
  solution_slug TEXT,
  relevance_tags JSONB,
  content JSONB,
  priority INTEGER,
  relevance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cb.block_id,
    cb.block_type,
    cb.solution_slug,
    cb.relevance_tags,
    cb.content,
    cb.priority,
    -- Calculate relevance score (more specific matches = higher score)
    (
      CASE WHEN cb.relevance_tags ? p_model THEN 4 ELSE 0 END +
      CASE WHEN cb.relevance_tags ? p_brand THEN 3 ELSE 0 END +
      CASE WHEN cb.relevance_tags ? p_machine_type THEN 2 ELSE 0 END +
      CASE WHEN cb.relevance_tags ? p_solution_slug THEN 1 ELSE 0 END
    )::INTEGER AS relevance_score
  FROM public.content_blocks cb
  WHERE
    cb.active = true
    AND (
      cb.solution_slug = p_solution_slug OR cb.solution_slug IS NULL -- Generic Technifold content
    )
    AND (
      -- Match any of the relevance tags
      cb.relevance_tags ?| ARRAY[p_solution_slug, p_brand, p_model, p_machine_type]
      OR cb.relevance_tags = '[]'::jsonb -- Generic blocks with no specific tags
    )
  ORDER BY
    relevance_score DESC, -- Most specific first
    cb.priority DESC,     -- Then by priority
    cb.created_at ASC;    -- Then by creation order
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_content_blocks_for_machine IS 'Get content blocks for a specific machine with relevance scoring';

-- NEW: Function to get combined content for multiple solutions (multi-product pages)
-- Usage: SELECT * FROM get_content_blocks_for_solutions(ARRAY['tri-creaser', 'multi-tool'], 'MBO', 'K88', 'folder')
CREATE OR REPLACE FUNCTION get_content_blocks_for_solutions(
  p_solution_slugs TEXT[],
  p_brand TEXT DEFAULT NULL,
  p_model TEXT DEFAULT NULL,
  p_machine_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  block_id UUID,
  block_type TEXT,
  solution_slug TEXT,
  relevance_tags JSONB,
  content JSONB,
  priority INTEGER,
  relevance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cb.block_id,
    cb.block_type,
    cb.solution_slug,
    cb.relevance_tags,
    cb.content,
    cb.priority,
    -- Calculate relevance score
    (
      CASE WHEN cb.relevance_tags ? p_model THEN 4 ELSE 0 END +
      CASE WHEN cb.relevance_tags ? p_brand THEN 3 ELSE 0 END +
      CASE WHEN cb.relevance_tags ? p_machine_type THEN 2 ELSE 0 END +
      CASE WHEN cb.relevance_tags ?| p_solution_slugs THEN 1 ELSE 0 END
    )::INTEGER AS relevance_score
  FROM public.content_blocks cb
  WHERE
    cb.active = true
    AND (
      cb.solution_slug = ANY(p_solution_slugs) OR cb.solution_slug IS NULL
    )
    AND (
      cb.relevance_tags ?| ARRAY[p_brand, p_model, p_machine_type] || p_solution_slugs
      OR cb.relevance_tags = '[]'::jsonb
    )
  ORDER BY
    cb.solution_slug, -- Group by solution first
    relevance_score DESC,
    cb.priority DESC,
    cb.created_at ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_content_blocks_for_solutions IS 'Get content blocks for multiple solutions (multi-product machine pages)';

-- Example data structure for reference (not inserted, just documentation)
/*
-- Intro block example:
INSERT INTO content_blocks (block_type, solution_slug, relevance_tags, content, priority) VALUES
('intro', 'tri-creaser', '["tri-creaser", "folder"]',
 '{"heading": "Transform Your Folding Operation", "text": "The world''s first rotary creasing solution..."}',
 100);

-- Benefit block example:
INSERT INTO content_blocks (block_type, solution_slug, relevance_tags, content, priority) VALUES
('benefit', 'tri-creaser', '["tri-creaser"]',
 '{"title": "Zero Fibre Cracking", "description": "100% elimination of cracking on coated stock", "icon": "✨", "metric": "100%"}',
 90);

-- Testimonial block example (tri-creaser on MBO only):
INSERT INTO content_blocks (block_type, solution_slug, relevance_tags, content, priority) VALUES
('testimonial', 'tri-creaser', '["tri-creaser", "MBO"]',
 '{"quote": "Easy setup on our MBO folders...", "customer": "John Smith", "company": "Print Co", "location": "UK"}',
 50);

-- Stat block example:
INSERT INTO content_blocks (block_type, solution_slug, relevance_tags, content, priority) VALUES
('stat', 'tri-creaser', '["tri-creaser"]',
 '{"value": "30,000+", "label": "Companies Worldwide", "context": "Using Tri-Creaser technology"}',
 80);
*/

-- Grant permissions
GRANT SELECT ON public.content_blocks TO anon, authenticated;
GRANT ALL ON public.content_blocks TO service_role;
