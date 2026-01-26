#!/usr/bin/env node
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('pipedrive-phase2-data.json', 'utf8'));

function sqlEscape(value) {
  if (value === null || value === undefined || value === '') return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Generate SQL for each type
function generateSQL(organizations, type, accountOwner = null) {
  let companiesSQL = '';
  let contactsSQL = '';

  const companiesBatch = [];

  for (const org of organizations) {
    const phone = org.contacts.length > 0 && org.contacts[0].phone ? org.contacts[0].phone : null;

    companiesBatch.push(
      `(${sqlEscape(org.name)}, ${sqlEscape(type)}, 'pipedrive_import_2025', ${sqlEscape(org.country)}, 'active', ${sqlEscape(accountOwner)}, ${sqlEscape(phone)})`
    );
  }

  // Companies import (100 per batch)
  for (let i = 0; i < companiesBatch.length; i += 100) {
    const batch = companiesBatch.slice(i, i + 100);

    companiesSQL += `-- Batch ${Math.floor(i / 100) + 1}\n`;
    companiesSQL += `INSERT INTO companies (company_name, type, source, country, status, account_owner, phone)\n`;
    companiesSQL += `SELECT * FROM (VALUES\n`;
    companiesSQL += `  ${batch.join(',\n  ')}\n`;
    companiesSQL += `) AS v(company_name, type, source, country, status, account_owner, phone)\n`;
    companiesSQL += `WHERE NOT EXISTS (\n`;
    companiesSQL += `  SELECT 1 FROM companies\n`;
    companiesSQL += `  WHERE LOWER(TRIM(companies.company_name)) = LOWER(TRIM(v.company_name))\n`;
    companiesSQL += `);\n\n\n\n`;
  }

  // Contacts import
  for (const org of organizations) {
    if (org.contacts.length === 0) continue;

    contactsSQL += `-- Contacts for: ${org.name}\n`;
    contactsSQL += `INSERT INTO contacts (company_id, first_name, last_name, full_name, email, phone, marketing_status)\n`;
    contactsSQL += `SELECT\n`;
    contactsSQL += `  c.company_id,\n`;
    contactsSQL += `  v.first_name,\n`;
    contactsSQL += `  v.last_name,\n`;
    contactsSQL += `  v.full_name,\n`;
    contactsSQL += `  v.email,\n`;
    contactsSQL += `  v.phone,\n`;
    contactsSQL += `  v.marketing_status\n`;
    contactsSQL += `FROM (VALUES\n`;

    const contactValues = org.contacts.map(contact =>
      `    (${sqlEscape(contact.firstName)}, ${sqlEscape(contact.lastName)}, ${sqlEscape(contact.fullName)}, ${sqlEscape(contact.email)}, ${sqlEscape(contact.phone)}, 'subscribed')`
    );

    contactsSQL += contactValues.join(',\n');
    contactsSQL += `\n) AS v(first_name, last_name, full_name, email, phone, marketing_status)\n`;
    contactsSQL += `CROSS JOIN companies c\n`;
    contactsSQL += `WHERE LOWER(TRIM(c.company_name)) = LOWER(TRIM(${sqlEscape(org.name)}))\n`;
    contactsSQL += `  AND NOT EXISTS (\n`;
    contactsSQL += `    SELECT 1 FROM contacts\n`;
    contactsSQL += `    WHERE LOWER(TRIM(contacts.email)) = LOWER(TRIM(v.email))\n`;
    contactsSQL += `  );\n\n\n\n`;
  }

  return { companiesSQL, contactsSQL };
}

console.log('📝 Generating SQL imports...\n');

// Dealers → Distributors (account_owner = 'Jack Harris')
const dealersSQL = generateSQL(data.dealers, 'distributor', 'Jack Harris');
fs.writeFileSync('import-distributors-companies.sql', dealersSQL.companiesSQL);
fs.writeFileSync('import-distributors-contacts.sql', dealersSQL.contactsSQL);
console.log(`✅ Distributors: ${data.dealers.length} companies, ${data.dealers.reduce((s, d) => s + d.contacts.length, 0)} contacts`);

// Press
const pressSQL = generateSQL(data.press, 'press', null);
fs.writeFileSync('import-press-companies.sql', pressSQL.companiesSQL);
fs.writeFileSync('import-press-contacts.sql', pressSQL.contactsSQL);
console.log(`✅ Press: ${data.press.length} companies, ${data.press.reduce((s, p) => s + p.contacts.length, 0)} contacts`);

// Suppliers
const suppliersSQL = generateSQL(data.suppliers, 'supplier', null);
fs.writeFileSync('import-suppliers-companies.sql', suppliersSQL.companiesSQL);
fs.writeFileSync('import-suppliers-contacts.sql', suppliersSQL.contactsSQL);
console.log(`✅ Suppliers: ${data.suppliers.length} companies, ${data.suppliers.reduce((sum, s) => sum + s.contacts.length, 0)} contacts`);

console.log('\n📦 Files created:');
console.log('  - import-distributors-companies.sql');
console.log('  - import-distributors-contacts.sql');
console.log('  - import-press-companies.sql');
console.log('  - import-press-contacts.sql');
console.log('  - import-suppliers-companies.sql');
console.log('  - import-suppliers-contacts.sql');
