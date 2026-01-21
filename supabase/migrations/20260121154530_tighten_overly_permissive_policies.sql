-- Remove overly permissive RLS policies that allow unrestricted access
-- These policies were allowing anyone to insert/update without restrictions
-- Existing restrictive policies remain for Supabase auth users (if ever implemented)
-- Service role (API routes) continues to work as it bypasses RLS

-- Drop overly permissive INSERT policy on activity_log
-- (Keeps activity_log_select_directors for directors)
DROP POLICY IF EXISTS "activity_log_insert_all" ON activity_log;

-- Drop overly permissive INSERT policy on engagement_events
-- (Keeps engagement_events_select_all_staff and engagement_events_delete_directors)
DROP POLICY IF EXISTS "engagement_events_insert_all" ON engagement_events;

-- Drop overly permissive UPDATE policy on site_branding
-- (Keeps "Public read access for site branding" for SELECT)
DROP POLICY IF EXISTS "Authenticated update access for site branding" ON site_branding;

-- Drop overly permissive ALL policy on subscriptions
-- (Keeps subscriptions_select_all_staff, subscriptions_modify_all_staff, subscriptions_select_distributors)
DROP POLICY IF EXISTS "Admin full access to subscriptions" ON subscriptions;

-- Note: Service role key (used by your API routes) bypasses ALL RLS policies
-- This change only blocks direct database access via anon key
-- Your application functionality is completely unaffected
