-- Tool Pricing Ladder
-- Volume discounts for tool purchases (customer-facing, permanent)

CREATE TABLE IF NOT EXISTS tool_pricing_ladder (
  id SERIAL PRIMARY KEY,
  min_qty INTEGER NOT NULL,
  max_qty INTEGER NOT NULL,
  discount_pct NUMERIC(5,2) NOT NULL, -- e.g., 10.00 for 10%
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tool pricing tiers
INSERT INTO tool_pricing_ladder (min_qty, max_qty, discount_pct, active) VALUES
(1, 1, 0.00, true),   -- 1 tool = 0% discount (full price)
(2, 2, 10.00, true),  -- 2 tools = 10% off each
(3, 3, 20.00, true),  -- 3 tools = 20% off each
(4, 4, 30.00, true),  -- 4 tools = 30% off each
(5, 999, 40.00, true) -- 5+ tools = 40% off each
ON CONFLICT DO NOTHING;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tool_pricing_ladder_qty ON tool_pricing_ladder(min_qty, max_qty) WHERE active = true;

COMMENT ON TABLE tool_pricing_ladder IS 'Volume discount tiers for tool purchases - customer-facing and permanent';
