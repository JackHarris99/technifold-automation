/**
 * Execute Pipedrive import via SQL
 * Reads parsed data and generates INSERT statements
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

// Generate SQL for companies
const companiesByBatch = [];
const batchSize = 100;

for (let i = 0; i < data.companies.length; i += batchSize) {
  const batch = data.companies.slice(i, i + batchSize);

  const values = batch.map(c => {
    return `(${sqlEscape(c.company_name)}, ${sqlEscape(c.type)}, ${sqlEscape(c.lead_status)}, ${c.lead_score}, ${sqlEscape(c.country)}, ${sqlEscape(c.source)}, ${sqlEscape(c.notes)}, ${sqlEscape(c.status)})`;
  }).join(',\n  ');

  const sql = `
-- Batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(data.companies.length / batchSize)}
INSERT INTO companies (company_name, type, lead_status, lead_score, country, source, notes, status)
SELECT * FROM (VALUES
  ${values}
) AS v(company_name, type, lead_status, lead_score, country, source, notes, status)
WHERE NOT EXISTS (
  SELECT 1 FROM companies
  WHERE LOWER(TRIM(companies.company_name)) = LOWER(TRIM(v.company_name))
);
`;

  companiesByBatch.push(sql);
}

// Save company import SQL
fs.writeFileSync('import-companies.sql', companiesByBatch.join('\n\n'));
console.log(`Generated ${companiesByBatch.length} batches of company INSERT statements`);

// Now generate contacts SQL
// This is more complex because we need to:
// 1. Look up the company_id for each contact's company
// 2. Check for duplicate emails

const contactsByCompany = {};

for (const company of data.companies) {
  if (company.contacts.length > 0) {
    contactsByCompany[company.company_name] = company.contacts;
  }
}

// Generate INSERT for each company's contacts
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

fs.writeFileSync('import-contacts.sql', contactsSqlBatches.join('\n\n'));
console.log(`Generated ${contactsSqlBatches.length} contact INSERT statements`);

console.log('\nNext steps:');
console.log('1. Execute: import-companies.sql');
console.log('2. Execute: import-contacts.sql');
