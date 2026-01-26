/**
 * One-time Pipedrive Import Script
 * Import organizations and people from Pipedrive CSVs into companies and contacts tables
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
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

// Infer name from email
function inferNameFromEmail(email: string): { firstName: string | null; lastName: string | null; fullName: string } {
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

// Map Pipedrive label to lead status
function mapLabelToStatus(label: string): string {
  const lower = label.toLowerCase().trim();
  if (lower.includes('hot')) return 'hot';
  if (lower.includes('warm')) return 'warm';
  if (lower.includes('cold')) return 'cold';
  if (lower.includes('customer')) return 'converted'; // Already a customer in Pipedrive
  return 'cold';
}

async function main() {
  console.log('🚀 Starting Pipedrive import...');

  // Read CSV files
  const orgsFile = fs.readFileSync('/mnt/c/Users/Jack.Harris/technifold-march/organizations-12875790-9.csv', 'utf-8');
  const peopleFile = fs.readFileSync('/mnt/c/Users/Jack.Harris/technifold-march/people-12875790-8.csv', 'utf-8');

  const orgsLines = orgsFile.split('\n').filter(line => line.trim());
  const peopleLines = peopleFile.split('\n').filter(line => line.trim());

  console.log(`📊 Found ${orgsLines.length - 1} organizations and ${peopleLines.length - 1} people`);

  // Parse headers
  const orgsHeaders = parseCSVLine(orgsLines[0]);
  const peopleHeaders = parseCSVLine(peopleLines[0]);

  console.log('Organization headers:', orgsHeaders);
  console.log('People headers:', peopleHeaders);

  // Get existing data for deduplication
  console.log('🔍 Fetching existing companies and contacts...');
  const { data: existingCompanies } = await supabase
    .from('companies')
    .select('company_name, type');

  const { data: existingContacts } = await supabase
    .from('contacts')
    .select('email');

  const existingCompanyNames = new Set(
    (existingCompanies || []).map(c => c.company_name.toLowerCase().trim())
  );

  const existingEmails = new Set(
    (existingContacts || []).map(c => c.email.toLowerCase().trim())
  );

  console.log(`✅ Found ${existingCompanyNames.size} existing companies and ${existingEmails.size} existing contacts`);

  // Parse organizations
  interface OrgData {
    name: string;
    label: string;
    address: string;
    owner: string;
  }

  const organizations = new Map<string, OrgData>();

  for (let i = 1; i < orgsLines.length; i++) {
    const values = parseCSVLine(orgsLines[i]);
    const name = values[0];
    const label = values[1] || 'Hot lead';
    const address = values[2] || '';
    const owner = values[7] || '';

    if (name) {
      organizations.set(name, { name, label, address, owner });
    }
  }

  console.log(`📦 Parsed ${organizations.size} unique organizations`);

  // Parse people
  interface PersonData {
    name: string;
    label: string;
    organization: string;
    emailWork: string | null;
    emailHome: string | null;
    emailOther: string | null;
    phoneWork: string | null;
    phoneHome: string | null;
    phoneMobile: string | null;
    phoneOther: string | null;
    country: string | null;
  }

  const people: PersonData[] = [];

  for (let i = 1; i < peopleLines.length; i++) {
    const values = parseCSVLine(peopleLines[i]);

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

  console.log(`👥 Parsed ${people.length} people`);

  // Group people by organization
  const peopleByOrg = new Map<string, PersonData[]>();
  for (const person of people) {
    if (!person.organization) continue;

    if (!peopleByOrg.has(person.organization)) {
      peopleByOrg.set(person.organization, []);
    }
    peopleByOrg.get(person.organization)!.push(person);
  }

  // Import stats
  let companiesImported = 0;
  let companiesSkipped = 0;
  let contactsImported = 0;
  let contactsSkipped = 0;
  let errors = 0;

  // Process each organization
  for (const [orgName, orgData] of organizations) {
    try {
      // Skip if already exists (case-insensitive)
      if (existingCompanyNames.has(orgName.toLowerCase().trim())) {
        companiesSkipped++;
        console.log(`⏭️  Skipping existing company: ${orgName}`);
        continue;
      }

      // Determine type - only import as 'prospect' if labeled as lead
      // Skip if labeled as 'Customer' (they might be in Sage already)
      const leadStatus = mapLabelToStatus(orgData.label);
      if (leadStatus === 'converted' || orgData.label.toLowerCase().includes('customer')) {
        companiesSkipped++;
        console.log(`⏭️  Skipping customer (already converted): ${orgName}`);
        continue;
      }

      // Parse country from address if available
      let country = null;
      if (orgData.address) {
        const parts = orgData.address.split(',').map(p => p.trim());
        if (parts.length > 0) {
          const lastPart = parts[parts.length - 1];
          if (lastPart.length > 2) {
            country = lastPart;
          }
        }
      }

      // Insert company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          company_name: orgName,
          type: 'prospect',
          lead_status: leadStatus,
          lead_score: leadStatus === 'hot' ? 50 : leadStatus === 'warm' ? 25 : 0,
          country: country,
          source: 'pipedrive_import_2025',
          notes: `Owner: ${orgData.owner || 'Unknown'}`,
          status: 'prospect'
        })
        .select('company_id')
        .single();

      if (companyError) {
        console.error(`❌ Error creating company ${orgName}:`, companyError);
        errors++;
        continue;
      }

      companiesImported++;
      existingCompanyNames.add(orgName.toLowerCase().trim());

      // Get people for this organization
      const orgPeople = peopleByOrg.get(orgName) || [];

      // Collect all unique emails for this org
      const emailsForOrg = new Set<string>();

      for (const person of orgPeople) {
        // Add all emails from this person
        if (person.emailWork) emailsForOrg.add(person.emailWork.toLowerCase().trim());
        if (person.emailHome) emailsForOrg.add(person.emailHome.toLowerCase().trim());
        if (person.emailOther) emailsForOrg.add(person.emailOther.toLowerCase().trim());
      }

      // Process each unique email (one contact per email)
      for (const email of emailsForOrg) {
        // Skip if email already exists globally
        if (existingEmails.has(email)) {
          contactsSkipped++;
          continue;
        }

        // Find the person with this email (prefer work email)
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
          // Parse name from "First Last" format
          const nameParts = personWithEmail.name.split(' ').filter(Boolean);
          firstName = nameParts[0] || null;
          lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
          fullName = personWithEmail.name;

          // Get phone (prefer mobile > work > home > other)
          phone = personWithEmail.phoneMobile || personWithEmail.phoneWork || personWithEmail.phoneHome || personWithEmail.phoneOther || null;
        } else {
          // Infer name from email
          const inferred = inferNameFromEmail(email);
          firstName = inferred.firstName;
          lastName = inferred.lastName;
          fullName = inferred.fullName;
        }

        // Insert contact
        const { error: contactError } = await supabase
          .from('contacts')
          .insert({
            company_id: newCompany.company_id,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            email: email,
            phone: phone,
            role: null,
            marketing_status: 'subscribed'
          });

        if (contactError) {
          console.error(`❌ Error creating contact ${email}:`, contactError);
          errors++;
          continue;
        }

        contactsImported++;
        existingEmails.add(email);
      }

      if (companiesImported % 100 === 0) {
        console.log(`📈 Progress: ${companiesImported} companies, ${contactsImported} contacts`);
      }

    } catch (error) {
      console.error(`❌ Error processing ${orgName}:`, error);
      errors++;
    }
  }

  console.log('\n✅ Import complete!');
  console.log(`📊 Companies: ${companiesImported} imported, ${companiesSkipped} skipped`);
  console.log(`👥 Contacts: ${contactsImported} imported, ${contactsSkipped} skipped`);
  console.log(`❌ Errors: ${errors}`);
}

main().catch(console.error);
