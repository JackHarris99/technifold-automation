-- Fix reorder portal to use fact tables instead of deprecated sales table
-- ESP001 and other companies show empty because view queries sales table
-- Data is now in company_tools and company_consumables fact tables

CREATE OR REPLACE VIEW public.vw_company_consumable_payload_v2 AS
SELECT
  c.company_id,
  c.company_name,
  c.portal_token,

  -- Reorder items from company_consumables fact table
  (
    SELECT json_agg(
      json_build_object(
        'consumable_code', cc.consumable_code,
        'description', p.description,
        'price', p.price,
        'currency', p.currency,
        'category', p.category,
        'product_category', p.category,
        'last_purchased', cc.last_ordered_at
      )
      ORDER BY cc.last_ordered_at DESC
    )
    FROM company_consumables cc
    JOIN products p ON cc.consumable_code = p.product_code
    WHERE cc.company_id = c.company_id
      AND p.type = 'consumable'
  ) AS reorder_items,

  -- By tool tabs with consumables (from fact tables)
  (
    SELECT json_agg(
      json_build_object(
        'tool_code', tool_code,
        'tool_desc', tool_desc,
        'tool_category', tool_category,
        'items', items
      )
    )
    FROM (
      SELECT DISTINCT
        ct.tool_code,
        t.description AS tool_desc,
        t.category AS tool_category,
        (
          SELECT json_agg(
            json_build_object(
              'consumable_code', cons.product_code,
              'description', cons.description,
              'price', cons.price,
              'currency', cons.currency,
              'category', cons.category,
              'product_category', cons.category,
              'last_purchased', cc.last_ordered_at
            )
            ORDER BY cc.last_ordered_at DESC
          )
          FROM tool_consumable_map tcm
          JOIN products cons ON tcm.consumable_code = cons.product_code
          LEFT JOIN company_consumables cc ON cc.consumable_code = cons.product_code
            AND cc.company_id = c.company_id
          WHERE tcm.tool_code = ct.tool_code
            AND cons.type = 'consumable'
        ) AS items
      FROM company_tools ct
      JOIN products t ON ct.tool_code = t.product_code
      WHERE ct.company_id = c.company_id
        AND t.type = 'tool'
    ) AS tool_data
    WHERE items IS NOT NULL
  ) AS by_tool_tabs

FROM companies c;

COMMENT ON VIEW public.vw_company_consumable_payload_v2 IS 'Reorder portal payload using fact tables (company_tools, company_consumables) instead of deprecated sales table';
