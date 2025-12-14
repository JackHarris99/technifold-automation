-- Sales Center: Get urgent actions for sales rep territory
-- This powers the action dashboard homepage

CREATE OR REPLACE FUNCTION get_urgent_actions(rep_id uuid)
RETURNS TABLE (
  action_type text,
  company_id uuid,
  company_name text,
  priority int,
  message text,
  action_data jsonb,
  action_url text
)
LANGUAGE sql
STABLE
AS $$
  -- Trials ending soon (highest priority if < 3 days)
  SELECT
    'trial_ending' as action_type,
    c.company_id,
    c.company_name,
    CASE
      WHEN s.trial_end_date < NOW() + INTERVAL '1 day' THEN 1
      WHEN s.trial_end_date < NOW() + INTERVAL '3 days' THEN 2
      ELSE 3
    END as priority,
    'Trial ends in ' || EXTRACT(DAY FROM s.trial_end_date - NOW())::int || ' day(s)' as message,
    jsonb_build_object(
      'subscription_id', s.subscription_id,
      'trial_end_date', s.trial_end_date,
      'tools', s.tools
    ) as action_data,
    '/admin/sales/company/' || c.company_id::text as action_url
  FROM subscriptions s
  JOIN companies c ON s.company_id = c.company_id
  WHERE s.status = 'trial'
    AND s.trial_end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    AND c.account_owner = rep_id

  UNION ALL

  -- Unpaid invoices (7+ days overdue)
  SELECT
    'invoice_overdue' as action_type,
    c.company_id,
    c.company_name,
    1 as priority,
    '£' || o.total_amount::text || ' invoice overdue ' || EXTRACT(DAY FROM NOW() - o.created_at)::int || ' days' as message,
    jsonb_build_object(
      'order_id', o.order_id,
      'amount', o.total_amount,
      'invoice_url', o.invoice_url,
      'days_overdue', EXTRACT(DAY FROM NOW() - o.created_at)::int
    ) as action_data,
    o.invoice_url as action_url
  FROM orders o
  JOIN companies c ON o.company_id = c.company_id
  WHERE o.payment_status = 'unpaid'
    AND o.created_at < NOW() - INTERVAL '7 days'
    AND c.account_owner = rep_id

  UNION ALL

  -- Reorder opportunities (consumables 90+ days since last order)
  SELECT
    'reorder_opportunity' as action_type,
    c.company_id,
    c.company_name,
    4 as priority,
    'Last consumable order ' || EXTRACT(DAY FROM NOW() - MAX(o.created_at))::int || ' days ago' as message,
    jsonb_build_object(
      'days_since_order', EXTRACT(DAY FROM NOW() - MAX(o.created_at))::int,
      'last_order_date', MAX(o.created_at)
    ) as action_data,
    '/admin/sales/company/' || c.company_id::text || '/reorder' as action_url
  FROM orders o
  JOIN companies c ON o.company_id = c.company_id
  CROSS JOIN LATERAL jsonb_array_elements(o.items) as items_elem
  WHERE items_elem->>'product_code' LIKE 'CONS%' -- Consumables pattern
    AND c.account_owner = rep_id
  GROUP BY c.company_id, c.company_name
  HAVING MAX(o.created_at) < NOW() - INTERVAL '90 days'

  UNION ALL

  -- Upsell opportunities (machines with no active subscriptions)
  SELECT
    'upsell_opportunity' as action_type,
    c.company_id,
    c.company_name,
    5 as priority,
    t.model || ' (' || t.serial_number || ') has no subscription' as message,
    jsonb_build_object(
      'tool_id', t.tool_id,
      'model', t.model,
      'serial_number', t.serial_number,
      'install_date', t.install_date
    ) as action_data,
    '/admin/sales/company/' || c.company_id::text as action_url
  FROM tools t
  JOIN companies c ON t.company_id = c.company_id
  LEFT JOIN subscriptions s ON s.tools @> jsonb_build_array(t.tool_id::text)
    AND s.status IN ('active', 'trial')
  WHERE s.subscription_id IS NULL -- No active subscription
    AND c.account_owner = rep_id
    AND t.status = 'active'

  ORDER BY priority, company_name;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_urgent_actions(uuid) TO authenticated;

COMMENT ON FUNCTION get_urgent_actions IS 'Returns urgent actions for a sales rep territory - trials ending, overdue invoices, reorder opportunities, upsell chances';


-- Sales Center: Get performance metrics for sales rep
CREATE OR REPLACE FUNCTION get_sales_metrics(rep_id uuid, period_start timestamp DEFAULT NOW() - INTERVAL '30 days')
RETURNS TABLE (
  total_revenue numeric,
  deals_closed int,
  active_trials int,
  trial_conversion_rate numeric,
  companies_in_territory int,
  unpaid_invoices_count int,
  unpaid_invoices_total numeric
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    -- Total revenue from paid invoices in period
    COALESCE(SUM(CASE WHEN o.payment_status = 'paid' AND o.created_at >= period_start THEN o.total_amount ELSE 0 END), 0) as total_revenue,

    -- Deals closed (paid invoices) in period
    COUNT(CASE WHEN o.payment_status = 'paid' AND o.created_at >= period_start THEN 1 END)::int as deals_closed,

    -- Active trials right now
    (SELECT COUNT(*)::int FROM subscriptions s JOIN companies c ON s.company_id = c.company_id WHERE s.status = 'trial' AND c.account_owner = rep_id) as active_trials,

    -- Trial conversion rate (trials started in period that converted)
    CASE
      WHEN COUNT(CASE WHEN s.status = 'trial' AND s.created_at >= period_start THEN 1 END) > 0
      THEN ROUND(
        COUNT(CASE WHEN s.status = 'active' AND s.trial_end_date IS NOT NULL AND s.trial_end_date >= period_start THEN 1 END)::numeric /
        COUNT(CASE WHEN s.status IN ('trial', 'active') AND s.created_at >= period_start THEN 1 END)::numeric * 100,
        1
      )
      ELSE 0
    END as trial_conversion_rate,

    -- Companies in territory
    (SELECT COUNT(DISTINCT company_id)::int FROM companies WHERE account_owner = rep_id) as companies_in_territory,

    -- Unpaid invoices count
    COUNT(CASE WHEN o.payment_status = 'unpaid' THEN 1 END)::int as unpaid_invoices_count,

    -- Unpaid invoices total
    COALESCE(SUM(CASE WHEN o.payment_status = 'unpaid' THEN o.total_amount ELSE 0 END), 0) as unpaid_invoices_total

  FROM companies c
  LEFT JOIN orders o ON o.company_id = c.company_id
  LEFT JOIN subscriptions s ON s.company_id = c.company_id
  WHERE c.account_owner = rep_id;
$$;

GRANT EXECUTE ON FUNCTION get_sales_metrics(uuid, timestamp) TO authenticated;

COMMENT ON FUNCTION get_sales_metrics IS 'Returns performance metrics for sales rep - revenue, deals, trials, conversion rates';
