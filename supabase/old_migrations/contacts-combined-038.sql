-- Contacts for: Yin printing
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
    ('Yin', 'lai Leong', 'Yin lai Leong', 'yinlaisg@yahoo.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Yin printing'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Yogakshi Arts & Computers
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
    ('Yogesh', 'Chaudhari', 'Yogesh Chaudhari', 'yogchaudhari67@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Yogakshi Arts & Computers'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ystad-Tryck AB
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
    ('Sven-Erik', 'Pettersson', 'Sven-Erik Pettersson', 'info@ystadtryck.se', '''+46 411 786 50', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ystad-Tryck AB'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Yunfan
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
    ('Leo', 'Liu', 'Leo Liu', 'liu_yuan317@163.com', '13829207652', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Yunfan'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Wexoprint
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'vaxjo@wexoprint.se', '''+46 470 209 91', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Wexoprint'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zafiris Offset Printers
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
    ('Demetris', 'Demetriou', 'Demetris Demetriou', 'demetris4zafiris@cytanet.com.cy', '''+357 24 817 785', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zafiris Offset Printers'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zaitouna for Printing
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
    ('Ahmed', 'M. Tamarji', 'Ahmed M. Tamarji', 'tamarji2002@hotmail.com', '''+249 9 12372056', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zaitouna for Printing'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zaman Printing and Packaging
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
    ('Mustafa', 'Al-Mushqab', 'Mustafa Al-Mushqab', 'mustafooo@hotmail.com', '''+966 13 852 3777', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zaman Printing and Packaging'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zaware
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
    ('Raahhul', 'Zawarre', 'Raahhul Zawarre', 'rahul@zawares.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zaware'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zaware Creative
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
    ('Raahhul', 'S Zawarre', 'Raahhul S Zawarre', 'rz@zawares.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zaware Creative'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zaza Print
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
    ('Artur', 'Karpiuk', 'Artur Karpiuk', 'art.karpiuk@gmail.com', '3.80674E+11', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zaza Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Wikstr�ms Tryckeri AB
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'info@wikstroms.se', '''+46 18 18 22 30', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Wikstr�ms Tryckeri AB'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Worums Trykkeri AS
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'mail@worum.no', '''+47 52 71 77 00', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Worums Trykkeri AS'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: WPE Sweden AB
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'kontakt@wpesweden.se', '''+46 495-766060', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('WPE Sweden AB'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: X-Gloo Norway
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'hei@saturn.no, post@x-gloo.no', '''+47 32 21 38 80', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('X-Gloo Norway'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Xid�
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'post@xide.no', '''+47 22 90 39 00', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Xid�'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: XP Consulting Pty Ltd
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'xpaustralia@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('XP Consulting Pty Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Yakobs Ram & Reklam
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'info@ramochreklam.se', '''+46 11 23 94 44', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Yakobs Ram & Reklam'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zeejprint
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'ksa@zeejprint.com, uae@zeejprint.com', '0097145547642', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zeejprint'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zhongshan Huatong Packaging Indus
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
    ('Shawn', 'Yip', 'Shawn Yip', 'general@huatong-machinery.com', '8.67609E+12', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zhongshan Huatong Packaging Indus'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zion graphics
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
    ('Sabu', 'Zion', 'Sabu Zion', 'sabuzionadur@gmail.com', '9947396316', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zion graphics'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zigijoy Design Limited
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
    ('George', 'Zigah', 'George Zigah', 'ziggeo2@hotmail.com', '0233302244325', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zigijoy Design Limited'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zomrrod
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
    ('Motasem', 'Al-Khawaja', 'Motasem Al-Khawaja', 'zomrrod@gmail.com', '''+962 79 737 10 10', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zomrrod'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zprint
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
    ('Andreas', 'Loka', 'Andreas Loka', 'celestial.astral@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zprint'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Acher
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
    ('Acher', NULL, 'Acher', 'acher.root@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Acher'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zuku Prints
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
    ('Simbarashe', 'Makuwe', 'Simbarashe Makuwe', 'simbamakuwe3@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zuku Prints'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Adonis Allou
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
    ('Adonis', 'Allou', 'Adonis Allou', 'alloualban@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Adonis Allou'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Aditya Kshirsagar
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
    ('Aditya', 'Kshirsagar', 'Aditya Kshirsagar', 'adikshirsagar44@gmail.com', '7385515229', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Aditya Kshirsagar'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zeej Print
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'info@zeejprint.com', '9.66114E+11', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zeej Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ahmed Sayed
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
    ('Ahmed', 'Sayed', 'Ahmed Sayed', 'arabiaprint@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ahmed Sayed'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Alexander Van Der Putt
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
    ('Alexander', 'Van Der Putt', 'Alexander Van Der Putt', 'embal.service@wanadoo.fr', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Alexander Van Der Putt'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Alathea Ferrand
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
    ('Alathea', 'Ferrand', 'Alathea Ferrand', 'imprimerieferrand@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Alathea Ferrand'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Albert Rios
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
    ('Albert', 'Rios', 'Albert Rios', 'rigoreti@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Albert Rios'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Alexandru Suciu
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
    ('Alexandru', 'Suciu', 'Alexandru Suciu', 'suciu_alexandru1@yahoo.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Alexandru Suciu'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Alexis Gonzalez
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
    ('Alexis', 'Gonzalez', 'Alexis Gonzalez', 'alexito.gonza@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Alexis Gonzalez'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ali - card creaser
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
    ('Ali', '- card creaser', 'Ali - card creaser', 'new_disc2001@yahoo.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ali - card creaser'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Alfred Vella
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
    ('Alfred', 'Vella', 'Alfred Vella', 'alfredvella61@gmail.com', '99009922', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Alfred Vella'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ali
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
    ('Ali', NULL, 'Ali', 'cmyk8@hotmail.com', '00966 562 224 242', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ali'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ali Zand
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
    ('Ali', 'Zand', 'Ali Zand', 'alizand72@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ali Zand'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Allan
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
    ('Allan', NULL, 'Allan', 'notifyallan@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Allan'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Allan Krautz
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
    ('Allan', 'Krautz', 'Allan Krautz', 'allan@krautz.dk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Allan Krautz'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Amer
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
    ('Amer', NULL, 'Amer', 'ameralserawan@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Amer'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Alvis Lacis
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
    ('Alvis', 'Lacis', 'Alvis Lacis', 'mraits@hotmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Alvis Lacis'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Alvin Tan
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
    ('Alvin', 'Tan', 'Alvin Tan', 'ast888@yahoo.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Alvin Tan'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zoom Grafisk
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'post@zum.no', '''+47 32 26 64 50', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zoom Grafisk'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Amer Ditta
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
    ('Amer', 'Ditta', 'Amer Ditta', 'amer.ditta@googlemail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Amer Ditta'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Amir Rahman
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
    ('Amir', 'Rahman', 'Amir Rahman', 'amirgraphica@yahoo.com', '96566235308', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Amir Rahman'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Amjad Al Hyasat
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
    ('Amjad', 'Al Hyasat', 'Amjad Al Hyasat', 'jcpp@batelco.jo', '9626 5533 788', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Amjad Al Hyasat'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Andrei Iacob
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
    ('Andrei', 'Iacob', 'Andrei Iacob', 'arh_iacob.andrei@yahoo.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Andrei Iacob'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Anil Desai
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
    ('Anil', 'Desai', 'Anil Desai', 'anil.h.desai@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Anil Desai'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Angelo Visconti
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
    ('Angelo', 'Visconti', 'Angelo Visconti', 'angelovisconti@yahoo.it', '3384401533', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Angelo Visconti'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Anthony Owusuansah
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
    ('Anthony', 'Owusuansah', 'Anthony Owusuansah', 'anthonyowusuansah16@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Anthony Owusuansah'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Antonio Sanchez
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
    ('Antonio', 'Sanchez', 'Antonio Sanchez', 'zaints@icloud.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Antonio Sanchez'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Antonie Ayite d'Almeida
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
    ('Antonie', 'Ayite d''Almeida', 'Antonie Ayite d''Almeida', 'implumiereplus@yahoo.fr', '228 2222 5326', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Antonie Ayite d''Almeida'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Antonio S�nchez Lozano
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
    ('Antonio', 'S�nchez Lozano', 'Antonio S�nchez Lozano', 'imglobal@telefonica.net', '34953444111', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Antonio S�nchez Lozano'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Arifur Rahman
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
    ('Arifur', 'Rahman', 'Arifur Rahman', 'arifurrahman.munir@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Arifur Rahman'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Arun Nk
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
    ('Arun', 'Nk', 'Arun Nk', 'arun.nk0003@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Arun Nk'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Artur
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
    ('Artur', NULL, 'Artur', 'artobol@wp.pl', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Artur'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Asghar Kamal
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
    ('Asghar', 'Kamal', 'Asghar Kamal', 'drasgharkamal786@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Asghar Kamal'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Aubin
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
    ('Aubin', NULL, 'Aubin', 'subin@designtrack.net', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Aubin'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Audrey Osias
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
    ('Audrey', 'Osias', 'Audrey Osias', 'a.osias@intergraphgroup.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Audrey Osias'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Auker Medina
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
    ('Auker', 'Medina', 'Auker Medina', 'auker19@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Auker Medina'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ayman Sasa
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
    ('Ayman', 'Sasa', 'Ayman Sasa', 'aymansasa99@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ayman Sasa'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Badr-Eddine
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
    ('Badr-Eddine', NULL, 'Badr-Eddine', 'impri.darelbadr@gmail.com', '213550250400', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Badr-Eddine'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Bekir Baspinar
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
    ('Bekir', 'Baspinar', 'Bekir Baspinar', 'bekirbaspinar@hotmail.com', '05339679651', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Bekir Baspinar'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Behar Krasniqi
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
    ('Behar', 'Krasniqi', 'Behar Krasniqi', 'behari_83@hotmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Behar Krasniqi'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Bart Vanderschueren
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
    ('Bart', 'Vanderschueren', 'Bart Vanderschueren', 'bart.vanderschueren@materialise.be', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Bart Vanderschueren'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Bennette Armah Hanson
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
    ('Bennette', 'Armah Hanson', 'Bennette Armah Hanson', 'magentabb@yahoo.co.uk', '0244 331 028', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Bennette Armah Hanson'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ben Bouchta Mohamed
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
    ('Ben', 'Bouchta Mohamed', 'Ben Bouchta Mohamed', 'benexportimport@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ben Bouchta Mohamed'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Bora Printer
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
    ('Bora', 'Printer', 'Bora Printer', 'dyyambur@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Bora Printer'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Bhaskar Sj
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
    ('Bhaskar', 'Sj', 'Bhaskar Sj', 'sj.bhaskar@gmail.com', '(831)730-7850', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Bhaskar Sj'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Briandt Emmanuel
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
    ('Briandt', 'Emmanuel', 'Briandt Emmanuel', 'cbriandt@googlemail.com', '''+233 244 560 108', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Briandt Emmanuel'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Carlo Mini
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
    ('Carlo', 'Mini', 'Carlo Mini', 'carloomini2@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Carlo Mini'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Brendan
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
    ('Brendan', NULL, 'Brendan', 'brendan@printfactory.ie', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Brendan'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Charles Agwadike
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
    ('Charles', 'Agwadike', 'Charles Agwadike', 'agwadikecharles@gmail.com', '08038187818', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Charles Agwadike'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Christian Gariboldi
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
    ('Christian', 'Gariboldi', 'Christian Gariboldi', 'christian.gariboldi@seregni.pl', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Christian Gariboldi'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ciaran Guinan
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
    ('Ciaran', 'Guinan', 'Ciaran Guinan', 'ciaran@brosnapress.ie', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ciaran Guinan'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Cipriano Napala
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
    ('Cipriano', 'Napala', 'Cipriano Napala', 'gregoria.pp@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Cipriano Napala'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Cristian Fernando Infante
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
    ('Cristian', 'Fernando Infante', 'Cristian Fernando Infante', 'cristian.infante@yahoo.es', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Cristian Fernando Infante'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Cristian Molina
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
    ('Cristian', 'Molina', 'Cristian Molina', 'cmolina@odp.cl', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Cristian Molina'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Colin Yung
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
    ('Colin', 'Yung', 'Colin Yung', 'colin@yiuwah.com.hk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Colin Yung'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Daniel Consuegra
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
    ('Daniel', 'Consuegra', 'Daniel Consuegra', 'daniel@impresiona.com.es', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Daniel Consuegra'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Danilo Ricci
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
    ('Danilo', 'Ricci', 'Danilo Ricci', 'daniloricci@libero.it', '(333)434-5999', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Danilo Ricci'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: David
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
    ('David', NULL, 'David', 'davidjr.mt@maycheonggroup.com.cn', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('David'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Debesh Chanda
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
    ('Debesh', 'Chanda', 'Debesh Chanda', 'debesh.chanda@renukana.com', '2.34803E+12', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Debesh Chanda'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Deepak Rava
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
    ('Deepak', 'Rava', 'Deepak Rava', 'rtcdeepak@yahoo.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Deepak Rava'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Dickson Lee
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
    ('Dickson', 'Lee', 'Dickson Lee', 'dickson.printcow@gmail.com', '''+65 9729 2562', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Dickson Lee'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Dejan Ilic
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
    ('Dejan', 'Ilic', 'Dejan Ilic', 'dekiprint@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Dejan Ilic'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Desmond Otakponmwen
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
    ('Desmond', 'Otakponmwen', 'Desmond Otakponmwen', 'ninety9vision@yahoo.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Desmond Otakponmwen'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: DILIP
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
    ('DILIP', NULL, 'DILIP', 'dilip@kossmann.in', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('DILIP'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Diogo Teixeira
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
    ('Diogo', 'Teixeira', 'Diogo Teixeira', 'diogo.teixeira@lfmcorporate.com', '351 255 539230', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Diogo Teixeira'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Dominic
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
    ('Dominic', NULL, 'Dominic', 'dominic@graphprint.ie', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Dominic'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Doreen Mulroy
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
    ('Doreen', 'Mulroy', 'Doreen Mulroy', 'doreen.mulroy@mcclabel.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Doreen Mulroy'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Edmund Kuna
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
    ('Edmund', 'Kuna', 'Edmund Kuna', 'edmund.kuna@gmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Edmund Kuna'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Dr Abdulaziz Almohimeed
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
    ('Dr', 'Abdulaziz Almohimeed', 'Dr Abdulaziz Almohimeed', 'aialmohimeed@esu.ac.ae', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Dr Abdulaziz Almohimeed'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Efint
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
    ('Efint', NULL, 'Efint', 'okprism@naver.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Efint'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Efrain Salazar
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
    ('Efrain', 'Salazar', 'Efrain Salazar', 'efrasalazar17@hotmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Efrain Salazar'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Efrem Belay
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
    ('Efrem', 'Belay', 'Efrem Belay', 'ephro.com@gmail.com', '''+251 913859723', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Efrem Belay'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ekanem EFFIONG
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
    ('Ekanem', 'EFFIONG', 'Ekanem EFFIONG', 'ekanemeffiong6@gmail.com', '''-5767', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ekanem EFFIONG'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Elimar de Aguilar
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
    ('Elimar', 'de Aguilar', 'Elimar de Aguilar', 'gerencia@deltaprint.ind.br', '48 347 83900', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Elimar de Aguilar'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



