/**
 * Generate final import SQL with phone numbers and correct ownership
 */

const fs = require('fs');

// Read the parsed data
const data = JSON.parse(fs.readFileSync('pipedrive-import-data.json', 'utf-8'));

console.log(`Loaded ${data.companies.length} companies with ${data.companies.reduce((sum, c) => sum + c.contacts.length, 0)} contacts`);

// SQL escape function
function sqlEscape(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Generate SQL for companies with phone support
const companiesByBatch = [];
const batchSize = 100;

for (let i = 0; i < data.companies.length; i += batchSize) {
  const batch = data.companies.slice(i, i + batchSize);

  const values = batch.map(c => {
    // Get phone from first contact if available
    const phone = c.contacts.length > 0 && c.contacts[0].phone ? c.contacts[0].phone : null;

    // Set account_owner to NULL for prospects (user will assign)
    return `(${sqlEscape(c.company_name)}, ${sqlEscape(c.type)}, ${sqlEscape(c.source)}, ${sqlEscape(c.country)}, 'active', NULL, ${sqlEscape(phone)})`;
  }).join(',\n  ');

  const sql = `
-- Batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(data.companies.length / batchSize)}
INSERT INTO companies (company_name, type, source, country, status, account_owner, phone)
SELECT * FROM (VALUES
  ${values}
) AS v(company_name, type, source, country, status, account_owner, phone)
WHERE NOT EXISTS (
  SELECT 1 FROM companies
  WHERE LOWER(TRIM(companies.company_name)) = LOWER(TRIM(v.company_name))
);
`;

  companiesByBatch.push(sql);
}

// Save company import SQL
fs.writeFileSync('import-companies-final.sql', companiesByBatch.join('\n\n'));
console.log(`Generated ${companiesByBatch.length} batches of company INSERT statements with phones`);

// Generate contacts SQL (already has phone support)
const contactsByCompany = {};

for (const company of data.companies) {
  if (company.contacts.length > 0) {
    contactsByCompany[company.company_name] = company.contacts;
  }
}

const contactsSqlBatches = [];

for (const [companyName, contacts] of Object.entries(contactsByCompany)) {
  const values = contacts.map(c => {
    return `(${sqlEscape(c.first_name)}, ${sqlEscape(c.last_name)}, ${sqlEscape(c.full_name)}, ${sqlEscape(c.email)}, ${sqlEscape(c.phone)}, 'subscribed')`;
  }).join(',\n    ');

  const sql = `
-- Contacts for: ${companyName}
INSERT INTO contacts (company_id, first_name, last_name, full_name, email, phone, marketing_status)
SELECT
  c.company_id,
  v.first_name,
  v.last_name,
  v.full_name,
  v.email,
  v.phone,
  v.marketing_status
FROM (VALUES
    ${values}
) AS v(first_name, last_name, full_name, email, phone, marketing_status)
CROSS JOIN companies c
WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM(${sqlEscape(companyName)}))
  AND NOT EXISTS (
    SELECT 1 FROM contacts
    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))
  );
`;

  contactsSqlBatches.push(sql);
}

fs.writeFileSync('import-contacts-final.sql', contactsSqlBatches.join('\n\n'));
console.log(`Generated ${contactsSqlBatches.length} contact INSERT statements with phones`);

console.log('\n✅ Files generated:');
console.log('1. import-companies-final.sql (with phone, account_owner=NULL)');
console.log('2. import-contacts-final.sql (with phone)');
console.log('\nReady for Phase 1 import!');
