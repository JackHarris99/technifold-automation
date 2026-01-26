#!/usr/bin/env node
/**
 * Execute Pipedrive SQL import
 * Executes companies and contacts import scripts
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🚀 Starting Pipedrive import via SQL...\n');

// Construct connection string
const connString = `postgresql://postgres.${SUPABASE_URL.split('//')[1].split('.')[0]}:[YOUR-PASSWORD]@${SUPABASE_URL.split('//')[1]}/postgres`;

console.log('Note: This script requires psql to be installed and DATABASE_URL to be set.');
console.log('\nAlternative: Use Supabase Dashboard > SQL Editor to paste and execute:');
console.log('  1. import-companies-corrected.sql');
console.log('  2. import-contacts-corrected.sql\n');

console.log('Files ready for import:');
console.log(`  - import-companies-corrected.sql (${fs.statSync('import-companies-corrected.sql').size} bytes)`);
console.log(`  - import-contacts-corrected.sql (${fs.statSync('import-contacts-corrected.sql').size} bytes)`);
