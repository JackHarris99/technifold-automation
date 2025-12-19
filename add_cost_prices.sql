-- Step 1: Add cost_price column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS cost_price NUMERIC;

-- Step 2: Create a temporary table to hold CSV data
CREATE TEMP TABLE temp_cost_prices (
    product_code TEXT,
    cost_price NUMERIC
);

-- Step 3: Copy CSV data into temporary table
-- You'll need to run this command with the CSV file path:
-- \COPY temp_cost_prices(product_code, cost_price) FROM 'product codes with cost price.csv' WITH (FORMAT csv, HEADER true);

-- Step 4: Update products table with cost prices from CSV
-- This will ONLY update existing products, not insert new ones
UPDATE products p
SET cost_price = t.cost_price
FROM temp_cost_prices t
WHERE p.product_code = t.product_code;

-- Step 5: Show summary of what was updated
SELECT
    COUNT(*) as total_updated,
    COUNT(*) FILTER (WHERE cost_price IS NOT NULL) as with_cost_price,
    COUNT(*) FILTER (WHERE cost_price IS NULL) as without_cost_price
FROM products;

-- Step 6: Show products that are in CSV but not in products table (these will NOT be added)
SELECT t.product_code, t.cost_price
FROM temp_cost_prices t
LEFT JOIN products p ON t.product_code = p.product_code
WHERE p.product_code IS NULL
ORDER BY t.product_code;

-- Step 7: Clean up
DROP TABLE temp_cost_prices;
