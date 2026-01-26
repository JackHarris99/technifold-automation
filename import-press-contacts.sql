-- Contacts for: Eye On Display
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
    ('Jack', 'Gocher', 'Jack Gocher', 'jack@eyeondisplay.co.uk', '07966 661196', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Eye On Display'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Print Monthly
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
    ('Tim', 'Hall', 'Tim Hall', 'tim@linkpublishing.co.uk', '0117 9603255', 'subscribed'),
    ('Brendan', 'Perring', 'Brendan Perring', 'editor@printmonthly.co.uk', '0117 980 5040', 'subscribed'),
    ('Sir/Madam', NULL, 'Sir/Madam', 'news@printmonthly.co.uk', '0117 980 5040', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Print Monthly'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: m.seidl@pp-europe.eu
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
    ('Michael', NULL, 'Michael', 'm.seidl@pp-europe.eu', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('m.seidl@pp-europe.eu'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Printweek UK
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
    ('Darryl', 'Danielli', 'Darryl Danielli', 'darryl.danielli@markallengroup.com', '020 7738 5454, 020 7501 6680', 'subscribed'),
    ('James', 'Cockburn', 'James Cockburn', 'james.cockburn@markallengroup.com', '02075016692', 'subscribed'),
    ('Sir/Madam', NULL, 'Sir/Madam', 'printweek.newsdesk@markallengroup.com', NULL, 'subscribed'),
    ('Richard', 'Stuart-Turner', 'Richard Stuart-Turner', 'richard.stuart-turner@markallengroup.com', '020 7738 5454', 'subscribed'),
    ('Alex', 'Foy', 'Alex Foy', 'alexander.foy@markallengroup.com', '020 7501 6737', 'subscribed'),
    ('Jess', 'Dunmall', 'Jess Dunmall', 'jessica.dunmall@markallengroup.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Printweek UK'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Whitmar Publications�
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
    ('Kelly', 'Morris', 'Kelly Morris', 'kelly.m@whitmar.co.uk', '07792 037780', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Whitmar Publications�'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Printing Expo Virtual Exhibition
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
    ('Christopher', 'Watson', 'Christopher Watson', 'chris.watson@printing-expo.online', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Printing Expo Virtual Exhibition'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Link Publishing/Print Show
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
    ('Nicky', 'Jones', 'Nicky Jones', 'nicky@theprintshow.co.uk', '01179 805049', 'subscribed'),
    ('Page', 'Tuck', 'Page Tuck', 'page@theprintshow.co.uk', '01179 805049', 'subscribed'),
    ('Chris', 'Davies', 'Chris Davies', 'chris@theprintshow.co.uk', '07539 450996', 'subscribed'),
    ('Elena', 'Grant', 'Elena Grant', 'elena@theprintshow.co.uk', '01179 805049', 'subscribed'),
    ('Laura', 'Urbanowicz', 'Laura Urbanowicz', 'laura@theprintshow.co.uk', '01179 805049', 'subscribed'),
    ('David', 'Osgar', 'David Osgar', 'david@linkpublishing.co.uk', '0117 980 5040', 'subscribed'),
    ('Richard', 'Tuck', 'Richard Tuck', 'richard@printmonthly.co.uk, Richard@linkpublishing.co.uk', '0117 960 3255', 'subscribed'),
    ('Carys', 'Evans', 'Carys Evans', 'carys@linkpublishing.co.uk', '0117 980 5040', 'subscribed'),
    ('Kathryn', 'Quinn', 'Kathryn Quinn', 'k.quinn@linkpublishing.co.uk, kat@theprintshow.co.uk', '0117 980 5040, 01179 805049, 0117 9805042', 'subscribed'),
    ('Lucas', 'Naylor', 'Lucas Naylor', 'lucas.naylor@linkpublishing.co.uk', '07510736767', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Link Publishing/Print Show'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Sign Update & Image Reports
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
    ('Krysan', 'Hallett', 'Krysan Hallett', 'KHallett@datateam.co.uk', '01622 699 182', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Sign Update & Image Reports'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



