-- Contacts for: Love From Aunty Helen
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
    ('Helen', 'Mitchell', 'Helen Mitchell', 'lovefromauntyhelen@gmail.com', '07896357422', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Love From Aunty Helen'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



