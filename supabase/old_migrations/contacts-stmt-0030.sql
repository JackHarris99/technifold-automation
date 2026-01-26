-- Contacts for: KEN WILKINS PRINT LIMITED
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
    ('Jason', 'Mayfield', 'Jason Mayfield', 'jason.mayfield@wilkins.co.uk', '''+447966121016', 'subscribed'),
    ('Joseph', 'Branston', 'Joseph Branston', 'joseph.branston@westrock.com', '''+441159896000', 'subscribed'),
    ('Bryan', 'O''Dowd', 'Bryan O''Dowd', 'bryan@wilkins.co.uk', '''+441159896000', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('KEN WILKINS PRINT LIMITED'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



