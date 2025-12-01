-- Migration: New Compatibility Architecture
-- Purpose: Bulletproof, scalable tool→machine compatibility system
-- Replaces: tool_brand_compatibility (JSONB matching)
-- Date: 2025-01-30

-- ============================================================================
-- 1. SHAFT CONFIGURATIONS (Normalized, Reusable)
-- ============================================================================

CREATE TABLE shaft_configurations (
  id SERIAL PRIMARY KEY,
  config_data JSONB NOT NULL,
  display_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for JSONB queries (if needed)
CREATE INDEX idx_shaft_configurations_config_data ON shaft_configurations USING GIN (config_data);

-- Unique constraint to prevent duplicate configs
CREATE UNIQUE INDEX idx_shaft_configurations_unique_config ON shaft_configurations ((config_data::text));

COMMENT ON TABLE shaft_configurations IS 'Reusable shaft configurations. Handles simple (shaft+OD), complex (top/bottom), and male/female OD patterns.';
COMMENT ON COLUMN shaft_configurations.config_data IS 'JSONB: {shaft_size_mm: 35, outer_diameter_mm: 58} or complex structures';
COMMENT ON COLUMN shaft_configurations.display_name IS 'Human-readable: "35mm (58mm OD)" or "Top: 35mm, Bottom: 40mm"';

-- ============================================================================
-- 2. BRAND → SHAFT CONFIGURATIONS (Which configs exist per brand)
-- ============================================================================

CREATE TABLE brand_shaft_configurations (
  brand TEXT NOT NULL,
  shaft_config_id INTEGER NOT NULL REFERENCES shaft_configurations(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (brand, shaft_config_id)
);

CREATE INDEX idx_brand_shaft_configurations_brand ON brand_shaft_configurations(brand);
CREATE INDEX idx_brand_shaft_configurations_config ON brand_shaft_configurations(shaft_config_id);

COMMENT ON TABLE brand_shaft_configurations IS 'Defines which shaft configs exist for each brand. MBO has 4 configs, Heidelberg has 4 different configs, etc.';
COMMENT ON COLUMN brand_shaft_configurations.notes IS 'Optional: "Most common for K-series" or "Legacy models only"';

-- ============================================================================
-- 3. PRODUCT COMPATIBILITY (Unified table for all machine types)
-- ============================================================================

CREATE TABLE product_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL REFERENCES products(product_code) ON DELETE CASCADE,
  machine_type TEXT NOT NULL CHECK (machine_type IN ('folder', 'binder', 'stitcher', 'other')),

  -- For brand-level compatibility (folders, before specific model known):
  brand TEXT,
  shaft_config_id INTEGER REFERENCES shaft_configurations(id) ON DELETE CASCADE,

  -- For model-level compatibility (learned over time, or binders/stitchers):
  machine_id UUID REFERENCES machines(machine_id) ON DELETE CASCADE,

  -- For direct model name matching (alternative to machine_id):
  model TEXT,

  -- Metadata:
  compatibility_source TEXT DEFAULT 'manual' CHECK (compatibility_source IN ('manual', 'computed', 'confirmed_by_order', 'inferred')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate entries (complex constraint to allow NULL values)
  UNIQUE NULLS NOT DISTINCT (product_code, machine_type, brand, shaft_config_id, machine_id, model)
);

-- Indexes for common queries
CREATE INDEX idx_product_compatibility_product ON product_compatibility(product_code);
CREATE INDEX idx_product_compatibility_brand ON product_compatibility(brand);
CREATE INDEX idx_product_compatibility_shaft_config ON product_compatibility(shaft_config_id);
CREATE INDEX idx_product_compatibility_machine ON product_compatibility(machine_id);
CREATE INDEX idx_product_compatibility_type ON product_compatibility(machine_type);
CREATE INDEX idx_product_compatibility_brand_shaft ON product_compatibility(brand, shaft_config_id) WHERE shaft_config_id IS NOT NULL;

COMMENT ON TABLE product_compatibility IS 'Unified compatibility table. Handles folders (brand+shaft), binders (model-specific), stitchers, etc.';
COMMENT ON COLUMN product_compatibility.brand IS 'Required: Links to brand. Preserves "MBO 35mm" vs "Heidelberg 35mm" distinction.';
COMMENT ON COLUMN product_compatibility.shaft_config_id IS 'For shaft-based matching (folders, some binders)';
COMMENT ON COLUMN product_compatibility.machine_id IS 'For direct machine links (specific binders/stitchers)';
COMMENT ON COLUMN product_compatibility.model IS 'Alternative to machine_id: allows "Muller Martini" + "Primera" without full machine record';
COMMENT ON COLUMN product_compatibility.compatibility_source IS 'Tracks how this link was created (manual entry, computed from rules, confirmed by order, etc.)';

-- ============================================================================
-- 4. ADD SHAFT CONFIG TO MACHINES TABLE (Progressive Learning)
-- ============================================================================

ALTER TABLE machines
ADD COLUMN IF NOT EXISTS shaft_config_id INTEGER REFERENCES shaft_configurations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_machines_shaft_config ON machines(shaft_config_id);

COMMENT ON COLUMN machines.shaft_config_id IS 'Learned over time: Which shaft config does this specific model have? NULL = unknown/not applicable.';

-- ============================================================================
-- 5. HELPER VIEWS (Make Queries Easy)
-- ============================================================================

-- View: Machine → Compatible Products
CREATE OR REPLACE VIEW v_machine_compatible_products AS
SELECT
  m.machine_id,
  m.brand,
  m.model,
  m.type AS machine_type,
  m.slug,
  sc.display_name AS machine_shaft_display,
  sc.config_data AS machine_shaft_config,
  p.product_code,
  p.description AS product_description,
  p.category AS product_category,
  pc.compatibility_source,
  pc.notes AS compatibility_notes
FROM machines m
LEFT JOIN shaft_configurations sc ON sc.id = m.shaft_config_id
INNER JOIN product_compatibility pc ON (
  -- Match via brand + shaft (for folders with known shaft)
  (pc.brand = m.brand AND pc.shaft_config_id = m.shaft_config_id AND m.shaft_config_id IS NOT NULL)
  OR
  -- Match via direct machine link
  (pc.machine_id = m.machine_id)
  OR
  -- Match via brand + model name
  (pc.brand = m.brand AND pc.model = m.model AND pc.model IS NOT NULL)
)
INNER JOIN products p ON p.product_code = pc.product_code
WHERE p.active = true;

COMMENT ON VIEW v_machine_compatible_products IS 'Shows all compatible products for each machine. Handles shaft-based and direct model matching.';

-- View: Product → Compatible Machines
CREATE OR REPLACE VIEW v_product_compatible_machines AS
SELECT
  p.product_code,
  p.description AS product_description,
  p.category AS product_category,
  m.machine_id,
  m.brand,
  m.model,
  m.type AS machine_type,
  m.slug,
  sc.display_name AS machine_shaft_display,
  pc.compatibility_source,
  pc.notes AS compatibility_notes
FROM products p
INNER JOIN product_compatibility pc ON pc.product_code = p.product_code
LEFT JOIN machines m ON (
  -- Match via brand + shaft
  (m.brand = pc.brand AND m.shaft_config_id = pc.shaft_config_id AND pc.shaft_config_id IS NOT NULL)
  OR
  -- Match via direct machine link
  (m.machine_id = pc.machine_id)
  OR
  -- Match via brand + model
  (m.brand = pc.brand AND m.model = pc.model AND pc.model IS NOT NULL)
)
LEFT JOIN shaft_configurations sc ON sc.id = m.shaft_config_id
WHERE p.active = true;

COMMENT ON VIEW v_product_compatible_machines IS 'Shows all compatible machines for each product. Useful for "Where does TC/35 fit?" queries.';

-- ============================================================================
-- 6. UPDATE TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shaft_configurations_updated_at
  BEFORE UPDATE ON shaft_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_compatibility_updated_at
  BEFORE UPDATE ON product_compatibility
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Next steps:
-- 1. Run data migration script to populate from tool_brand_compatibility
-- 2. Update API routes to use new schema
-- 3. Test queries
-- 4. Deprecate tool_brand_compatibility table (DO NOT DROP YET - keep as backup)
