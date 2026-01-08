-- Drop Unused Tables from Sales Visibility System
-- Created: 2026-01-08
-- Purpose: Remove action_tokens and notification_log tables (no longer needed with stateless tokens)

-- Drop action_tokens table (tokens are now stateless, no DB storage)
DROP TABLE IF EXISTS action_tokens CASCADE;

-- Drop notification_log table (audit trail not needed)
DROP TABLE IF EXISTS notification_log CASCADE;

-- Note: The following tables are KEPT and still needed:
-- - quote_notes: Internal sales notes on quotes
-- - tasks: Auto-generated and manual tasks for sales reps
-- - notification_preferences: User email settings
