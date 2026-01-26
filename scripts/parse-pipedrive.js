/**
 * Parse Pipedrive CSVs and output SQL for import
 */

const fs = require('fs');

// Parse CSV line handling quoted values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

// Map Pipedrive label to lead status
function mapLabelToStatus(label) {
  const lower = (label || '').toLowerCase().trim();
  if (lower.includes('hot')) return 'hot';
  if (lower.includes('warm')) return 'warm';
  if (lower.includes('cold')) return 'cold';
  return 'cold';
}

// Infer name from email
function inferNameFromEmail(email) {
  const localPart = email.split('@')[0];
  const cleaned = localPart.replace(/[._-]/g, ' ').toLowerCase();
  const parts = cleaned.split(' ').filter(Boolean);

  if (parts.length === 0) {
    return { firstName: null, lastName: null, fullName: email };
  }

  const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const lastName = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1) : null;
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;

  return { firstName, lastName, fullName };
}

// Escape SQL string
function sqlEscape(str) {
  if (!str) return null;
  return str.replace(/'/g, "''");
}

// Read CSV files
const orgsFile = fs.readFileSync('/mnt/c/Users/Jack.Harris/technifold-march/organizations-12875790-9.csv', 'utf-8');
const peopleFile = fs.readFileSync('/mnt/c/Users/Jack.Harris/technifold-march/people-12875790-8.csv', 'utf-8');

const orgsLines = orgsFile.split('\n').filter(line => line.trim());
const peopleLines = peopleFile.split('\n').filter(line => line.trim());

console.log(`Found ${orgsLines.length - 1} organizations and ${peopleLines.length - 1} people`);

// Parse organizations
const organizations = new Map();

for (let i = 1; i < orgsLines.length; i++) {
  const values = parseCSVLine(orgsLines[i]);
  const name = values[0];
  const label = values[1] || 'Hot lead';
  const address = values[2] || '';
  const owner = values[7] || '';

  if (name && !label.toLowerCase().includes('customer') && !label.toLowerCase().includes('supplier') && !label.toLowerCase().includes('dealer')) {
    organizations.set(name, { name, label, address, owner });
  }
}

console.log(`Filtered to ${organizations.size} prospect organizations`);

// Parse people
const people = [];

for (let i = 1; i < peopleLines.length; i++) {
  const values = parseCSVLine(peopleLines[i]);

  const label = values[1] || '';
  // Skip customers, suppliers, dealers
  if (label.toLowerCase().includes('customer') || label.toLowerCase().includes('supplier') || label.toLowerCase().includes('dealer')) {
    continue;
  }

  people.push({
    name: values[0] || '',
    label: values[1] || 'Hot lead',
    organization: values[2] || '',
    emailWork: values[3] || null,
    emailHome: values[4] || null,
    emailOther: values[5] || null,
    phoneWork: values[6] || null,
    phoneHome: values[7] || null,
    phoneMobile: values[8] || null,
    phoneOther: values[9] || null,
    country: values[11] || null
  });
}

console.log(`Filtered to ${people.length} prospect people`);

// Group people by organization
const peopleByOrg = new Map();
for (const person of people) {
  if (!person.organization) continue;

  if (!peopleByOrg.has(person.organization)) {
    peopleByOrg.set(person.organization, []);
  }
  peopleByOrg.get(person.organization).push(person);
}

// Generate import data
const output = {
  companies: [],
  contacts: []
};

for (const [orgName, orgData] of organizations) {
  const leadStatus = mapLabelToStatus(orgData.label);

  // Parse country from address
  let country = null;
  if (orgData.address) {
    const parts = orgData.address.split(',').map(p => p.trim());
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1];
      if (lastPart.length > 2 && lastPart.length < 50) {
        country = lastPart;
      }
    }
  }

  const company = {
    company_name: orgName,
    type: 'prospect',
    lead_status: leadStatus,
    lead_score: leadStatus === 'hot' ? 50 : leadStatus === 'warm' ? 25 : 0,
    country: country,
    source: 'pipedrive_import_2025',
    notes: `Owner: ${orgData.owner || 'Unknown'}`,
    status: 'prospect',
    contacts: []
  };

  // Get people for this organization
  const orgPeople = peopleByOrg.get(orgName) || [];

  // Collect all unique emails for this org
  const emailsForOrg = new Set();

  for (const person of orgPeople) {
    if (person.emailWork) emailsForOrg.add(person.emailWork.toLowerCase().trim());
    if (person.emailHome) emailsForOrg.add(person.emailHome.toLowerCase().trim());
    if (person.emailOther) emailsForOrg.add(person.emailOther.toLowerCase().trim());
  }

  // Create one contact per email
  for (const email of emailsForOrg) {
    // Find the person with this email
    let personWithEmail = orgPeople.find(p => p.emailWork?.toLowerCase().trim() === email);
    if (!personWithEmail) {
      personWithEmail = orgPeople.find(p => p.emailHome?.toLowerCase().trim() === email);
    }
    if (!personWithEmail) {
      personWithEmail = orgPeople.find(p => p.emailOther?.toLowerCase().trim() === email);
    }

    let firstName = null;
    let lastName = null;
    let fullName = email;
    let phone = null;

    if (personWithEmail && personWithEmail.name) {
      const nameParts = personWithEmail.name.split(' ').filter(Boolean);
      firstName = nameParts[0] || null;
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
      fullName = personWithEmail.name;

      phone = personWithEmail.phoneMobile || personWithEmail.phoneWork || personWithEmail.phoneHome || personWithEmail.phoneOther || null;
    } else {
      const inferred = inferNameFromEmail(email);
      firstName = inferred.firstName;
      lastName = inferred.lastName;
      fullName = inferred.fullName;
    }

    company.contacts.push({
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      email: email,
      phone: phone
    });
  }

  output.companies.push(company);
}

// Write to JSON file
fs.writeFileSync('pipedrive-import-data.json', JSON.stringify(output, null, 2));

console.log(`\nGenerated import data:`);
console.log(`  ${output.companies.length} companies`);
console.log(`  ${output.companies.reduce((sum, c) => sum + c.contacts.length, 0)} contacts total`);
console.log(`\nSaved to: pipedrive-import-data.json`);
