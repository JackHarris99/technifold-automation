-- Contacts for: Ability Hire
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
    ('Brendon', 'Ware', 'Brendon Ware', 'Brendon.ware@abilityhire.co.uk', '07384 796477', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ability Hire'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Informa Markets
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
    ('Barry', 'Killengrey', 'Barry Killengrey', 'Barry.Killengrey@informa.com', '''+971 (0) 50 918 4460', 'subscribed'),
    ('Alexa', 'Rode-Eagle', 'Alexa Rode-Eagle', 'Alexa.Rode-Eagle@informa.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Informa Markets'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Standing Stone
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
    ('Mark', 'Ferguson', 'Mark Ferguson', 'mark.ferguson@ssdos.co.uk', '01661 886653', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Standing Stone'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: The Midlands Business Network
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
    ('Bethany', 'de Thierry', 'Bethany de Thierry', 'bethanydethierry@themidlandsbusinessnetwork.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('The Midlands Business Network'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Bladen Box & Display Ltd
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
    ('James', NULL, 'James', 'james@bladenbox.com', '01623 812047, 01623 811050', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Bladen Box & Display Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: CYKLOS Choltice v.d.
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
    ('Pavel', 'Brož', 'Pavel Brož', 'broz@cyklos.cz', '''+420 777 167 467', 'subscribed'),
    ('Andrea', 'Daňková', 'Andrea Daňková', 'dankova@cyklos.cz', '''+420 739 042 282', 'subscribed'),
    ('Lucie', 'Capkova', 'Lucie Capkova', 'capkova@cyklos.cz', '''+420 466099023, mob +420 724028999', 'subscribed'),
    ('Miroslav', 'Du�ek', 'Miroslav Du�ek', 'dusek@cyklos.cz', '''+420 725 952 979', 'subscribed'),
    ('Mirek', 'Hruban', 'Mirek Hruban', 'hruban@cyklos.cz', NULL, 'subscribed'),
    ('Jan', 'Cemak', 'Jan Cemak', 'jan.cermak@cyklos.cz', NULL, 'subscribed'),
    ('cyklos', NULL, 'cyklos', 'korinkova@cyklos.cz', NULL, 'subscribed'),
    ('Karel', 'Komarek', 'Karel Komarek', 'komarek@cyklos.cz', '''+420 466 099 075, +420 606 627 505', 'subscribed'),
    ('Ondrej', 'Svacinka', 'Ondrej Svacinka', 'svacinka@cyklos.cz', '00 420 737 341 471', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('CYKLOS Choltice v.d.'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: SnapWebDesign
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
    ('Lloyd', 'Spencer', 'Lloyd Spencer', 'lloyd@thesnapagency.com, lloyd@snapwebdesign.co.uk', '07540 383 462', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('SnapWebDesign'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Export Partners
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
    ('Alun', 'Gabriel', 'Alun Gabriel', 'alun@exportpartners.co.uk', '01422 322396', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Export Partners'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Custom Toys
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
    ('Tianna', 'Ataba', 'Tianna Ataba', 'tianna@customtoys.com', '07417990703', 'subscribed'),
    ('Izzy', 'Griffin', 'Izzy Griffin', 'Izzy@customtoys.com', '07736 989 710', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Custom Toys'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Concept Furniture
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
    ('Lyndsey', 'Hill', 'Lyndsey Hill', 'lyndsey@conceptfurniture.co.uk', '0844 822 1424 Ext 115, 01299 254090', 'subscribed'),
    ('Annette', 'Kelsall', 'Annette Kelsall', 'annette@conceptfurniture.co.uk', '01299 254090', 'subscribed'),
    ('Scott', 'Gibbons', 'Scott Gibbons', 'scott@conceptfurniture.co.uk', NULL, 'subscribed'),
    ('Tracy', 'Oakley', 'Tracy Oakley', 'tracy@conceptfurniture.co.uk', '01299 254090', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Concept Furniture'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: The NEC Group
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
    ('Jemima', 'Moponda', 'Jemima Moponda', 'Jemima.Moponda@necgroup.co.uk', '077217 30330', 'subscribed'),
    ('Jennifer', 'Clark', 'Jennifer Clark', 'Jennifer.clark@necgroup.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('The NEC Group'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Wright Removals
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
    ('Camilla', 'Wright', 'Camilla Wright', 'office@wrightmoveremovals.com', '07748 310999', 'subscribed'),
    ('Michael', 'Wright', 'Michael Wright', 'michael@wrightmoveremovals.com', '07814 748373', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Wright Removals'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Pinnacle International Freight
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
    ('Adam', 'Pettet', 'Adam Pettet', 'adam.pettet@pif.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Pinnacle International Freight'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: SC Tipografia Arta Srl
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
    ('Adrian', 'Campean', 'Adrian Campean', 'adrian.campean@tipoarta.ro', '''+40 7400 40457, 00 40 7400 40457', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('SC Tipografia Arta Srl'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: PNB Print Ltd
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
    ('Agris', 'Rebans', 'Agris Rebans', 'agris.rebans@pnbprint.eu', '37129425338, +371 67 04 33 75', 'subscribed'),
    ('Kristine', 'Baranovska', 'Kristine Baranovska', 'kristine.baranovska@pnbprint.eu', '''+371 67 04 33 75', 'subscribed'),
    ('Anda', 'Jasinkevi?a', 'Anda Jasinkevi?a', 'anda.jasinkevica@pnbprint.eu', '''+371 67 04 33 75', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('PNB Print Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Dale Studios (Leicester) Ltd
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
    ('Adrian', 'Wagemakers', 'Adrian Wagemakers', 'adrian@dalestudios.co.uk', '0116 270 9975', 'subscribed'),
    ('Colin', 'Baxter', 'Colin Baxter', 'colin@dalestudios.co.uk', NULL, 'subscribed'),
    ('Harriet', NULL, 'Harriet', 'harriet@dalestudios.co.uk', NULL, 'subscribed'),
    ('Heather', 'Langton', 'Heather Langton', 'heather@dalestudios.co.uk', '0116 270 9975', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Dale Studios (Leicester) Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Novability
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
    ('Alan', 'Beckley', 'Alan Beckley', 'alan-beckley@msn.com', '(972)989-1002', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Novability'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: MacIntyre Hudson
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
    ('Alan', 'Herbert', 'Alan Herbert', 'alan.herbert@mhllp.co.uk', '07500 936301', 'subscribed'),
    ('Neil', 'Berry', 'Neil Berry', 'neil.berry@mhllp.co.uk', '07557855842', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('MacIntyre Hudson'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Milenniuiumcargo.com
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
    ('Ali', 'Askar', 'Ali Askar', 'ali@millenniumcargo.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Milenniuiumcargo.com'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Logo S.p.A.
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
    ('Andrea', 'Campagnaro', 'Andrea Campagnaro', 'andrea.campagnaro@graficart.it', '''+39 049 9336370', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Logo S.p.A.'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Merrehill Ltd
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
    ('Andrew', 'McMurdo', 'Andrew McMurdo', 'andrew@merrehill.uk', '01625 708040', 'subscribed'),
    ('Lee', 'Shore', 'Lee Shore', 'lee@merrehill.uk', '01625 708040, 0161 266 1763', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Merrehill Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Merrehill
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
    ('Andy', NULL, 'Andy', 'andy@merrehill.co.uk', '01625 708040', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Merrehill'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Routeonefwd.com
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
    ('Anthony', 'Adcock', 'Anthony Adcock', 'anthony@routeonefwd.com', '0121 788 4527', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Routeonefwd.com'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Apr Solutions Ltd
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
    ('Paul', 'Eddy', 'Paul Eddy', 'ap@aprsolutions.co.uk', '07740365213', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Apr Solutions Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Supreme Tools
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
    ('Barry', 'March', 'Barry March', 'barry.march@supremetools.co.uk', '07904 525953', 'subscribed'),
    ('Leon', 'Henshaw', 'Leon Henshaw', 'leon.henshaw@supremetools.co.uk', '01827 711788', 'subscribed'),
    ('Dave', 'Grimley', 'Dave Grimley', 'sales@supremetools.co.uk', '01827 711788', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Supreme Tools'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: CME Works Ltd
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
    ('Barry', 'Mitchell', 'Barry Mitchell', 'barry@cme.uk.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('CME Works Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Zara Manufacturing Ltd
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
    ('Kevin', 'Pay', 'Kevin Pay', 'bazzapay31@gmail.com', '01455 212112', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Zara Manufacturing Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Messe Dusseldorf Asia Pte Ltd
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
    ('Beattrice', 'J Ho', 'Beattrice J Ho', 'beattrice@mda.com.sg', '(65) 6332 9642', 'subscribed'),
    ('Sievi', 'Wei Yao', 'Sievi Wei Yao', 'weiyao@mda.com.sg', '(65) 6332 9620', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Messe Dusseldorf Asia Pte Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Picon Ltd
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
    ('Bettine', 'Pellant', 'Bettine Pellant', 'bettine.pellant@picon.co.uk', '01438 832742', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Picon Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: S Cohen & Sons Ltd
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
    ('Oved', 'Cohen', 'Oved Cohen', 'bindarycohen@bezeqint.net', '972 3 6821043', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('S Cohen & Sons Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: BPIF
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
    ('Bob', 'Davies', 'Bob Davies', 'bob.davies@bpif.org.uk', '0845 250 7050', 'subscribed'),
    ('Ceri', 'Priddle', 'Ceri Priddle', 'ceri.priddle@bpif.org.uk', NULL, 'subscribed'),
    ('Chris', 'Selby', 'Chris Selby', 'chris.selby@bpif.org.uk', NULL, 'subscribed'),
    ('Dale', 'Wallis', 'Dale Wallis', 'dale.wallis@bpif.org.uk', NULL, 'subscribed'),
    ('Dawn', 'Reid', 'Dawn Reid', 'dawn.reid@bpif.org.uk', NULL, 'subscribed'),
    ('Jo', 'Lloyd', 'Jo Lloyd', 'jo.lloyd@bpif.org.uk', NULL, 'subscribed'),
    ('Kyle', 'Jardine', 'Kyle Jardine', 'kyle.jardine@bpif.org.uk', NULL, 'subscribed'),
    ('Peter', 'Hawkins', 'Peter Hawkins', 'peter.hawkins@bpif.org.uk', '0845 250 7050', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('BPIF'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Brooklyn Engineering Ltd
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
    ('Steve', 'Astley', 'Steve Astley', 'brooklyneng@btconnect.com', '01455 845417', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Brooklyn Engineering Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Star Translations Services
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
    ('Bryan', 'Fitzsimons', 'Bryan Fitzsimons', 'bryan.fitzsimons@star-ts.com', '''+353 1 8365614', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Star Translations Services'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Tradefair
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
    ('Carly', 'Nesbitt', 'Carly Nesbitt', 'carly.nesbitt@tradefair.co.uk', '07714 67 77 69', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Tradefair'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Picon
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
    ('Cathy', NULL, 'Cathy', 'cathy.haywood@picon.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Picon'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: BPIF
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
    ('Bob', 'Davies', 'Bob Davies', 'bob.davies@bpif.org.uk', '0845 250 7050', 'subscribed'),
    ('Ceri', 'Priddle', 'Ceri Priddle', 'ceri.priddle@bpif.org.uk', NULL, 'subscribed'),
    ('Chris', 'Selby', 'Chris Selby', 'chris.selby@bpif.org.uk', NULL, 'subscribed'),
    ('Dale', 'Wallis', 'Dale Wallis', 'dale.wallis@bpif.org.uk', NULL, 'subscribed'),
    ('Dawn', 'Reid', 'Dawn Reid', 'dawn.reid@bpif.org.uk', NULL, 'subscribed'),
    ('Jo', 'Lloyd', 'Jo Lloyd', 'jo.lloyd@bpif.org.uk', NULL, 'subscribed'),
    ('Kyle', 'Jardine', 'Kyle Jardine', 'kyle.jardine@bpif.org.uk', NULL, 'subscribed'),
    ('Peter', 'Hawkins', 'Peter Hawkins', 'peter.hawkins@bpif.org.uk', '0845 250 7050', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('BPIF'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Chamber of Commerce
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
    ('chamber@e-zcert,', '.com', 'chamber@e-zcert, .com', 'chamber@e-zcert.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Chamber of Commerce'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: BPIF
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
    ('Bob', 'Davies', 'Bob Davies', 'bob.davies@bpif.org.uk', '0845 250 7050', 'subscribed'),
    ('Ceri', 'Priddle', 'Ceri Priddle', 'ceri.priddle@bpif.org.uk', NULL, 'subscribed'),
    ('Chris', 'Selby', 'Chris Selby', 'chris.selby@bpif.org.uk', NULL, 'subscribed'),
    ('Dale', 'Wallis', 'Dale Wallis', 'dale.wallis@bpif.org.uk', NULL, 'subscribed'),
    ('Dawn', 'Reid', 'Dawn Reid', 'dawn.reid@bpif.org.uk', NULL, 'subscribed'),
    ('Jo', 'Lloyd', 'Jo Lloyd', 'jo.lloyd@bpif.org.uk', NULL, 'subscribed'),
    ('Kyle', 'Jardine', 'Kyle Jardine', 'kyle.jardine@bpif.org.uk', NULL, 'subscribed'),
    ('Peter', 'Hawkins', 'Peter Hawkins', 'peter.hawkins@bpif.org.uk', '0845 250 7050', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('BPIF'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Cheeky Fox LLP
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
    ('Chris', 'Lee', 'Chris Lee', 'chris@cheekyfoxpromo.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Cheeky Fox LLP'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Translink Express Logistics
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
    ('Chris', 'Hobbis', 'Chris Hobbis', 'chris@translinkexpress.co.uk', '0845 226 4753', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Translink Express Logistics'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: RGB UK
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
    ('Chris', 'Hope', 'Chris Hope', 'chris@rgbuk.com', '07861 732849', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('RGB UK'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Dale Studios (Leicester) Ltd
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
    ('Adrian', 'Wagemakers', 'Adrian Wagemakers', 'adrian@dalestudios.co.uk', '0116 270 9975', 'subscribed'),
    ('Colin', 'Baxter', 'Colin Baxter', 'colin@dalestudios.co.uk', NULL, 'subscribed'),
    ('Harriet', NULL, 'Harriet', 'harriet@dalestudios.co.uk', NULL, 'subscribed'),
    ('Heather', 'Langton', 'Heather Langton', 'heather@dalestudios.co.uk', '0116 270 9975', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Dale Studios (Leicester) Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: The Online Print Coach
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
    ('Colin', 'Sinclair McDermott', 'Colin Sinclair McDermott', 'colin@theonlineprintcoach.com', '07535 846 482', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('The Online Print Coach'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Westside Press
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
    ('Andrew', 'Johnson', 'Andrew Johnson', 'andrewjohnston@westsidepress.com', '''+3530858051398', 'subscribed'),
    ('Dermot', NULL, 'Dermot', 'dermot@westsidepress.com', '00353 14145116', 'subscribed'),
    ('Jonathan', 'Nelson', 'Jonathan Nelson', 'jonathannelson@westsidepress.com', '00353 868161142', 'subscribed'),
    ('Colm', 'Downer', 'Colm Downer', 'colm@westsidepress.com', '''+353 87 625 2793', 'subscribed'),
    ('Deborah', 'Taylor', 'Deborah Taylor', 'deborah@printbindery.com', '085-8053477', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Westside Press'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Print Glaze
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
    ('Conal', NULL, 'Conal', 'conal@printglaze.ie', '00353 1 626 9666', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Print Glaze'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Imprimerie Rivaton & Cie
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
    ('Claire', 'Rivaton', 'Claire Rivaton', 'crivaton@rivaton.fr', '06 60 09 19 16', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Imprimerie Rivaton & Cie'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Airport Express Taxis
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
    ('Clive', 'W', 'Clive W', 'cwairportexpress@aol.com', '07757 660340/01162751860', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Airport Express Taxis'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: APS Feiras & Eventos
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
    ('Danielle', 'Mobricce', 'Danielle Mobricce', 'danielle@apsfeiras.com.br', '''+55 11 4013 7972, +55 11 4013 7979', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('APS Feiras & Eventos'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Compass Business Finance
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
    ('Danny', 'Simpson', 'Danny Simpson', 'danny@compassbusinessfinance.co.uk', '07870 506168', 'subscribed'),
    ('Jamie', 'Nelson', 'Jamie Nelson', 'jamie@compassbusinessfinance.co.uk', '07793 528980', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Compass Business Finance'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Iguana group
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
    ('''Darrin', 'Hatfield''', '''Darrin Hatfield''', 'darrin@iguanagroup.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Iguana group'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: PRM Engineering Ltd
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
    ('Dave', 'Lakin / Pete', 'Dave Lakin / Pete', 'dave.lakin@prm-engineering.com', '0116 2784700', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('PRM Engineering Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Max Schlatterer GmbH & Co Kg
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
    ('Doris', 'Bader', 'Doris Bader', 'dbader@esband.de', '''+49 7324 15 222', 'subscribed'),
    ('Maria', 'Mirabile', 'Maria Mirabile', 'mmirabile@esband.de', '''+49 7324 15 222', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Max Schlatterer GmbH & Co Kg'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Brysons Haulage Ltd
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
    ('Dean', 'Watson', 'Dean Watson', 'dean@brysonshaulage.com', '0116 286 3427', 'subscribed'),
    ('Lee', NULL, 'Lee', 'info@brysonshaulage.com', '0116 286 3427', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Brysons Haulage Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Messe-Duesseldorf.de
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
    ('Jennifer', 'D�belt', 'Jennifer D�belt', 'duebeltje@messe-duesseldorf.de', '''+49 (0) 211/4560-526', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Messe-Duesseldorf.de'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Business Supply Group Ltd-Scrip-J
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
    ('Roger', 'Agge', 'Roger Agge', 'roger_agge@yahoo.com', '001 868 235 3333', 'subscribed'),
    ('Marsha-Marie', 'Joseph', 'Marsha-Marie Joseph', 'marsha@scripj.com', '''+1 (868) 235-3333', 'subscribed'),
    ('Dri', 'Smith', 'Dri Smith', 'drinasmith@hotmail.com', '''+1 868-626-1234', 'subscribed'),
    ('Ryan', 'H', 'Ryan H', 'ryanh@scripj.com', '''+1 868-626-1234', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Business Supply Group Ltd-Scrip-J'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Sign & Digital UK
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
    ('Derek', 'MacHale', 'Derek MacHale', 'dmachale@datateam.co.uk', '07968 301374', 'subscribed'),
    ('Rudi', 'Blackett', 'Rudi Blackett', 'rudiblackett@fav-house.com', '07879 470002', 'subscribed'),
    ('Brooke', 'Wady', 'Brooke Wady', 'Bwady@datateam.co.uk', '01622 699187', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Sign & Digital UK'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: UTI
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
    ('Williams,', 'Darren', 'Williams, Darren', 'dwilliams@go2uti.com', '0121078203000', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('UTI'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Fiera Milano S.p.a.
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
    ('Emiliana', 'Cappellini', 'Emiliana Cappellini', 'emiliana.cappellini@fieramilano.it', '''+39 02 4997 7238', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Fiera Milano S.p.a.'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Available Car
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
    ('Nick', 'Flowers', 'Nick Flowers', 'enquiries@availablecar.com', '01332 817222', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Available Car'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Pod Digital
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
    ('Emily', 'Gall', 'Emily Gall', 'emilyg@poddigital.co.uk', '01455 564 564', 'subscribed'),
    ('Matthew', 'Johnson', 'Matthew Johnson', 'matthew@poddigital.co.uk', '01455 564 564', 'subscribed'),
    ('Michael', 'Barton', 'Michael Barton', 'michael@poddigital.co.uk', '01455 564 564', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Pod Digital'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Manao Communication
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
    ('Eric', 'Royer', 'Eric Royer', 'eric@manao-communication.com', '''+33 6 61 97 37 34', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Manao Communication'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Digital Art Studio
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
    ('Matthew', 'Lole', 'Matthew Lole', 'enquiries@digitalart-studio.co.uk', '024 76511440', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Digital Art Studio'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: UKTI Brazil
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
    ('''Erika.azevedo@,', 'fco.gov.uk''', '''Erika.azevedo@, fco.gov.uk''', 'erika.azevedo@fco.gov.uk', '''+55 11 3094 2748', 'subscribed'),
    ('''Rafael.Konig@f,', 'co.gov.uk''', '''Rafael.Konig@f, co.gov.uk''', 'rafael.konig@fco.gov.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('UKTI Brazil'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Eileen Sissons
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
    ('esissons@ups.co,', 'm', 'esissons@ups.co, m', 'esissons@ups.com', '0115 9716049', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Eileen Sissons'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Kennet Equipment Leasing
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
    ('Gary', 'Barker', 'Gary Barker', 'gary.barker@kennet-leasing.co.uk', '01675 469254', 'subscribed'),
    ('Richard', 'Nelson', 'Richard Nelson', 'richard.nelson@kennet-leasing.co.uk', '07540 952358', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Kennet Equipment Leasing'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Marketing Answers and Solutions
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
    ('Gary', 'Perkins', 'Gary Perkins', 'gary@marketinganswers.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Marketing Answers and Solutions'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Gandamar O.A. & Business Solutions
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
    ('Gasper', 'Kay', 'Gasper Kay', 'gasperkay@gandamar-mm.com', '9.59971E+11', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Gandamar O.A. & Business Solutions'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Sappi
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
    ('GE', 'Gobbens', 'GE Gobbens', 'ge.gobbens@sappi.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Sappi'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Editions & Impressions du Pacifique
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
    ('Gerard', 'Launay', 'Gerard Launay', 'gerard@eip-noumea.nc', '687271650', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Editions & Impressions du Pacifique'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Scantron
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
    ('Greg', 'Maitrejean', 'Greg Maitrejean', 'greg.maitrejean@scantron.com', '001 703 662 8017', 'subscribed'),
    ('Jim', 'Mason', 'Jim Mason', 'jim.mason@scantron.com', '001 703 342 0146', 'subscribed'),
    ('Marty', 'Evans', 'Marty Evans', 'marty.evans@scantron.com', '001 703.342.0108', 'subscribed'),
    ('Sam', 'Harris', 'Sam Harris', 'sam.harris@scantron.com', '001 801.390.1761', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Scantron'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Dardedze Holografija
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
    ('Guntis', 'Vucens', 'Guntis Vucens', 'guntis@dardedze.lv', '''+371 29 23 44 39', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Dardedze Holografija'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Poligrafijas grupa Mukusala Ltd.
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
    ('Guntis', 'Ruzulis', 'Guntis Ruzulis', 'guntis_ruzulis@pgm.lv', '''+371 29410644', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Poligrafijas grupa Mukusala Ltd.'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Morvan Trading Ltd
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
    ('Guy', 'Eves', 'Guy Eves', 'guy@morvantrading.com', '''+44 (0) 1264 353489', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Morvan Trading Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Prior Analytics Ltd
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
    ('Hannah', NULL, 'Hannah', 'hannah@prior-analytics.com', '07704 530 362', 'subscribed'),
    ('Brian', 'Coome', 'Brian Coome', 'support@prior-analytics.com', '0345 6588 121', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Prior Analytics Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Leicester City Football Club
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
    ('Harj', 'Hir', 'Harj Hir', 'harj.hir@lcfc.co.uk', '0116 229 4422', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Leicester City Football Club'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Dale Studios (Leicester) Ltd
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
    ('Adrian', 'Wagemakers', 'Adrian Wagemakers', 'adrian@dalestudios.co.uk', '0116 270 9975', 'subscribed'),
    ('Colin', 'Baxter', 'Colin Baxter', 'colin@dalestudios.co.uk', NULL, 'subscribed'),
    ('Harriet', NULL, 'Harriet', 'harriet@dalestudios.co.uk', NULL, 'subscribed'),
    ('Heather', 'Langton', 'Heather Langton', 'heather@dalestudios.co.uk', '0116 270 9975', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Dale Studios (Leicester) Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: One Line Designs
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
    ('Jamie', NULL, 'Jamie', 'hello@onelinedesigns.co.uk', '0116 4312893', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('One Line Designs'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Fulcio Marketing
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
    ('Iain', 'Irvin', 'Iain Irvin', 'iain@talk2fm.com', '0191 389 8324, 0191 229 9562', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Fulcio Marketing'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: IB Engineering Consultants Ltd
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
    ('Ian', 'Burton', 'Ian Burton', 'ian.burton@ibengineering.co.uk', '07971058344', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('IB Engineering Consultants Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Pro Tech
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
    ('Ian', NULL, 'Ian', 'ian@pro-techcnc.co.uk', '01455 299003, 07713862520', 'subscribed'),
    ('Steven', 'Hatcher', 'Steven Hatcher', 'info@pro-techcnc.co.uk', '07725 233188', 'subscribed'),
    ('Mat', 'de Bres', 'Mat de Bres', 'mat.debres@pro-techcnc.co.uk', '01455 299003', 'subscribed'),
    ('Matt', 'Betteridge', 'Matt Betteridge', 'matt.betteridge@pro-techcnc.co.uk', '01455 299003, 07713862520', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Pro Tech'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: CLAUDIA F. BARONE & ASOC. S.R.L.
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
    ('Natalia', 'Matsuo', 'Natalia Matsuo', 'importaciones@estudiocfbarone.com.ar', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('CLAUDIA F. BARONE & ASOC. S.R.L.'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Barwell Embroidery Ltd
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
    ('Paul', NULL, 'Paul', 'info@barwellembroidery.co.uk', '01455 844960', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Barwell Embroidery Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: China Business Services
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
    ('info@cbbc.org', NULL, 'info@cbbc.org', 'info@cbbc.org', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('China Business Services'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Dempac Packaging
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
    ('Karen', 'Braithwaite', 'Karen Braithwaite', 'info@dempac.co.uk', '0116 284 4820', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Dempac Packaging'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Oriental Group Holding
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
    ('Mohamed', 'Issa Al Zeera', 'Mohamed Issa Al Zeera', 'info@orientalpress.com', '1750 1000', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Oriental Group Holding'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Principal Business Finance
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
    ('James', 'Bremridge', 'James Bremridge', 'info@principalbusinessfinance.co.uk', '07398123368', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Principal Business Finance'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: TeknologTryck
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
    ('Rasmus', 'Redeborn', 'Rasmus Redeborn', 'info@teknologtryck.se', '''+46 31 81 40 17', 'subscribed'),
    ('Albin', 'Olsson', 'Albin Olsson', 'albin.olsson@me.com', '0761314191', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('TeknologTryck'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Department for International Trade
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
    ('Sir/Madam', NULL, 'Sir/Madam', 'info@tradeem.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Department for International Trade'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Westerby Investment Management Ltd
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
    ('Stephen', 'Harvey', 'Stephen Harvey', 'info@westerby.co.uk', '0116 247 0304', 'subscribed'),
    ('Sean', 'Harriman', 'Sean Harriman', 'seanharriman@westerby.co.uk', '07495 910 129', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Westerby Investment Management Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Specialised Blade & Tool Ltd
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
    ('Jonathan', 'Eades', 'Jonathan Eades', 'j.r.eades@specialised-blade-tool.co.uk', '01709 559944', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Specialised Blade & Tool Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Sage
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
    ('James', 'Caddies', 'James Caddies', 'james.caddies@sage.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Sage'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Hitachi Capital Business Finance
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
    ('Jack', 'Fletcher', 'Jack Fletcher', 'jack.fletcher@spireassetfunding.co.uk', '01246 264957', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Hitachi Capital Business Finance'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: T2 Display Ltd
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
    ('James', 'Rowlands', 'James Rowlands', 'james@t2display.com', '02476 398 922', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('T2 Display Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Caps Cases Ltd
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
    ('Jamie', 'Bissett', 'Jamie Bissett', 'jamie@capscases.co.uk', '07793 212 387', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Caps Cases Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Compass Business Finance
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
    ('Danny', 'Simpson', 'Danny Simpson', 'danny@compassbusinessfinance.co.uk', '07870 506168', 'subscribed'),
    ('Jamie', 'Nelson', 'Jamie Nelson', 'jamie@compassbusinessfinance.co.uk', '07793 528980', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Compass Business Finance'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Vanguard Logisitic Services Ltd
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
    ('Jason', 'Burridge', 'Jason Burridge', 'jason.burridge@vanguardlogistics.co.uk', '01942 685 171', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Vanguard Logisitic Services Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Cromwell Clothing
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
    ('''jason.pochin@c,', 'romwellsaftey.co.uk''', '''jason.pochin@c, romwellsaftey.co.uk''', 'jason.pochin@cromwellsafety.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Cromwell Clothing'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Creative Marketing Communications
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
    ('Jim', 'Bower', 'Jim Bower', 'jim@jimbower.net', '07855 856953', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Creative Marketing Communications'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Straight Shooter Equipment Company
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
    ('Jim', 'Kaiping', 'Jim Kaiping', 'jkaiping@feedstraight.com', '(314)486-3080', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Straight Shooter Equipment Company'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Flynn Cargo
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
    ('John', 'Walker', 'John Walker', 'john.walker@flynncargo.com', '01622 752020', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Flynn Cargo'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ab (folding) Rollers Ltd
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
    ('John', 'Belton', 'John Belton', 'john@abrollers.co.uk', '01582945755', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ab (folding) Rollers Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Product Approvals Ltd
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
    ('John', 'Showell', 'John Showell', 'john@productapprovals.co.uk', '''+44 (0)1588 620192', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Product Approvals Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Accentika
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
    ('Jonathan', 'Campbell', 'Jonathan Campbell', 'jonathan.campbell@accentikainternet.co.uk', '01905 828213', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Accentika'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: UKTI Paris
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
    ('''Justine.Barker,', '@fco.gov.uk''', '''Justine.Barker, @fco.gov.uk''', 'justine.barker@fco.gov.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('UKTI Paris'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Brookstone Creative Ltd
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
    ('Karen', 'Cox', 'Karen Cox', 'karen@brookstonecreative.co.uk', '07712432873', 'subscribed'),
    ('Philip', 'Noon', 'Philip Noon', 'philip@brookstonecreative.co.uk', '01455 561 561', 'subscribed'),
    ('Richard', 'Stinson', 'Richard Stinson', 'richard@brookstonecreative.co.uk', '01455 561 561', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Brookstone Creative Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Quality Freight
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
    ('Katherine', 'Horgan', 'Katherine Horgan', 'katherine@qualityfreight.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Quality Freight'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Clear Asset Finance Ltd
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
    ('Katie', 'Dowse', 'Katie Dowse', 'katie.dowse@clearaf.co.uk', '07854 413909', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Clear Asset Finance Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Express Taxis
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
    ('Kevin', 'Park', 'Kevin Park', 'kevin.express@btconnect.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Express Taxis'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: BT Local Business
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
    ('Kevin', 'Wright', 'Kevin Wright', 'kevin.wright@btlocalbusiness.co.uk', '0115 9694555, 07501 461802', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('BT Local Business'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Sapcote Engineering Ltd
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
    ('Kevin', 'Kirk', 'Kevin Kirk', 'kevin@sapcote-engineering.co.uk', '07711057672', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Sapcote Engineering Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Adstorm
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
    ('Laura', 'Jones', 'Laura Jones', 'laura.jones@adstorm.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Adstorm'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Supreme Tools
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
    ('Barry', 'March', 'Barry March', 'barry.march@supremetools.co.uk', '07904 525953', 'subscribed'),
    ('Leon', 'Henshaw', 'Leon Henshaw', 'leon.henshaw@supremetools.co.uk', '01827 711788', 'subscribed'),
    ('Dave', 'Grimley', 'Dave Grimley', 'sales@supremetools.co.uk', '01827 711788', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Supreme Tools'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: TNT International
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
    ('Lianne', 'Dutton', 'Lianne Dutton', 'lianne.dutton@tnt.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('TNT International'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Wells McFarlane
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
    ('Lindsey', 'Aldridge', 'Lindsey Aldridge', 'lindsey@wellsmcfarlane.co.uk', '01455 559030, 07730 659887', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Wells McFarlane'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: SnapWebDesign
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
    ('Lloyd', 'Spencer', 'Lloyd Spencer', 'lloyd@thesnapagency.com, lloyd@snapwebdesign.co.uk', '07540 383 462', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('SnapWebDesign'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Dscoop
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
    ('Lauren', 'Robinson', 'Lauren Robinson', 'lrobinson@dscoop.org', '07787 597 332', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Dscoop'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Julie Price & Co Ltd
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
    ('Julie', 'Price', 'Julie Price', 'mail@julieprice.co.uk', '01455 230707', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Julie Price & Co Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: PSL Freight Ltd
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
    ('Mark', 'Boggis', 'Mark Boggis', 'mark.boggis@pslgroup.net', '''+44 (0) 7736 128244', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('PSL Freight Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: GBH Exhibition Forwarding Ltd
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
    ('Mark', 'Saxton', 'Mark Saxton', 'mark@gbhforwarding.com', '''+44 7739 635036', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('GBH Exhibition Forwarding Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Design and Print Store
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
    ('Mark', 'Murphy', 'Mark Murphy', 'markmurphy@designandprint.store', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Design and Print Store'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: 1 Point 3
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
    ('Martin', 'Wofinden', 'Martin Wofinden', 'martin@1point3.co.uk', '0757 9051824', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('1 Point 3'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Advanced Mould Tooling
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
    ('Martin', NULL, 'Martin', 'martin@amt-limited.co.uk', '01162442766', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Advanced Mould Tooling'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Co-op Events
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
    ('Martin', 'Morrissey', 'Martin Morrissey', 'martin@marketingalchemyeurope.com', '07802 433 125', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Co-op Events'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Pro Tech
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
    ('Ian', NULL, 'Ian', 'ian@pro-techcnc.co.uk', '01455 299003, 07713862520', 'subscribed'),
    ('Steven', 'Hatcher', 'Steven Hatcher', 'info@pro-techcnc.co.uk', '07725 233188', 'subscribed'),
    ('Mat', 'de Bres', 'Mat de Bres', 'mat.debres@pro-techcnc.co.uk', '01455 299003', 'subscribed'),
    ('Matt', 'Betteridge', 'Matt Betteridge', 'matt.betteridge@pro-techcnc.co.uk', '01455 299003, 07713862520', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Pro Tech'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Quiet Storm Solutions Ltd
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
    ('Matt', 'Mansfield', 'Matt Mansfield', 'matt.mansfield@quiet-storm.net', '0845 330 8326', 'subscribed'),
    ('Scott', 'Benzie', 'Scott Benzie', 'online@quiet-storm.net', '0845 330 8326', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Quiet Storm Solutions Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Watermans Printers
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
    ('Wan', 'Waterman', 'Wan Waterman', 'wan@watermansprinters.ie', '''+353 (0) 21 435 4588', 'subscribed'),
    ('Matt', NULL, 'Matt', 'matt@watermansprinters.ie', '''+353 (0) 21 435 4588', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Watermans Printers'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Datamail Distribution
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
    ('Maxine', NULL, 'Maxine', 'maxine@datamail.co.uk', '0116 2697081', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Datamail Distribution'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: MJB Survey Services
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
    ('Mbrice1', NULL, 'Mbrice1', 'mbrice1@talktalk.net', '07940 312 349', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('MJB Survey Services'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Sappi (UK) Sales Office Ltd,
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
    ('Haselton,', 'Mike', 'Haselton, Mike', 'mike.haselton@sappi.com', '''+44 (0) 7765 257046', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Sappi (UK) Sales Office Ltd,'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Mas Belting Services
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
    ('Mike', 'Smith', 'Mike Smith', 'mike@masbeltingservices.co.uk', '07512 767948', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Mas Belting Services'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Gulf Print & Pack
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
    ('Mike', 'Simmonds', 'Mike Simmonds', 'msimmonds@tarsus.co.uk', '''+44 (0) 20 8846 2739', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Gulf Print & Pack'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Product Solutions Ltd
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
    ('Nadia', 'Hendel', 'Nadia Hendel', 'nadia@pro-solutions.co.uk', '0116 239 33 30', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Product Solutions Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Business Design Centre,
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
    ('Natalie', 'Prew', 'Natalie Prew', 'nataliep@businessdesigncentre.co.uk', '0207 288 6606', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Business Design Centre,'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: 42 Technology Ltd
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
    ('Nick', 'Scott', 'Nick Scott', 'nick.scott@42technology.com', '01480 302700', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('42 Technology Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Inkjet & Printing Supplies lTD
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
    ('Nick', 'Hart', 'Nick Hart', 'nick@ijps.co.uk', '''+44(0)7951093486', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Inkjet & Printing Supplies lTD'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Connolly Creative
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
    ('Nicola', 'Connolly', 'Nicola Connolly', 'nicola@connollycreative.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Connolly Creative'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Bearing Centre Ltd
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
    ('Paul', ' Yates', 'Paul  Yates', 'odpf@1yahoo.com', '0116 2884146', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Bearing Centre Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Associated Pallets Ltd
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
    ('Darren', 'Shawyer', 'Darren Shawyer', 'orders@associated-pallets.co.uk', '08000 288 655', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Associated Pallets Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Pallet & Recycling Sales Ltd
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
    ('Debbie', NULL, 'Debbie', 'palletrecyclingsales@gmail.com', '01455 556997', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Pallet & Recycling Sales Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Academy Leasing
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
    ('Paul', 'Horan', 'Paul Horan', 'paul.horan@academy-leasing.co.uk', '01942408520', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Academy Leasing'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Cognition
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
    ('Paul', 'Houston', 'Paul Houston', 'paul.h@cognitionagency.co.uk', '07814 395136', 'subscribed'),
    ('Sarah', 'Groves', 'Sarah Groves', 'sarah.g@cognitionagency.co.uk', '01926 330800', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Cognition'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Lindsey Press & Graphics
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
    ('Paul', 'Grehan', 'Paul Grehan', 'paul@lindseypress.ie', '(086)240-8119', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Lindsey Press & Graphics'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Parkway Computer Services
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
    ('Paul', NULL, 'Paul', 'paul@parkwaycomputers.co.uk', '01455 286202, 07814 275883 (Paul)', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Parkway Computer Services'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: SerJeants
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
    ('Peter', 'Smith', 'Peter Smith', 'peter@serjeants.co.uk', '0116 2332626', 'subscribed'),
    ('P', 'J Smith', 'P J Smith', 'pjsmith@serjeants.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('SerJeants'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Polly's Posh Nosh
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
    ('Polly', 'Tedds', 'Polly Tedds', 'pollytedds@googlemail.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Polly''s Posh Nosh'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Serjeants
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
    ('Peter', 'Smith', 'Peter Smith', 'peter@serjeants.co.uk', '0116 2332626', 'subscribed'),
    ('P', 'J Smith', 'P J Smith', 'pjsmith@serjeants.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Serjeants'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Golden Tuplip
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
    ('''pp.reservas@go,', 'ldentulip.com.br''', '''pp.reservas@go, ldentulip.com.br''', 'pp.reservas@goldentulip.com.br', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Golden Tuplip'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: CGP Engineering Ltd
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
    ('Richard', 'Parker', 'Richard Parker', 'richard@cgp-engineering.com', '0116 271 7715', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('CGP Engineering Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Hubspot
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
    ('Seán', 'Giles', 'Seán Giles', 'sgiles@hubspot.com', '''+3531 518 7529', 'subscribed'),
    ('Rebecca', 'Murray', 'Rebecca Murray', 'rmurray@hubspot.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Hubspot'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Approach Print Ltd
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
    ('Rob', 'Clark', 'Rob Clark', 'rob.clark@approach-ps.com', '07807 611894', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Approach Print Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Simple Secure Finance
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
    ('Robert', 'Gilks', 'Robert Gilks', 'robert@simplesecurefinance.co.uk', '07395 285 025', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Simple Secure Finance'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Sappi (Paper Company)
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
    ('Robin', 'Sponder', 'Robin Sponder', 'robin.sponder@sappi.com', '07887947216', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Sappi (Paper Company)'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Grafica Rocha
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
    ('Rodrigo', 'Rocha', 'Rodrigo Rocha', 'rodrigo@graficarocha.com.br', '5.549E+12', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Grafica Rocha'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Creative Marketing Environments Ltd,
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
    ('Roger', 'De''Ath', 'Roger De''Ath', 'roger@cme.uk.com', '07530 101140', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Creative Marketing Environments Ltd,'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Exakta
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
    ('Roland', 'Svensson', 'Roland Svensson', 'roland.svensson@exakta.se', '''+46 708-88 59 70', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Exakta'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Spaudos Konturai UAB
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
    ('Raimundas', 'Savukynas', 'Raimundas Savukynas', 'rs@s-k.lt', '''+370 5 210 67 00', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Spaudos Konturai UAB'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Brookfield Signs Ltd
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
    ('Jamie', NULL, 'Jamie', 'sales@brookfieldsigns.co.uk', '01455 234123', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Brookfield Signs Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Aerial - Ace Connections Ltd
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
    ('Aerial', '- Ace Connections Ltd', 'Aerial - Ace Connections Ltd', 'sales@aceconnections.co.uk', '01455 559550', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Aerial - Ace Connections Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Fosse Bearing Units Ltd
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
    ('Dave', NULL, 'Dave', 'sales@fosse-bearings.co.uk', '0116 260 5949', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Fosse Bearing Units Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Venue Options Limited
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
    ('Laura', 'Hillhouse', 'Laura Hillhouse', 'sales@venueoptions.com', '07803502227', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Venue Options Limited'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Ohs Comms
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
    ('Sarah', 'McTear-Smith', 'Sarah McTear-Smith', 'sarah@ohscomms.co.uk', '03333 660 770', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Ohs Comms'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Sapcote Engineering
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
    ('Sean', NULL, 'Sean', 'sean@sapcote-engineering.co.uk', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Sapcote Engineering'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Cure Logistics
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
    ('Vince', NULL, 'Vince', 'service@curelogistics.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Cure Logistics'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: S & G Precision Engineers
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
    ('Shaun', NULL, 'Shaun', 'sean@sandjprecision.co.uk', '01455 844004', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('S & G Precision Engineers'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Engineering Solutions
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
    ('Sean', 'Maguire', 'Sean Maguire', 'sean@sapcote-engineering.co.uk', '01455 284 888', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Engineering Solutions'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Robatech Gluing Solutions
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
    ('Shaun', 'Baker', 'Shaun Baker', 'shaun.baker@whleary.co.uk', '07957 979 194', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Robatech Gluing Solutions'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Further
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
    ('Shelli', 'Wright', 'Shelli Wright', 'shelli@further.co.uk', '''+44 (0)7545 400 796', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Further'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Shire Leasing Plc
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
    ('Sophie', 'Edwards', 'Sophie Edwards', 'sophie.edwards@shireleasing.co.uk', '01827 68939', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Shire Leasing Plc'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: The Core Asset
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
    ('Steve', 'Hackney', 'Steve Hackney', 'steve@thecoreasset.com', '0844 4488992', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('The Core Asset'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Weblark Engineering Ltd
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
    ('Steve', 'Hargreaves', 'Steve Hargreaves', 'steve@weblark.co.uk', '01455 442995', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Weblark Engineering Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: International Trade Shows Link Ltd
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
    ('Brigitte', 'Shepherd', 'Brigitte Shepherd', 'brigitte@itsluk.com', NULL, 'subscribed'),
    ('Heather', 'Abrahall', 'Heather Abrahall', 'heather@itsluk.com', '01564 781868, 01564 781871', 'subscribed'),
    ('Stuart', 'Whitehill', 'Stuart Whitehill', 'stuart@itsluk.com', '01442 230 033, 01442 288 299', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('International Trade Shows Link Ltd'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: National Examination Centre
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
    ('Toni', 'Bizjak', 'Toni Bizjak', 'toni.bizjak@ric.si', '''+386 41 799 154', 'subscribed'),
    ('Anton', 'Bizjak', 'Anton Bizjak', 'toni.bizjak@ric.si', '''+386 41 799 154', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('National Examination Centre'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Progressive Greetings Live
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
    ('''Louise@progres,', 'sivegreetingslive.com''', '''Louise@progres, sivegreetingslive.com''', 'vanessa@progressivegreetingslive.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Progressive Greetings Live'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Best Western
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
    ('Maxime', 'Effrancey', 'Maxime Effrancey', 'ventes@hotel-chavannes.ch', '''+41 (0) 22960 8181, +41 (0) 22960 8162', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Best Western'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: VP Sevices
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
    ('Vic', 'Pomadi', 'Vic Pomadi', 'vp.services@btconnect.com', '01455 619676, 07799451184', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('VP Sevices'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Fespa
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
    ('William', 'Khabbaz', 'William Khabbaz', 'william.khabbaz@fespa.com', '07429 543 250', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Fespa'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Wistow Bistro
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
    ('Jane', 'Clifford', 'Jane Clifford', 'wistow@uwclub.net', '0116 2593756', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Wistow Bistro'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: UK Trade & Investment - Japan
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
    ('Yukiyo', '.Miyakita, @fco.gov.uk', 'Yukiyo .Miyakita, @fco.gov.uk', 'yukiyo.miyakita@fco.gov.uk', '''+81 3 5211 1169', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('UK Trade & Investment - Japan'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Gestelit Print House
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
    ('Yuval', 'Kamhi', 'Yuval Kamhi', 'yuval@gestelit.co.il', '''+972 54 4341191', 'subscribed'),
    ('Simhon', 'Ohana', 'Simhon Ohana', 'simhon@gestelit.co.il', '''+972 1-700-70-80-66', 'subscribed'),
    ('Galit', 'Kamhi', 'Galit Kamhi', 'galit@gestelit.co.il', '''+972 54 4341191', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Gestelit Print House'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Mediaprint shpk
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
    ('Zamir', 'Vela', 'Zamir Vela', 'zamirvela@mediaprint.al', '''+355 (0) 69 20 79 021', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Mediaprint shpk'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Kerry McKee
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
    ('Kerry', 'McKee', 'Kerry McKee', 'kerry@els.lease', '0116 389 3839', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Kerry McKee'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Kevin Hogan
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
    ('Kevin', 'Hogan', 'Kevin Hogan', 'kevin.hogan@printcheckgroup.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Kevin Hogan'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Guilherme Lupatini
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
    ('Guilherme', 'Lupatini', 'Guilherme Lupatini', 'guilherme@lupagraf.com.br', '''+55 51 8188-2449', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Guilherme Lupatini'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Matt Watson
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
    ('Matt', 'Watson', 'Matt Watson', 'matt.watson@havashelia.com', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Matt Watson'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Typhaine Laborde
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
    ('Typhaine', 'Laborde', 'Typhaine Laborde', 'typhaine_laborde@hotmail.fr', '07852 880637', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Typhaine Laborde'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Nicole Negreanu
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
    ('Nicole', 'Negreanu', 'Nicole Negreanu', 'nnegreanu@noos.fr', NULL, 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Nicole Negreanu'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



-- Contacts for: Simarco International
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
    ('Sara', 'Kelsall', 'Sara Kelsall', 'sara.kelsall@simarco.com', '01782 831248', 'subscribed')
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM('Simarco International'))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );



