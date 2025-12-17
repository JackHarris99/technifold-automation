-- Shipping rates table for flat-rate shipping per country/zone
CREATE TABLE IF NOT EXISTS shipping_rates (
  rate_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  rate_gbp numeric NOT NULL CHECK (rate_gbp >= 0),
  zone_name text, -- e.g., 'UK Mainland', 'EU', 'Rest of World'
  min_order_value numeric DEFAULT 0, -- Free shipping threshold (0 = always charged)
  free_shipping_threshold numeric, -- Optional: free shipping above this order value
  active boolean DEFAULT true NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(country_code)
);

COMMENT ON TABLE shipping_rates IS 'Flat-rate shipping costs per destination country';
COMMENT ON COLUMN shipping_rates.country_code IS 'ISO 2-letter country code (GB, US, DE, etc.)';
COMMENT ON COLUMN shipping_rates.rate_gbp IS 'Flat shipping cost in GBP';
COMMENT ON COLUMN shipping_rates.free_shipping_threshold IS 'Order value above which shipping is free';

-- Insert default UK and common rates
INSERT INTO shipping_rates (country_code, rate_gbp, zone_name, free_shipping_threshold, notes) VALUES
('GB', 8.50, 'UK Mainland', 100.00, 'Standard UK delivery'),
('IE', 15.00, 'Ireland', 150.00, 'Ireland delivery'),
('DE', 20.00, 'EU', 200.00, 'Germany delivery'),
('FR', 20.00, 'EU', 200.00, 'France delivery'),
('NL', 20.00, 'EU', 200.00, 'Netherlands delivery'),
('BE', 20.00, 'EU', 200.00, 'Belgium delivery'),
('ES', 22.00, 'EU', 200.00, 'Spain delivery'),
('IT', 22.00, 'EU', 200.00, 'Italy delivery'),
('PL', 22.00, 'EU', 200.00, 'Poland delivery'),
('US', 35.00, 'North America', 300.00, 'USA delivery'),
('CA', 35.00, 'North America', 300.00, 'Canada delivery');

-- Function to calculate shipping cost
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  p_country_code text,
  p_order_subtotal numeric
) RETURNS numeric AS $$
DECLARE
  v_rate record;
  v_shipping_cost numeric;
BEGIN
  -- Get shipping rate for country
  SELECT rate_gbp, free_shipping_threshold
  INTO v_rate
  FROM shipping_rates
  WHERE country_code = p_country_code
    AND active = true;

  IF NOT FOUND THEN
    -- Default to UK rate if country not found
    SELECT rate_gbp, free_shipping_threshold
    INTO v_rate
    FROM shipping_rates
    WHERE country_code = 'GB'
      AND active = true;
  END IF;

  IF NOT FOUND THEN
    -- Fallback if no rates exist
    RETURN 15.00;
  END IF;

  -- Check if qualifies for free shipping
  IF v_rate.free_shipping_threshold IS NOT NULL
     AND p_order_subtotal >= v_rate.free_shipping_threshold THEN
    RETURN 0;
  END IF;

  RETURN v_rate.rate_gbp;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_shipping_cost IS 'Calculate shipping cost based on destination country and order subtotal';
