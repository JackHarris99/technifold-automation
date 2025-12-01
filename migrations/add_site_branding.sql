-- Site Branding Table
-- Stores logos for the 3 company brands (Technifold, Technicrease, CreaseStream)

CREATE TABLE IF NOT EXISTS site_branding (
  brand_key TEXT PRIMARY KEY,  -- 'technifold', 'technicrease', 'creasestream'
  brand_name TEXT NOT NULL,     -- Display name
  logo_url TEXT,                -- Logo URL in Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 3 company brands
INSERT INTO site_branding (brand_key, brand_name, logo_url)
VALUES
  ('technifold', 'Technifold', NULL),
  ('technicrease', 'Technicrease', NULL),
  ('creasestream', 'CreaseStream', NULL)
ON CONFLICT (brand_key) DO NOTHING;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_site_branding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_branding_updated_at
BEFORE UPDATE ON site_branding
FOR EACH ROW
EXECUTE FUNCTION update_site_branding_timestamp();

COMMENT ON TABLE site_branding IS 'Company branding logos for site header (Technifold, Technicrease, CreaseStream)';
