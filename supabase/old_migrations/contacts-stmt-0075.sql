-- Contacts for: Modern Technology
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
    ('Md.', 'Bazlur Rahman', 'Md. Bazlur Rahman', 'rahman@mdt.com.bd', '''+ 971 542214839', 'subscribed'),
    ('Delwar', NULL, 'Delwar', 'delwar@mdt.com.bd', NULL, 'subscribed'),
    ('Faisal', NULL, 'Faisal', 'faisal@mdt.com.bd', NULL, 'subscribed'),
    ('Shakeel', 'Hossain', 'Shakeel Hossain', 'm.s.hossain86@gmail.com', NULL, 'subscribed'),
    ('Adil', 'Delwar', 'Adil Delwar', 'adil@mdt.com.bd', '''+447309886266', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Modern Technology'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



