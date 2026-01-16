-- Update distributor pricing from distibutor pricing 3 standard.csv
-- Only inserts/updates products that exist in products table
-- Total products in CSV: 47

INSERT INTO distributor_pricing (product_code, standard_price, currency, active)
SELECT 
  v.product_code,
  v.standard_price,
  'GBP' as currency,
  true as active
FROM (
  VALUES
  ('FEMALE-30-FIX', 656.00),
  ('FEMALE-35', 656.00),
  ('FEMALE-35/OB', 944.00),
  ('FEMALE-GUK-59.4/OB', 708.00),
  ('FEMALE-HH/35', 984.00),
  ('FEMALE-MB-20-FIX/OC', 656.00),
  ('FEMALE-MB20-FIX', 328.00),
  ('FF-GU/35-FP-01', 1920.00),
  ('FF-HH/30-FIX-01', 1280.00),
  ('FF-HH/30-FIX-3FEM-01', 4480.00),
  ('FF-HH/35-FP-01', 1280.00),
  ('FF-HH/35-FP-DSF-01-B', 850.00),
  ('FF-HO/40.2-FP-01', 1280.00),
  ('FF-HO/50-FP', 640.00),
  ('FF-MB/20-FP-01', 7040.00),
  ('FF-MB/20FIX-01', 640.00),
  ('FF-MF/30-FP-01', 1930.00),
  ('FF-MF/30-FP-02', 12060.00),
  ('FF-MF/30-FP-DSF-01-B', 640.00),
  ('FF-SM/35-FP-01', 7680.00),
  ('FF-ST/25-FP-01', 7040.00),
  ('MALE-35', 390.00),
  ('MALE-HH/35', 390.00),
  ('MALE-MB/20', 350.00),
  ('MT-02/CUTTING-OPTION-2', 8555.00),
  ('MT-HH/35/CUTTING-OPTION-2', 900.00),
  ('MU-RED-TA', 8.12),
  ('PD-DEL-GU/35-FP', 2255.00),
  ('PD-DEL-HH/30-FP', 451.00),
  ('PD-DEL-MB/20-FP', 902.00),
  ('PD-DEL-MF/30-FP', 451.00),
  ('PD-DEL-SM/35-FP', 451.00),
  ('SC-HO-01', 955.00),
  ('SC-HOR/25-FP', 1280.00),
  ('SC-MU-02', 640.00),
  ('SC-MU/PC-RB-5-W-MOD', 292.04),
  ('SCRIBER', 40.15),
  ('TRI-WEB-02', 1081.00),
  ('TWS-ID/35', 142.10),
  ('TWS-ID/35-3', 1177.40),
  ('TWS-ID/35-4', 162.40),
  ('TWS-ID/HH30.4', 40.60),
  ('TWS-ID/MB-3', 365.40),
  ('TWS-ID/MBO-35-3', 492.80),
  ('TWS-ID/MBO-35.3', 203.00),
  ('TWS-ID/MBO30-5', 609.00),
  ('Z-TAPE-ADH/4X50', 16.24)
) AS v(product_code, standard_price)
WHERE EXISTS (
  SELECT 1 FROM products p WHERE p.product_code = v.product_code
)
ON CONFLICT (product_code)
DO UPDATE SET
  standard_price = EXCLUDED.standard_price,
  currency = EXCLUDED.currency,
  active = EXCLUDED.active,
  updated_at = NOW();
