-- CSV Processing Jobs Table
-- Tracks uploaded CSVs and their processing status

CREATE TABLE IF NOT EXISTS csv_processing_jobs (
  job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  source TEXT, -- 'trade_show_2024', 'purchased_list_jan', etc.
  status TEXT DEFAULT 'uploaded', -- uploaded, processing, ready_for_review, approved, rejected, imported

  -- File info
  total_rows INTEGER DEFAULT 0,

  -- Processing results
  valid_rows INTEGER DEFAULT 0,
  duplicate_emails INTEGER DEFAULT 0,
  invalid_emails INTEGER DEFAULT 0,
  existing_customers INTEGER DEFAULT 0,
  existing_prospects INTEGER DEFAULT 0,

  -- Cleaned data (JSON array of prospect records ready for import)
  cleaned_data JSONB DEFAULT '[]'::jsonb,

  -- Issues found
  issues JSONB DEFAULT '[]'::jsonb,

  -- Import tracking
  imported_count INTEGER DEFAULT 0,
  imported_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID -- admin user who approved/rejected
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_csv_jobs_status ON csv_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_csv_jobs_created ON csv_processing_jobs(created_at DESC);
