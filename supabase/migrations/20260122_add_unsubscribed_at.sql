-- Add unsubscribed_at timestamp to prospect_contacts
ALTER TABLE prospect_contacts
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;

-- Add index for querying unsubscribed contacts
CREATE INDEX IF NOT EXISTS idx_prospect_contacts_marketing_status ON prospect_contacts(marketing_status);
