-- Migration: Add campaign content configuration fields
-- Description: Allow campaigns to store marketing content (machine, problems, SKUs)

-- Add columns to campaigns table for marketing content configuration
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS machine_slug TEXT,
ADD COLUMN IF NOT EXISTS problem_solution_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS curated_skus JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS preview_url TEXT;

-- Add comment
COMMENT ON COLUMN public.campaigns.machine_slug IS 'The machine featured in this campaign (e.g., heidelberg-xl106)';
COMMENT ON COLUMN public.campaigns.problem_solution_ids IS 'Array of problem_solution_id values to feature in marketing pages';
COMMENT ON COLUMN public.campaigns.curated_skus IS 'Array of product codes to showcase';
COMMENT ON COLUMN public.campaigns.preview_url IS 'Preview URL for the campaign marketing page';
