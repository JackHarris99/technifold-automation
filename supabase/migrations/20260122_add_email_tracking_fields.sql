-- Add email tracking fields to campaign_sends
ALTER TABLE campaign_sends
ADD COLUMN IF NOT EXISTS resend_email_id TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for tracking
CREATE INDEX IF NOT EXISTS idx_campaign_sends_resend_email_id ON campaign_sends(resend_email_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_send_status ON campaign_sends(send_status);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign_id_status ON campaign_sends(campaign_id, send_status);
