-- Migration: Create materialized view for company metrics
-- This pre-aggregates company order data for fast lookups

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS company_metrics_view CASCADE;

-- Create materialized view with all company metrics
CREATE MATERIALIZED VIEW company_metrics_view AS
SELECT
  c.company_id,
  c.company_name,
  c.category,
  c.account_owner,
  c.country,
  c.first_invoice_at,
  c.last_invoice_at,
  COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as lifetime_value,
  COALESCE(COUNT(CASE WHEN o.payment_status = 'paid' THEN o.order_id ELSE NULL END), 0) as order_count,
  MIN(o.created_at) as first_order_date,
  MAX(o.created_at) as last_order_date
FROM companies c
LEFT JOIN orders o ON c.company_id = o.company_id
GROUP BY c.company_id, c.company_name, c.category, c.account_owner, c.country, c.first_invoice_at, c.last_invoice_at;

-- Create index for fast sorting by value
CREATE INDEX idx_company_metrics_lifetime_value ON company_metrics_view(lifetime_value DESC);
CREATE INDEX idx_company_metrics_order_count ON company_metrics_view(order_count DESC);
CREATE INDEX idx_company_metrics_account_owner ON company_metrics_view(account_owner);
CREATE INDEX idx_company_metrics_company_name ON company_metrics_view(company_name);

-- Refresh the view
REFRESH MATERIALIZED VIEW company_metrics_view;

-- Grant access
GRANT SELECT ON company_metrics_view TO authenticated, anon;

-- Add comment
COMMENT ON MATERIALIZED VIEW company_metrics_view IS
  'Pre-aggregated company metrics for fast CRM queries.
   Refresh periodically or after bulk order imports.
   Run: REFRESH MATERIALIZED VIEW company_metrics_view;';
