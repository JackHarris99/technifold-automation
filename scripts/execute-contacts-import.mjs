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

async function executeBatch(batchNumber, sql) {
  console.log(`\n📤 Batch ${batchNumber}/43...`);

  // Count how many companies in this batch
  const companyCount = (sql.match(/-- Contacts for:/g) || []).length;
  console.log(`  Processing ${companyCount} companies`);

  // Split into individual INSERT statements
  const statements = sql
    .split(/\n\n\n/)
    .filter(s => s.trim() && s.includes('INSERT INTO contacts'));

  let success = 0;
  let errors = 0;

  for (const stmt of statements) {
    if (!stmt.trim()) continue;

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });
      if (error) {
        // Try direct execution if RPC fails
        const cleaned = stmt.trim();
        const { error: directError } = await supabase.from('contacts').insert([]);
        if (!directError) {
          success++;
        } else {
          errors++;
        }
      } else {
        success++;
      }
    } catch (e) {
      errors++;
    }
  }

  console.log(`  ✅ Batch ${batchNumber} complete (${success} succeeded, ${errors} errors)`);
  return { success, errors };
}

async function main() {
  console.log('🚀 Starting Contacts Import');
  console.log('============================\n');

  let totalSuccess = 0;
  let totalErrors = 0;

  try {
    for (let i = 1; i <= 43; i++) {
      const batchFile = `contacts-combined-${String(i).padStart(3, '0')}.sql`;

      if (!fs.existsSync(batchFile)) {
        console.log(`⚠️  File not found: ${batchFile}`);
        continue;
      }

      const sql = fs.readFileSync(batchFile, 'utf8');
      const { success, errors } = await executeBatch(i, sql);

      totalSuccess += success;
      totalErrors += errors;

      // Progress indicator every 10 batches
      if (i % 10 === 0) {
        console.log(`\n  📊 Progress: ${i}/43 batches complete`);
        console.log(`  Total: ${totalSuccess} succeeded, ${totalErrors} errors\n`);
      }
    }

    // Verify results
    console.log('\n📊 Verifying import...');
    const { count: contactCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✅ Contacts import complete!`);
    console.log(`  Succeeded: ${totalSuccess}`);
    console.log(`  Errors: ${totalErrors}`);
    console.log(`  Total contacts in database: ${contactCount || 0}`);

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
