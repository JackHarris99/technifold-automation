-- Migration: Create engagement tracking views
-- Description: Create v_engagement_feed for timeline and v_next_best_actions for suggestions

-- ============================================================================
-- 1. v_engagement_feed - Unified timeline of all customer interactions
-- ============================================================================

CREATE OR REPLACE VIEW public.v_engagement_feed AS
SELECT
  e.event_id,
  e.occurred_at,
  e.company_id,
  e.company_uuid,
  c.company_name,
  e.contact_id,
  COALESCE(con.full_name, con.first_name || ' ' || con.last_name, con.email) AS contact_name,
  e.source,
  e.event_name,
  e.offer_key,
  e.campaign_key,
  e.url,
  e.value,
  e.currency,
  e.meta,

  -- Enriched event description
  CASE
    WHEN e.event_name = 'offer_view' THEN 'Viewed offer: ' || COALESCE(e.offer_key, 'unknown')
    WHEN e.event_name = 'checkout_started' THEN 'Started checkout'
    WHEN e.event_name = 'checkout_completed' THEN 'Completed purchase: ' || COALESCE(e.currency, 'GBP') || ' ' || COALESCE(e.value::TEXT, '0')
    WHEN e.event_name = 'portal_visit' THEN 'Visited customer portal'
    WHEN e.event_name = 'datasheet_view' THEN 'Viewed product datasheet'
    WHEN e.event_name = 'email_opened' THEN 'Opened email'
    WHEN e.event_name = 'email_clicked' THEN 'Clicked email link'
    ELSE e.event_name
  END AS event_description,

  -- Icon/color hints for UI
  CASE
    WHEN e.event_name LIKE '%checkout%' OR e.event_name LIKE '%purchase%' THEN 'purchase'
    WHEN e.event_name LIKE '%email%' THEN 'email'
    WHEN e.event_name LIKE '%visit%' OR e.event_name LIKE '%view%' THEN 'view'
    WHEN e.event_name LIKE '%click%' THEN 'click'
    ELSE 'event'
  END AS event_category

FROM public.engagement_events e
LEFT JOIN public.companies c ON e.company_id = c.company_id
LEFT JOIN public.contacts con ON e.contact_id = con.contact_id
ORDER BY e.occurred_at DESC;

-- ============================================================================
-- 2. v_next_best_actions - AI/Rule-based suggestions for customer engagement
-- ============================================================================

CREATE OR REPLACE VIEW public.v_next_best_actions AS
WITH company_stats AS (
  -- Calculate key metrics per company
  SELECT
    c.company_id,
    c.company_name,
    c.last_invoice_at,
    c.first_invoice_at,
    c.portal_token,

    -- Days since last order
    EXTRACT(DAY FROM (NOW() - c.last_invoice_at))::INT AS days_since_last_order,

    -- Count of orders
    COUNT(DISTINCT s.invoice_number) AS total_orders,

    -- Total lifetime value
    COALESCE(SUM(s.line_total), 0) AS lifetime_value,

    -- Recent engagement (last 90 days)
    COUNT(DISTINCT e.event_id) FILTER (WHERE e.occurred_at > NOW() - INTERVAL '90 days') AS recent_engagement_count,

    -- Last engagement date
    MAX(e.occurred_at) AS last_engagement_at,

    -- Has viewed portal recently
    BOOL_OR(e.event_name = 'portal_visit' AND e.occurred_at > NOW() - INTERVAL '30 days') AS visited_portal_recently

  FROM public.companies c
  LEFT JOIN public.sales s ON c.company_id = s.company_id
  LEFT JOIN public.engagement_events e ON c.company_id = e.company_id
  WHERE c.type = 'customer'
  GROUP BY c.company_id, c.company_name, c.last_invoice_at, c.first_invoice_at, c.portal_token
),

reorder_candidates AS (
  -- Companies that typically reorder but haven't recently
  SELECT
    company_id,
    'reorder_reminder' AS action_type,
    'Send reorder reminder' AS action_label,
    'Customer typically reorders every ' ||
      ROUND(AVG(days_between_orders)) || ' days, last order was ' ||
      days_since_last_order || ' days ago' AS reason,
    90 AS priority_score,
    JSONB_BUILD_OBJECT(
      'company_id', company_id,
      'avg_reorder_interval', ROUND(AVG(days_between_orders)),
      'days_since_last_order', days_since_last_order
    ) AS action_meta
  FROM (
    SELECT
      cs.company_id,
      cs.days_since_last_order,
      LAG(s.txn_date) OVER (PARTITION BY s.company_id ORDER BY s.txn_date) AS prev_order_date,
      s.txn_date,
      EXTRACT(DAY FROM (s.txn_date - LAG(s.txn_date) OVER (PARTITION BY s.company_id ORDER BY s.txn_date)))::INT AS days_between_orders
    FROM company_stats cs
    JOIN public.sales s ON cs.company_id = s.company_id
    WHERE cs.total_orders >= 2
      AND cs.days_since_last_order > 60  -- Haven't ordered in 2+ months
  ) reorder_intervals
  WHERE days_between_orders IS NOT NULL
    AND days_since_last_order > days_between_orders * 1.5  -- Overdue by 50%
  GROUP BY company_id, days_since_last_order
),

engagement_needed AS (
  -- High-value customers who haven't engaged recently
  SELECT
    company_id,
    'engagement_needed' AS action_type,
    'Re-engage high-value customer' AS action_label,
    'Lifetime value: £' || ROUND(lifetime_value) || ', last engaged ' ||
      EXTRACT(DAY FROM (NOW() - COALESCE(last_engagement_at, last_invoice_at)))::INT || ' days ago' AS reason,
    CASE
      WHEN lifetime_value > 5000 THEN 95
      WHEN lifetime_value > 1000 THEN 80
      ELSE 65
    END AS priority_score,
    JSONB_BUILD_OBJECT(
      'company_id', company_id,
      'lifetime_value', lifetime_value,
      'days_since_engagement', EXTRACT(DAY FROM (NOW() - COALESCE(last_engagement_at, last_invoice_at)))::INT
    ) AS action_meta
  FROM company_stats
  WHERE lifetime_value > 500
    AND (last_engagement_at IS NULL OR last_engagement_at < NOW() - INTERVAL '180 days')
    AND (last_invoice_at IS NULL OR last_invoice_at < NOW() - INTERVAL '180 days')
),

portal_invite AS (
  -- Customers who haven't used the portal yet
  SELECT
    company_id,
    'portal_invite' AS action_type,
    'Send portal invitation' AS action_label,
    'Customer has ' || total_orders || ' orders but hasn''t used the portal yet' AS reason,
    70 AS priority_score,
    JSONB_BUILD_OBJECT(
      'company_id', company_id,
      'total_orders', total_orders,
      'portal_token', portal_token
    ) AS action_meta
  FROM company_stats
  WHERE total_orders >= 2
    AND NOT visited_portal_recently
    AND portal_token IS NOT NULL
)

-- Combine all suggestion types
SELECT * FROM reorder_candidates
UNION ALL
SELECT * FROM engagement_needed
UNION ALL
SELECT * FROM portal_invite
ORDER BY priority_score DESC, company_id;

-- ============================================================================
-- Add comments
-- ============================================================================

COMMENT ON VIEW public.v_engagement_feed IS 'Unified timeline of all customer engagement events';
COMMENT ON VIEW public.v_next_best_actions IS 'AI-driven suggestions for customer engagement and follow-ups';
