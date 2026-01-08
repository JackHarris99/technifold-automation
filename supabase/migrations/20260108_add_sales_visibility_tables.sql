-- Sales Visibility System Tables
-- Created: 2026-01-08
-- Purpose: Quote notes, tasks, notifications, and tokenized actions

-- ============================================================================
-- 1. QUOTE NOTES
-- Internal notes that sales reps can add to quotes
-- ============================================================================
CREATE TABLE IF NOT EXISTS quote_notes (
  note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(quote_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_notes_quote_id ON quote_notes(quote_id);
CREATE INDEX idx_quote_notes_created_at ON quote_notes(created_at DESC);

-- ============================================================================
-- 2. TASKS
-- Auto-generated and manual tasks for sales reps
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  task_type TEXT NOT NULL, -- 'quote_follow_up', 'trial_ending', 'payment_chase', 'reorder', 'custom'
  priority INTEGER DEFAULT 50, -- Higher = more urgent (0-100)
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'dismissed'
  title TEXT NOT NULL,
  description TEXT,

  -- Related entities
  company_id TEXT,
  contact_id TEXT,
  quote_id UUID REFERENCES quotes(quote_id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(invoice_id) ON DELETE CASCADE,
  subscription_id UUID,

  -- Metadata
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  auto_generated BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_tasks_quote_id ON tasks(quote_id);

-- ============================================================================
-- 3. NOTIFICATION PREFERENCES
-- User settings for email notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY,

  -- Instant notifications
  notify_quote_viewed BOOLEAN DEFAULT TRUE,
  notify_quote_accepted BOOLEAN DEFAULT TRUE,
  notify_invoice_paid BOOLEAN DEFAULT TRUE,
  notify_trial_ending BOOLEAN DEFAULT TRUE,

  -- Daily digest
  daily_digest_enabled BOOLEAN DEFAULT TRUE,
  daily_digest_time TIME DEFAULT '09:00:00',

  -- Weekly summary
  weekly_summary_enabled BOOLEAN DEFAULT TRUE,
  weekly_summary_day INTEGER DEFAULT 5, -- Friday
  weekly_summary_time TIME DEFAULT '17:00:00',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. ACTION TOKENS
-- Tokenized magic links for quick actions from emails
-- ============================================================================
CREATE TABLE IF NOT EXISTS action_tokens (
  token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of the token
  user_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'log_call', 'add_note', 'send_followup', 'view_quote', etc.

  -- Context
  quote_id UUID REFERENCES quotes(quote_id) ON DELETE CASCADE,
  company_id TEXT,
  contact_id TEXT,
  metadata JSONB,

  -- Security
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  single_use BOOLEAN DEFAULT FALSE,
  ip_address TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_action_tokens_hash ON action_tokens(token_hash);
CREATE INDEX idx_action_tokens_user_id ON action_tokens(user_id);
CREATE INDEX idx_action_tokens_expires_at ON action_tokens(expires_at);

-- ============================================================================
-- 5. NOTIFICATION LOG
-- Track all notifications sent (for debugging and analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_log (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'instant', 'daily_digest', 'weekly_summary'
  event_type TEXT NOT NULL, -- 'quote_viewed', 'trial_ending', etc.

  -- Related entities
  company_id TEXT,
  quote_id UUID,
  invoice_id UUID,

  -- Email details
  email_subject TEXT,
  email_sent_at TIMESTAMPTZ,
  email_opened_at TIMESTAMPTZ,
  email_clicked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX idx_notification_log_created_at ON notification_log(created_at DESC);

-- ============================================================================
-- 6. UPDATE TRIGGERS
-- Auto-update updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_notes_updated_at
  BEFORE UPDATE ON quote_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE quote_notes IS 'Internal notes that sales reps can add to quotes';
COMMENT ON TABLE tasks IS 'Auto-generated and manual tasks for sales reps';
COMMENT ON TABLE notification_preferences IS 'User email notification settings';
COMMENT ON TABLE action_tokens IS 'Tokenized magic links for quick actions from emails';
COMMENT ON TABLE notification_log IS 'Audit log of all notifications sent';
