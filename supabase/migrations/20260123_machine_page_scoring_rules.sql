-- Add lead scoring rules for machine page visits

INSERT INTO lead_scoring_rules (rule_name, event_type, points, points_per_occurrence, active, decay_days)
VALUES
  ('Machine Page View', 'machine_page_view', 5, true, true, NULL),
  ('Machine Page View - High Interest', 'machine_page_view_high_confidence', 25, false, true, NULL), -- 3+ visits to same machine
  ('Solution Page View', 'solution_page_view', 20, true, true, NULL),
  ('Product View', 'product_view', 15, true, true, NULL)
ON CONFLICT DO NOTHING;
