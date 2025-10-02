-- SQL to fix the vw_company_consumable_payload view to include category field
-- Run this in your Supabase SQL Editor

-- Step 1: First, check the current view definition
-- Run this to see what the view looks like now:
SELECT pg_get_viewdef('vw_company_consumable_payload', true);

-- Step 2: After reviewing the structure above, update the view
-- This is a general template - you'll need to adjust based on the actual structure
-- The key is to add 'category' from the products table wherever products are referenced

-- Example of what the updated view might look like:
-- You'll need to modify this based on your actual view structure from Step 1

/*
CREATE OR REPLACE VIEW vw_company_consumable_payload AS
SELECT
  company_id,
  company_name,
  -- Update reorder_items to include category
  (
    SELECT json_agg(
      json_build_object(
        'consumable_code', product_code,
        'description', description,
        'price', price,
        'category', category,  -- ADD THIS
        'last_purchased', last_purchased
      )
    )
    FROM (
      SELECT DISTINCT
        s.product_code,
        p.description,
        p.price,
        p.category,  -- ADD THIS
        MAX(s.txn_date) AS last_purchased
      FROM sales s
      JOIN products p ON s.product_code = p.product_code
      WHERE s.company_id = c.company_id
        AND p.type = 'consumable'
      GROUP BY s.product_code, p.description, p.price, p.category  -- ADD p.category
      ORDER BY MAX(s.txn_date) DESC
    ) AS reorder_data
  ) AS reorder_items,
  -- Update by_tool_tabs items to include category
  (
    SELECT json_agg(
      json_build_object(
        'tool_code', tool_code,
        'tool_desc', tool_desc,
        'items', items
      )
    )
    FROM (
      SELECT DISTINCT
        t.product_code AS tool_code,
        t.description AS tool_desc,
        (
          SELECT json_agg(
            json_build_object(
              'consumable_code', c.product_code,
              'description', c.description,
              'price', c.price,
              'category', c.category,  -- ADD THIS
              'last_purchased', MAX(s2.txn_date)
            )
          )
          FROM tool_consumable_map tcm
          JOIN products c ON tcm.consumable_code = c.product_code
          LEFT JOIN sales s2 ON s2.product_code = c.product_code
            AND s2.company_id = s.company_id
          WHERE tcm.tool_code = t.product_code
            AND c.type = 'consumable'
          GROUP BY c.product_code, c.description, c.price, c.category  -- ADD c.category
        ) AS items
      FROM sales s
      JOIN products t ON s.product_code = t.product_code
      WHERE s.company_id = c.company_id
        AND t.type = 'tool'
    ) AS tool_data
    WHERE items IS NOT NULL
  ) AS by_tool_tabs
FROM companies c;
*/

-- Step 3: Test the updated view
-- After updating the view, test if category is now included:
SELECT
  company_name,
  reorder_items::jsonb -> 0 -> 'category' AS first_item_category,
  reorder_items::jsonb -> 0 -> 'description' AS first_item_description
FROM vw_company_consumable_payload
WHERE reorder_items IS NOT NULL
LIMIT 5;