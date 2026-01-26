-- Batch 1
INSERT INTO companies (company_name, type, source, country, status, account_owner, phone)
SELECT * FROM (VALUES
  ('Eye On Display', 'press', 'pipedrive_import_2025', 'England', 'active', NULL, '07966 661196'),
  ('Print Monthly', 'press', 'pipedrive_import_2025', 'England', 'active', NULL, '0117 9603255'),
  ('m.seidl@pp-europe.eu', 'press', 'pipedrive_import_2025', 'Germany', 'active', NULL, NULL),
  ('Argentina Grafica Cromatica', 'press', 'pipedrive_import_2025', NULL, 'active', NULL, NULL),
  ('Hanmail', 'press', 'pipedrive_import_2025', 'South Korea', 'active', NULL, NULL),
  ('Banas', 'press', 'pipedrive_import_2025', 'Brazil', 'active', NULL, NULL),
  ('Journalisten', 'press', 'pipedrive_import_2025', 'Denmark', 'active', NULL, NULL),
  ('Matbaa&teknik', 'press', 'pipedrive_import_2025', 'Turkey', 'active', NULL, NULL),
  ('Manstein1', 'press', 'pipedrive_import_2025', NULL, 'active', NULL, NULL),
  ('Print&Media Publishing Oy', 'press', 'pipedrive_import_2025', 'Finland', 'active', NULL, NULL),
  ('Printweek UK', 'press', 'pipedrive_import_2025', 'England', 'active', NULL, '020 7738 5454, 020 7501 6680'),
  ('Publish.ru', 'press', 'pipedrive_import_2025', 'Russia', 'active', NULL, NULL),
  ('Whitmar Publications�', 'press', 'pipedrive_import_2025', 'England', 'active', NULL, '07792 037780'),
  ('Polimag', 'press', 'pipedrive_import_2025', 'Russia', 'active', NULL, NULL),
  ('PolyMedia', 'press', 'pipedrive_import_2025', 'Switzerland', 'active', NULL, NULL),
  ('Prepress_OP', 'press', 'pipedrive_import_2025', 'Bulgaria', 'active', NULL, NULL),
  ('Publisher.ch', 'press', 'pipedrive_import_2025', 'Switzerland', 'active', NULL, NULL),
  ('Smedia Group', 'press', 'pipedrive_import_2025', 'India', 'active', NULL, NULL),
  ('Printing Expo Virtual Exhibition', 'press', 'pipedrive_import_2025', 'England', 'active', NULL, NULL),
  ('Link Publishing/Print Show', 'press', 'pipedrive_import_2025', 'England', 'active', NULL, '01179 805049'),
  ('Sign Update & Image Reports', 'press', 'pipedrive_import_2025', 'England', 'active', NULL, '01622 699 182')
) AS v(company_name, type, source, country, status, account_owner, phone)
WHERE NOT EXISTS (
  SELECT 1 FROM companies
  WHERE LOWER(TRIM(companies.company_name)) = LOWER(TRIM(v.company_name))
);



