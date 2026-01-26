#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract database connection string from Supabase project
const projectRef = supabaseUrl.split('//')[1].split('.')[0];
const connectionString = `postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

console.log('🚀 Contacts Import - Direct Postgres Execution');
console.log('===============================================\n');
console.log('Project ref:', projectRef);
console.log('⚠️  Note: This requires direct postgres connection\n');

// For now, let's use a workaround with the supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function insertContactsForCompany(companyName, contacts) {
  // First, get the company_id
  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('company_id')
    .ilike('company_name', companyName)
    .limit(1);

  if (companyError || !companies || companies.length === 0) {
    console.log(`⚠️  Company not found: ${companyName}`);
    return { success: 0, skipped: contacts.length };
  }

  const companyId = companies[0].company_id;
  let success = 0;
  let skipped = 0;

  for (const contact of contacts) {
    // Check if contact already exists
    const { data: existing } = await supabase
      .from('contacts')
      .select('contact_id')
      .ilike('email', contact.email)
      .limit(1);

    if (existing && existing.length > 0) {
      skipped++;
      continue;
    }

    // Insert contact
    const { error } = await supabase
      .from('contacts')
      .insert({
        company_id: companyId,
        first_name: contact.first_name,
        last_name: contact.last_name,
        full_name: contact.full_name,
        email: contact.email,
        phone: contact.phone,
        marketing_status: contact.marketing_status
      });

    if (error) {
      console.error(`  Error inserting ${contact.email}:`, error.message);
    } else {
      success++;
    }
  }

  return { success, skipped };
}

// Parse a batch SQL file to extract company names and contacts
function parseBatchFile(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const entries = [];

  // Split by company sections
  const sections = content.split(/-- Contacts for: /g).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n');
    const companyName = lines[0].trim();

    // Extract VALUES section
    const valuesMatch = section.match(/FROM \(VALUES\s+([\s\S]*?)\) AS v\(/);
    if (!valuesMatch) continue;

    const valuesStr = valuesMatch[1];
    const valueRows = valuesStr.split(/\),\s*\(/g);

    const contacts = valueRows.map(row => {
      row = row.replace(/^\(/, '').replace(/\)$/, '');
      const parts = row.split(/,\s*(?=\')|,\s*(?=NULL)/g);

      const unquote = (s) => {
        s = s.trim();
        if (s === 'NULL') return null;
        return s.replace(/^'+|'+$/g, '').replace(/''/g, "'");
      };

      return {
        first_name: unquote(parts[0]),
        last_name: unquote(parts[1]),
        full_name: unquote(parts[2]),
        email: unquote(parts[3]),
        phone: unquote(parts[4]),
        marketing_status: unquote(parts[5])
      };
    });

    entries.push({ companyName, contacts });
  }

  return entries;
}

async function main() {
  let totalSuccess = 0;
  let totalSkipped = 0;

  for (let i = 1; i <= 43; i++) {
    const batchNum = String(i).padStart(3, '0');
    const filename = `contacts-combined-${batchNum}.sql`;

    console.log(`\n📦 Processing batch ${i}/43: ${filename}`);

    const entries = parseBatchFile(filename);
    console.log(`  Found ${entries.length} companies`);

    for (const entry of entries) {
      const { success, skipped } = await insertContactsForCompany(entry.companyName, entry.contacts);
      totalSuccess += success;
      totalSkipped += skipped;
    }

    if (i % 10 === 0) {
      console.log(`\n  📊 Progress: ${i}/43 batches`);
      console.log(`  Inserted: ${totalSuccess}, Skipped: ${totalSkipped}\n`);
    }
  }

  console.log('\n✅ Import complete!');
  console.log(`  Total inserted: ${totalSuccess}`);
  console.log(`  Total skipped: ${totalSkipped}`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
