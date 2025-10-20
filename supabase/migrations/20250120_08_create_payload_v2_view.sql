-- Migration: Create vw_company_consumable_payload_v2
-- Description: Enhanced payload view that includes product_category field

-- ============================================================================
-- Create v2 view with product category
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_company_consumable_payload_v2 AS
SELECT
  c.company_id,
  c.company_name,
  c.portal_token,

  -- Reorder items with category
  (
    SELECT json_agg(
      json_build_object(
        'consumable_code', s.product_code,
        'description', p.description,
        'price', p.price,
        'currency', p.currency,
        'category', p.category,  -- ADDED: product_category
        'product_category', p.category,  -- ADDED: explicit product_category field
        'last_purchased', MAX(s.txn_date)
      )
    )
    FROM sales s
    JOIN products p ON s.product_code = p.product_code
    WHERE s.company_id = c.company_id
      AND p.type = 'consumable'
    GROUP BY s.product_code, p.description, p.price, p.currency, p.category
    ORDER BY MAX(s.txn_date) DESC
  ) AS reorder_items,

  -- By tool tabs with consumables (including category)
  (
    SELECT json_agg(
      json_build_object(
        'tool_code', tool_code,
        'tool_desc', tool_desc,
        'tool_category', tool_category,  -- ADDED: tool category
        'items', items
      )
    )
    FROM (
      SELECT DISTINCT
        t.product_code AS tool_code,
        t.description AS tool_desc,
        t.category AS tool_category,  -- ADDED
        (
          SELECT json_agg(
            json_build_object(
              'consumable_code', cons.product_code,
              'description', cons.description,
              'price', cons.price,
              'currency', cons.currency,
              'category', cons.category,  -- ADDED
              'product_category', cons.category,  -- ADDED: explicit field
              'last_purchased', MAX(s2.txn_date)
            )
          )
          FROM tool_consumable_map tcm
          JOIN products cons ON tcm.consumable_code = cons.product_code
          LEFT JOIN sales s2 ON s2.product_code = cons.product_code
            AND s2.company_id = s.company_id
          WHERE tcm.tool_code = t.product_code
            AND cons.type = 'consumable'
          GROUP BY cons.product_code, cons.description, cons.price, cons.currency, cons.category
        ) AS items
      FROM sales s
      JOIN products t ON s.product_code = t.product_code
      WHERE s.company_id = c.company_id
        AND t.type = 'tool'
    ) AS tool_data
    WHERE items IS NOT NULL
  ) AS by_tool_tabs

FROM companies c;

-- Add comment
COMMENT ON VIEW public.vw_company_consumable_payload_v2 IS 'Enhanced payload view with product_category fields for portal display. Use this instead of v1.';

-- ============================================================================
-- TODO for migration: Switch portal queries to use _v2 view
-- ============================================================================
-- After confirming _v2 works correctly, update lib/supabase.ts:
-- Change: .from('vw_company_consumable_payload')
-- To:     .from('vw_company_consumable_payload_v2')
