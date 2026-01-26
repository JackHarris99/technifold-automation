-- Contacts for: QuickImages
INSERT INTO contacts (company_id, first_name, last_name, full_name, email, phone, marketing_status)
SELECT
  c.company_id,
  v.first_name,
  v.last_name,
  v.full_name,
  v.email,
  v.phone,
  v.marketing_status
FROM (VALUES
    ('Cathy', 'Fox', 'Cathy Fox', 'cathy.fox@quickimages.com', '(345) 326-2626, (345) 623-1707', 'subscribed'),
    ('Hywel', 'Jones', 'Hywel Jones', 'hywel.jones@quickimages.com', '345 326 2626', 'subscribed'),
    ('Sarra', 'Membreno', 'Sarra Membreno', 'sarra.membreno@quickimages.com', '345 326 2626', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('QuickImages'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



