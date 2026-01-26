-- Contacts for: Fast Advertisement LTD.
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
    ('Mohammad', 'Usman Latif', 'Mohammad Usman Latif', 'info@fast-advertisement.com', '07939372715', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Fast Advertisement LTD.'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



