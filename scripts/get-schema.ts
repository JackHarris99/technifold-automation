// Quick script to fetch current database schema
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load env vars from .env.local
const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf-8');
const envVars: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabase = createClient(
  envVars.SUPABASE_URL!,
  envVars.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSchema() {
  console.log('=== Current vw_company_consumable_payload definition ===\n');
  const { data: viewDef, error: viewError } = await supabase.rpc('get_view_definition', {
    view_name: 'vw_company_consumable_payload'
  });

  if (viewError) {
    console.log('Trying alternative method...');
    const { data: altData, error: altError } = await supabase
      .from('vw_company_consumable_payload')
      .select('*')
      .limit(1);
    console.log('Sample row:', JSON.stringify(altData?.[0], null, 2));
  } else {
    console.log(viewDef);
  }

  console.log('\n=== Companies table structure ===\n');
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .limit(0);
  console.log('Companies columns:', companies);

  console.log('\n=== Products table structure ===\n');
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .limit(1);
  console.log('Sample product:', JSON.stringify(products?.[0], null, 2));

  console.log('\n=== Checking for existing tables ===\n');
  const tables = ['engagement_events', 'outbox', 'contacts'];
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0);
    console.log(`${table}: ${error ? 'DOES NOT EXIST' : 'EXISTS'}`);
  }

  console.log('\n=== engagement_events structure ===\n');
  const { data: events } = await supabase
    .from('engagement_events')
    .select('*')
    .limit(1);
  if (events && events.length > 0) {
    console.log('Sample event:', JSON.stringify(events[0], null, 2));
  }

  console.log('\n=== contacts structure ===\n');
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .limit(1);
  if (contacts && contacts.length > 0) {
    console.log('Sample contact:', JSON.stringify(contacts[0], null, 2));
  }

  console.log('\n=== companies sample ===\n');
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .limit(1);
  if (company && company.length > 0) {
    console.log('Sample company:', JSON.stringify(company[0], null, 2));
  }
}

getSchema().then(() => process.exit(0)).catch(console.error);
