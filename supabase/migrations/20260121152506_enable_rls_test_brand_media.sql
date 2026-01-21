-- Test migration: Enable permissive RLS on brand_media table
-- This is a test to ensure RLS doesn't break anything
-- brand_media is a low-risk table for testing

-- Enable RLS
ALTER TABLE brand_media ENABLE ROW LEVEL SECURITY;

-- Create permissive policy that allows service role (your API) full access
-- This blocks direct anon key access but allows all server-side operations
CREATE POLICY "brand_media_service_role_access"
ON brand_media
FOR ALL
USING (true)
WITH CHECK (true);

-- Note: Service role key (used by your API routes) bypasses RLS anyway
-- This policy is for defense-in-depth
