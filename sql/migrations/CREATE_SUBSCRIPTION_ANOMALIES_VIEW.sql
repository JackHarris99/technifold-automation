/**
 * Create Subscription Anomalies View
 * Flags any subscriptions where monthly_price < ratchet_max (ratchet violations)
 */

-- Drop view if exists (for safe re-runs)
DROP VIEW IF EXISTS public.v_subscription_anomalies;

-- Create the anomalies view
CREATE OR REPLACE VIEW public.v_subscription_anomalies AS
SELECT
  s.subscription_id,
  s.stripe_subscription_id,
  s.company_id,
  c.company_name,
  s.contact_id,
  ct.full_name AS contact_name,
  ct.email AS contact_email,
  s.monthly_price,
  s.ratchet_max,
  s.currency,
  s.status,
  s.created_at,
  s.updated_at,
  -- Calculate the violation amount
  (s.ratchet_max - s.monthly_price) AS violation_amount,
  -- Calculate percentage below ratchet
  ROUND(((s.ratchet_max - s.monthly_price) / s.ratchet_max * 100)::numeric, 2) AS violation_percentage
FROM public.subscriptions s
LEFT JOIN public.companies c ON s.company_id = c.company_id
LEFT JOIN public.contacts ct ON s.contact_id = ct.contact_id
WHERE s.ratchet_max IS NOT NULL
  AND s.monthly_price < s.ratchet_max
ORDER BY s.updated_at DESC;

-- Add comment
COMMENT ON VIEW public.v_subscription_anomalies IS
'Flags subscriptions where monthly_price is below ratchet_max (ratchet violations).
These should be investigated - prices should only increase, never decrease.';
