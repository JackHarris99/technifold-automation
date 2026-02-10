-- Email Marketing Templates System
-- Phase 1: Core template storage with placeholder support

-- Email Templates Table
-- Stores template content with targeting metadata
CREATE TABLE email_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,

  -- Template content
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  preview_text TEXT,

  -- Template targeting (for smart matching)
  target_manufacturer VARCHAR(100), -- e.g., 'muller_martini', 'heidelberg'
  target_model VARCHAR(100),        -- e.g., 'bolero', 'stahlfolder'
  target_problem VARCHAR(100),      -- e.g., 'cracking', 'misregistration'
  target_machine_type VARCHAR(50),  -- e.g., 'folder', 'stitcher'
  specificity_level INTEGER DEFAULT 0 CHECK (specificity_level BETWEEN 0 AND 100),
  -- 0=generic, 25=machine_type, 50=manufacturer, 75=model, 100=problem-specific

  -- Template metadata
  category VARCHAR(50),              -- e.g., 'product_intro', 'problem_solution', 'case_study'
  tags TEXT[],                       -- Flexible tagging for filtering

  -- Performance metrics (updated by webhook)
  sends_count INTEGER DEFAULT 0,
  opens_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,

  -- Status and timestamps
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template Send History
-- Tracks which templates have been sent to which contacts (prevent duplicates)
CREATE TABLE template_send_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES email_templates(template_id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(contact_id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES email_campaigns(campaign_id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent sending same template to same contact twice
  UNIQUE(template_id, contact_id)
);

-- Daily Send Queue
-- Generated daily, processed throughout the day
CREATE TABLE daily_send_queue (
  queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(contact_id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES email_templates(template_id) ON DELETE CASCADE,

  -- Queue metadata
  queue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  priority INTEGER DEFAULT 50, -- 0-100, higher = more urgent
  match_score NUMERIC(5,2),    -- How well template matches contact (0-100)

  -- Sending domain assignment (for rate limiting)
  sending_domain VARCHAR(100),

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, skipped
  sent_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate queue entries
  UNIQUE(contact_id, queue_date, template_id)
);

-- Indexes for performance
CREATE INDEX idx_email_templates_active ON email_templates(active) WHERE active = true;
CREATE INDEX idx_email_templates_targeting ON email_templates(target_manufacturer, target_model, target_problem);
CREATE INDEX idx_email_templates_specificity ON email_templates(specificity_level DESC);
CREATE INDEX idx_email_templates_performance ON email_templates(clicks_count DESC, opens_count DESC);

CREATE INDEX idx_template_send_history_contact ON template_send_history(contact_id);
CREATE INDEX idx_template_send_history_template ON template_send_history(template_id);
CREATE INDEX idx_template_send_history_sent_at ON template_send_history(sent_at);

CREATE INDEX idx_daily_send_queue_date_status ON daily_send_queue(queue_date, status);
CREATE INDEX idx_daily_send_queue_contact ON daily_send_queue(contact_id);
CREATE INDEX idx_daily_send_queue_priority ON daily_send_queue(priority DESC);
CREATE INDEX idx_daily_send_queue_domain ON daily_send_queue(sending_domain, status);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_email_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_template_timestamp();

-- Grant permissions (adjust based on your RLS policies)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON email_templates TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON template_send_history TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON daily_send_queue TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE email_templates IS 'Email marketing templates with targeting metadata and performance tracking';
COMMENT ON TABLE template_send_history IS 'Tracks which templates have been sent to which contacts to prevent duplicates';
COMMENT ON TABLE daily_send_queue IS 'Daily generated queue of emails to send, processed throughout the day';
