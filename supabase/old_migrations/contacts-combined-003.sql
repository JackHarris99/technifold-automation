-- Contacts for: Gee Bros
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
    ('Andrew', 'Pearson- Gee', 'Andrew Pearson- Gee', 'sales@geebrothers.co.uk', '020 72284081', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Gee Bros'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: AK Products
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
    ('Andrew', 'Pratt', 'Andrew Pratt', 'andrew@akproducts.net', '0845 458 7491', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('AK Products'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: ACL Packaging Print Division
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
    ('Andrew', NULL, 'Andrew', 'sales@aclps.com', '02083914660', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('ACL Packaging Print Division'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: CM Print
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
    ('Andy', NULL, 'Andy', 'andy.jarred@cmprint.co.uk', '01273 420983', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('CM Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Publicity & Display Ltd
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
    ('Andy', 'Ayres', 'Andy Ayres', 'andy@pubdis.com', '01483428326', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Publicity & Display Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Office Products International Ltd
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
    ('Andy', 'Braithwaite', 'Andy Braithwaite', 'andy.braithwaite@opi.net', '''+33 (0) 961452827', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Office Products International Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Andrew Joseph Printers
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
    ('Andy', 'Dent', 'Andy Dent', 'andy@andrewjosephprinters.co.uk', '01536 482484', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Andrew Joseph Printers'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Marshall Signs
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
    ('Andy', 'Marshall', 'Andy Marshall', 'info@marshallsigns.co.uk', '0115 9413092', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Marshall Signs'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Sherrens
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
    ('Andy', 'Sharpe', 'Andy Sharpe', 'andy@sherrens.com', '01305 785265', 'subscribed'),
    ('Clive', 'Garman', 'Clive Garman', 'clive@sherrens.com', '01305 785265', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Sherrens'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Greywell Press Ltd
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
    ('Ann', 'Venning', 'Ann Venning', 'production@greywell.net', '01252 544221', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Greywell Press Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Acacia Graphix Ltd
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
    ('Ann', 'Glasgow', 'Ann Glasgow', 'acaciagraphix@icloud.com', '01162864227', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Acacia Graphix Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Razammataz
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
    ('Angela', 'Palmer', 'Angela Palmer', 'a.palmer@razammataz.com', '01517920209', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Razammataz'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Fountain Print Ltd
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
    ('Andy', NULL, 'Andy', 'andy@fountainprint.co.uk', '0117-972 1717', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Fountain Print Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Wates
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
    ('Anna', 'Watkins', 'Anna Watkins', 'anna.watkins@wates.co.uk', '01582406259', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Wates'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Watershed Packaging Ltd
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
    ('Anna', 'Wood', 'Anna Wood', 'annawood@watershed-packaging.co.uk', '01132770606', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Watershed Packaging Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Lucilla Lavender Ltd
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
    ('Anneke', 'Driscoll', 'Anneke Driscoll', 'sales@lucillalavender.com', '020 3405 1410', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Lucilla Lavender Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Instaprint
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
    ('P', 'Gauntley', 'P Gauntley', 'info@instaprint.co.uk', '0115-941 8123', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Instaprint'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: AMP
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
    ('Anthony', 'Melia', 'Anthony Melia', 'ant@antmelia.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('AMP'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Twenty Four Seven Design & Prints
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
    ('Anthony', NULL, 'Anthony', 'info@247print.net', '01925 240247', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Twenty Four Seven Design & Prints'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Swift Design & Print
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
    ('Antony', 'Brindley', 'Antony Brindley', 'swiftdesign.print@btinternet.com', '0115 9846794', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Swift Design & Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Craven Design & Print
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
    ('Anthony', 'Sherratt', 'Anthony Sherratt', 'info@cravendesignandprint.co.uk', '01588 673972', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Craven Design & Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: NETPRINTERS
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
    ('Anton', 'Gnanam', 'Anton Gnanam', 'netprinters@hotmail.co.uk', '07804759760', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('NETPRINTERS'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: london envelopes ltd
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
    ('Arsalan', 'Ahmed', 'Arsalan Ahmed', 'arsalan78623@outlook.com', '07506118770', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('london envelopes ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Argun Printers
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
    ('Argun', 'Imamzade', 'Argun Imamzade', 'hello@argun.co.uk', '02089 857879', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Argun Printers'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: BUDGET SIGNS LIMITED
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
    ('Aziz', 'Malik', 'Aziz Malik', 'budgetsigns@hotmail.co.uk', '07914855640', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('BUDGET SIGNS LIMITED'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Liquid Print
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
    ('Atif', 'Aziz', 'Atif Aziz', 'atinetpk@gmail.com', '07453796874', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Liquid Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: SIPEXA LTD
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
    ('Aytac', 'TOKATLI', 'Aytac TOKATLI', 'aytac.tokatli@sipexa.com', '07510080484', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('SIPEXA LTD'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Compass Press
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
    ('Azmet', 'Khan', 'Azmet Khan', 'sales@leicesterlabels.co.uk', '0116 262-4761', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Compass Press'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Guildbourne Printing Services
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
    ('B', 'Palma', 'B Palma', 'guildbourneprinting@outlook.com', '01903 230572', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Guildbourne Printing Services'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Shopnation
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
    ('Barbara', 'Foks', 'Barbara Foks', 'barbara@shopnation.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Shopnation'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Service Press Ltd
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
    ('Barrie', 'Hill', 'Barrie Hill', 'barrie@service-press.co.uk', '01162519199', 'subscribed'),
    ('Jan', '.', 'Jan .', 'jan@service-press.co.uk', '01162519199', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Service Press Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Mdl Kelex Ltd
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
    ('Barrie', 'Taylor', 'Barrie Taylor', 'barrie.taylor@mdlkelex.co.uk', '01453791400', 'subscribed'),
    ('Greg', 'Fellows', 'Greg Fellows', 'greg.fellows@mdlkelex.co.uk', '01453791400', 'subscribed'),
    ('Lucy', 'Taylor', 'Lucy Taylor', 'lucy.taylor@mdlkelex.co.uk', '01453791400', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Mdl Kelex Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: RAD Printing Ltd
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
    ('Barry', NULL, 'Barry', 'info@radprint.com', '01322 380775', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('RAD Printing Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Hayman Creative
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
    ('Barry', 'Hayman', 'Barry Hayman', 'barry@haymancreative.co.uk', '07973 112320', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Hayman Creative'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Reel Appeal
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
    ('Barry', 'Lewis', 'Barry Lewis', 'sales@reelappeal.co.uk', '01616206764', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Reel Appeal'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Route1Print
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
    ('Becky', 'Swift', 'Becky Swift', 'sales@route1print.co.uk', '0114 294 5026', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Route1Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Britannia Garment Packaging
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
    ('Ben', 'Fenton', 'Ben Fenton', 'ben.fenton@britanniapackaging.com', '07594 390070', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Britannia Garment Packaging'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Norfolk Print & Design
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
    ('Ben', 'Pitcher', 'Ben Pitcher', 'ben@norfolkprintdesign.co.uk', '07584 240245', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Norfolk Print & Design'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Print Finishing Specialities
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
    ('Bernard', 'Golden', 'Bernard Golden', 'bg2145@tiscali.co.uk', '01298 71300', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Print Finishing Specialities'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Melody Studio
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
    ('Bhavin', 'Supeda', 'Bhavin Supeda', 'sales@melodystudio.co.uk', '07886520256', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Melody Studio'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Hine Labels Ltd
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
    ('Bill', 'Hine', 'Bill Hine', 'bill@hinelabels.com', '07785 997076', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Hine Labels Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: R B Print Services
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
    ('Bob', 'Baker', 'Bob Baker', 'rbprint@btconnect.com', '01303 241220', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('R B Print Services'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Potato Print Ltd
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
    ('Bill', 'Duncan', 'Bill Duncan', 'bill@potatoprintltd.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Potato Print Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Cawthornes
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
    ('Bill', NULL, 'Bill', 'bill@cawthornes.co.uk', '02476 641212', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Cawthornes'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Beyond the Veil
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
    ('Brian', 'Innes', 'Brian Innes', 'brianinnes1985@gmail.com', '07983544418', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Beyond the Veil'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Alpha Duplication Ltd
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
    ('Brian', 'Dubois', 'Brian Dubois', 'info@alpha-duplication.com', '01494 536646', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Alpha Duplication Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Rowson Print
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
    ('Brian', 'Rowson', 'Brian Rowson', 'sales@rowsonprint.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Rowson Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: 3di
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
    ('Bryan', 'Lade', 'Bryan Lade', 'bryan.lade@3di-info.com', '01483 211533, 07737 530513', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('3di'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Abbey Print
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
    ('Bruce', 'Brown', 'Bruce Brown', 'mac@abbeyprint1.co.uk', '01795 539397', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Abbey Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: First Impressions
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
    ('C', 'E Bryan', 'C E Bryan', 'charles@first-impressions.co.uk', '01284728004', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('First Impressions'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Bow Design and Print Limited
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
    ('Carl', 'Harris', 'Carl Harris', 'carl.harris@bdpmedia.co.uk', '07782108386', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Bow Design and Print Limited'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Outstanding Md Ltd
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
    ('Carl', 'Ahmed', 'Carl Ahmed', 'sales@outstandingmd.co.uk', '(017)266-9442', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Outstanding Md Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Bonacia
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
    ('Carl', 'Whitelock', 'Carl Whitelock', 'carl.whitelock@bonacia.co.uk', '01733 890099', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Bonacia'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Royal Academy of Music
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
    ('Bryony', NULL, 'Bryony', 'printshop@ram.ac.uk', '020 7873 7373', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Royal Academy of Music'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Borney Uk Ltd
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
    ('Carli', 'Beary', 'Carli Beary', 'carli.beary@borneyuk.co.uk', '01480456689', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Borney Uk Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: The Mailing People
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
    ('Carlton', 'Clements', 'Carlton Clements', 'enquiries@themailingpeople.co.uk', '023 9237 7900', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('The Mailing People'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Cartridges Inc
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
    ('Caroline', 'Litster', 'Caroline Litster', 'stockton@cartridgesinc.co.uk', '016426789400', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Cartridges Inc'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Central Press
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
    ('Chand', 'Patel', 'Chand Patel', 'centralpress@talktalk.net', '07970 277258', 'subscribed'),
    ('Sir/Madam', NULL, 'Sir/Madam', 'info@centralpress.jo, sales@centralpress.jo', '96264745693', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Central Press'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Printland
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
    ('Chandra', 'Parmar', 'Chandra Parmar', 'darren@printland.co.uk', '0121 608 0888', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Printland'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Election Workshop
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
    ('Charles', 'Glover', 'Charles Glover', 'charles@electionworkshop.co.uk', '07904 371 320', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Election Workshop'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Joma Jewellery
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
    ('Charlie', 'Oneill', 'Charlie Oneill', 'charlieoneill@jomajewellery.com', NULL, 'subscribed'),
    ('Chloe', 'Yau', 'Chloe Yau', 'chloeyau@jomajewellery.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Joma Jewellery'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Langtec
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
    ('Chris', NULL, 'Chris', 'chris@langtec.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Langtec'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Adare SEC
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
    ('Chris', 'Archer', 'Chris Archer', 'chris.archer@adaresec.com', '01527 838820', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Adare SEC'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Blissetts
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
    ('Chris', 'Blissett', 'Chris Blissett', 'chris.blissett@blissetts.com', '020 8992 3965', 'subscribed'),
    ('Dardan', 'Rakovica', 'Dardan Rakovica', 'dardan@blissetts.com', '02089963965', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Blissetts'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Chris Cook Print & Office Supplies
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
    ('Chris', 'Cook', 'Chris Cook', 'sales@chriscookprint.co.uk', '01205350144', 'subscribed'),
    ('Glen', NULL, 'Glen', 'glen@chriscookprint.co.uk', '01205350144', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Chris Cook Print & Office Supplies'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: ecoMLR Ltd.
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
    ('Chris', 'Hallam', 'Chris Hallam', 'chris@conceptpackagingltd.com', '07866458434', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('ecoMLR Ltd.'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Lambert Print & Design
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
    ('Chris', 'Hall', 'Chris Hall', 'info@lambertprinters.co.uk', '01422 843127', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Lambert Print & Design'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: NSD LABELS
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
    ('Chris', 'Hogarth', 'Chris Hogarth', 'chrishogarth1962@gmail.com', '07435 270013', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('NSD LABELS'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: St Leonards Press
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
    ('Chris', 'Hollick', 'Chris Hollick', 'st.leonards@btconnect.com', '07970 271328', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('St Leonards Press'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: East Cheshire Nhs Trust
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
    ('Chris', 'Holmes', 'Chris Holmes', 'christopher.holmes1@nhs.net', '01625663093', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('East Cheshire Nhs Trust'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Broadland Digital
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
    ('Chris', NULL, 'Chris', 'info@broadlanddigital.co.uk', '01603 407786', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Broadland Digital'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Stress Free Print
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
    ('Chris', 'Marsh', 'Chris Marsh', 'chris@stressfreeprint.co.uk', '0345 222 0345', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Stress Free Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Baddeley Bros Ltd
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
    ('Chris', 'Pertwee', 'Chris Pertwee', 'chris.pertwee@baddeleybrothers.com', '020 89862666', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Baddeley Bros Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Think Colour
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
    ('Chris', 'Nussey', 'Chris Nussey', 'chris@thinkcolour.co.uk', '07595 734 507', 'subscribed'),
    ('Nigel', NULL, 'Nigel', 'nigel@thinkcolour.co.uk', '07595 734 507', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Think Colour'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Verite
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
    ('Chris', 'Powell', 'Chris Powell', 'chrispowell@veritecm.com', '01903241975', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Verite'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Taylor Office Supplies
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
    ('Chris', 'Taylor', 'Chris Taylor', 'christaylor7@hotmail.co.uk', '01904 768655', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Taylor Office Supplies'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: S Wilford Printers
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
    ('Chris', 'Wilford', 'Chris Wilford', 'chris@swilfordprinter.co.uk, info@swilfordprinter.co.uk', '0116 2547375', 'subscribed'),
    ('Karon', NULL, 'Karon', 'karon@swilfordprinter.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('S Wilford Printers'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Benchhut Design and Print Limited
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
    ('Chris', 'Willis', 'Chris Willis', 'chris@benchhut.co.uk', '01325 468842', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Benchhut Design and Print Limited'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Pennine Labels
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
    ('Christopher', 'Baldwin', 'Christopher Baldwin', 'chris@penninelabels.co.uk', '01282873050', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Pennine Labels'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: University of Cumbria
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
    ('Christine', 'Mitchell', 'Christine Mitchell', 'christine.mitchell@cumbria.ac.uk', '01524 384315', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('University of Cumbria'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Imprint
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
    ('Christopher', 'Bee', 'Christopher Bee', 'imprintdigital@btconnect.com', '0116 2341020', 'subscribed'),
    ('M', 'Heaton', 'M Heaton', 'imprintkeighley@mac.com', '01535 667954', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Imprint'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Rsscan Lab Ltd.
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
    ('Christopher', 'Smith-rewse', 'Christopher Smith-rewse', 'bente@rsscan.co.uk', '01473834891', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Rsscan Lab Ltd.'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Home
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
    ('Christy', 'Boxall', 'Christy Boxall', 'christy3001@hotmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Home'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: The Print Quarter Chorley
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
    ('Claire', 'Bailey', 'Claire Bailey', 'sales@pqchorley.com', '01257 269 707', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('The Print Quarter Chorley'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Easy-Print
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
    ('Colin', 'Armstrong', 'Colin Armstrong', 'colin@easy-print.co.uk', '01622 607090', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Easy-Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Footprint
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
    ('Colin', 'Griffin', 'Colin Griffin', 'footuk@aol.com', '01279 730044, 01279 730706', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Footprint'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Texprep Print & Copy Shop
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
    ('Colin', 'Smith', 'Colin Smith', 'colin@texprep.co.uk', '01280 704338', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Texprep Print & Copy Shop'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Warwick Print
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
    ('Craig', 'Smith', 'Craig Smith', 'craig.smith@warwickprint.co.uk', '02476524729', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Warwick Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Hughes Print
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
    ('Dan', 'Hughes', 'Dan Hughes', 'info@hughesprint.co.uk', '01902 457261', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Hughes Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: West Highland Services Ltd
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
    ('Daniel', 'J Mann', 'Daniel J Mann', 'info@west-highland-services.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('West Highland Services Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Rose Calendars
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
    ('Daniel', 'Godbold', 'Daniel Godbold', 'dan.godbold@rosecalendars.co.uk', '07784 128085', 'subscribed'),
    ('Mark', 'Shipley', 'Mark Shipley', 'mark@rosecalendars.co.uk', '01206 844500', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Rose Calendars'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: White Hart Press
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
    ('Daniel', 'O''Loughlin', 'Daniel O''Loughlin', 'info@whitehartpress.co.uk', '01234 270465', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('White Hart Press'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: PDA Card & Craft
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
    ('Danny', NULL, 'Danny', 'danny@pdacardandcraft.co.uk', '07854 797075', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('PDA Card & Craft'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Studio One Media Ltd
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
    ('Danny', 'Golden', 'Danny Golden', 'danny.golden@studio1.org.uk', '01604 774860', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Studio One Media Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Linneys Print Solutions
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
    ('Darran', 'Harding', 'Darran Harding', 'info@linneysprintsolutions.co.uk', '0115 9782409', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Linneys Print Solutions'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Clarendon Fleet Livery Ltd
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
    ('Darran', 'Medhurst', 'Darran Medhurst', 'darran@clarendon-fleet.com', '01162403700', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Clarendon Fleet Livery Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: The First Mailing Co Ltd
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
    ('Darren', 'Smith', 'Darren Smith', 'fmproduction@firstmailing.co.uk', '08456349522', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('The First Mailing Co Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: G4 Design & Print
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
    ('Darren', 'Jimmeson', 'Darren Jimmeson', 'darren@printbyg4.com', '07970299095', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('G4 Design & Print'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Advartex Ltd
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
    ('Darren', 'Goodsell', 'Darren Goodsell', 'darrengoodsell@btinternet.com', '01580200120', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Advartex Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Outlaw Merchandise
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
    ('Darren', 'Wells', 'Darren Wells', 'outlawmerchandise@hotmail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Outlaw Merchandise'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



