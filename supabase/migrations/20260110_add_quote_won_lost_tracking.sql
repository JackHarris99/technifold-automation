-- Add won/lost tracking columns to quotes table
-- Allows sales reps to mark quotes as won or lost with optional reason

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS won_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS lost_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS lost_reason text;

-- Add comment for documentation
COMMENT ON COLUMN quotes.won_at IS 'Timestamp when quote was marked as won (deal closed)';
COMMENT ON COLUMN quotes.lost_at IS 'Timestamp when quote was marked as lost (deal failed)';
COMMENT ON COLUMN quotes.lost_reason IS 'Reason why quote was lost (e.g., price too high, went with competitor, timing)';
