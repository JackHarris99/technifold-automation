#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(sql, description) {
  console.log(`\n📤 Executing: ${description}...`);

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // Try direct query instead
    const { error: queryError } = await supabase.from('companies').select('count').limit(1);
    if (queryError) {
      console.error('❌ Error:', error);
      throw error;
    }

    // If that worked, try splitting into batches
    const batches = sql.split(/;\s*\n\s*-- Batch/);
    console.log(`  Splitting into ${batches.length} sub-batches...`);

    for (let i = 0; i < batches.length; i++) {
      let batch = batches[i];
      if (i > 0) batch = '-- Batch' + batch;

      const statements = batch.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

      for (const stmt of statements) {
        if (!stmt.trim()) continue;

        const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: stmt });
        if (stmtError) {
          console.error(`❌ Error in batch ${i + 1}:`, stmtError.message);
        }
      }

      if ((i + 1) % 10 === 0) {
        console.log(`  Progress: ${i + 1}/${batches.length} batches`);
      }
    }
  }

  console.log(`✅ ${description} complete`);
}

async function main() {
  console.log('🚀 Starting Pipedrive Import - Phase 1');
  console.log('==========================================\n');

  try {
    // Read SQL files
    console.log('📖 Reading SQL files...');
    const companiesSQL = fs.readFileSync('combined-companies-import.sql', 'utf8');
    const contactsSQL = fs.readFileSync('import-contacts-final.sql', 'utf8');

    console.log(`✅ Companies SQL: ${(companiesSQL.length / 1024).toFixed(0)} KB`);
    console.log(`✅ Contacts SQL: ${(contactsSQL.length / 1024).toFixed(0)} KB`);

    // Execute companies import
    await executeSQL(companiesSQL, 'Companies import (4,650 prospects)');

    // Execute contacts import
    await executeSQL(contactsSQL, 'Contacts import (4,630 contacts)');

    // Verify results
    console.log('\n📊 Verifying import...');
    const { count: prospectCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'pipedrive_import_2025');

    console.log(`✅ Imported prospects: ${prospectCount || 0}`);

    console.log('\n✅ Phase 1 import complete!');
    console.log('\nNext: Phase 2 - Import Suppliers/Distributors/Press');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
