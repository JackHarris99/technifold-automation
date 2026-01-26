#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read and parse the Pipedrive organizations CSV
const orgsCsv = fs.readFileSync('organizations-12875790-9.csv', 'utf8');
const peopleCsv = fs.readFileSync('people-12875790-8.csv', 'utf8');

// Simple CSV parser
function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.replace(/^"|"$/g, '') || '';
    });
    rows.push(row);
  }

  return rows;
}

const organizations = parseCSV(orgsCsv);
const people = parseCSV(peopleCsv);

console.log(`📊 Parsed ${organizations.length} organizations and ${people.length} people\n`);

// Filter by type
const dealers = [];
const press = [];
const suppliers = [];

for (const org of organizations) {
  const name = org['Organisation - Name'];
  const label = org['Organisation - Labels'] || '';
  const owner = org['Organisation - Owner'] || '';
  const address = org['Organisation - Address'] || '';

  if (!name) continue;

  // Parse country from address
  const addressParts = address.split(',').map(s => s.trim());
  const country = addressParts.length > 0 ? addressParts[addressParts.length - 1] : null;

  const orgData = {
    name,
    label,
    owner,
    address,
    country
  };

  if (label.toLowerCase().includes('dealer')) {
    dealers.push(orgData);
  } else if (label.toLowerCase().includes('press')) {
    press.push(orgData);
  } else if (label.toLowerCase().includes('supplier')) {
    suppliers.push(orgData);
  }
}

console.log('📋 Organization Counts:');
console.log(`  Dealers (→ Distributors): ${dealers.length}`);
console.log(`  Press: ${press.length}`);
console.log(`  Suppliers: ${suppliers.length}`);
console.log('');

// Get contacts for each organization
function getContactsForOrg(orgName) {
  const contacts = [];

  for (const person of people) {
    const personOrg = person['Person - Organisation'];
    if (personOrg && personOrg.toLowerCase() === orgName.toLowerCase()) {
      const emails = [
        person['Person - Email - Work'],
        person['Person - Email - Home'],
        person['Person - Email - Other']
      ].filter(e => e && e.trim());

      const phones = [
        person['Person - Phone - Mobile'],
        person['Person - Phone - Work'],
        person['Person - Phone - Home'],
        person['Person - Phone - Other']
      ].filter(p => p && p.trim());

      const fullName = person['Person - Name'] || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || null;

      // One contact per unique email
      for (const email of emails) {
        const phone = phones[0] || null;
        contacts.push({
          firstName: firstName || email.split('@')[0],
          lastName: lastName || null,
          fullName: fullName || email.split('@')[0],
          email,
          phone
        });
      }
    }
  }

  return contacts;
}

// Process each type
const dealersWithContacts = dealers.map(d => ({
  ...d,
  contacts: getContactsForOrg(d.name)
}));

const pressWithContacts = press.map(p => ({
  ...p,
  contacts: getContactsForOrg(p.name)
}));

const suppliersWithContacts = suppliers.map(s => ({
  ...s,
  contacts: getContactsForOrg(s.name)
}));

console.log('📧 Contacts Summary:');
console.log(`  Dealer contacts: ${dealersWithContacts.reduce((sum, d) => sum + d.contacts.length, 0)}`);
console.log(`  Press contacts: ${pressWithContacts.reduce((sum, p) => sum + p.contacts.length, 0)}`);
console.log(`  Supplier contacts: ${suppliersWithContacts.reduce((sum, s) => sum + s.contacts.length, 0)}`);
console.log('');

// Save to JSON
const output = {
  dealers: dealersWithContacts,
  press: pressWithContacts,
  suppliers: suppliersWithContacts
};

fs.writeFileSync('pipedrive-phase2-data.json', JSON.stringify(output, null, 2));
console.log('✅ Saved to pipedrive-phase2-data.json');
