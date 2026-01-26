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

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  db: { schema: 'public' }
});

async function executeSQLFile(filename, batchNum) {
  console.log(`\n📦 Batch ${batchNum}/43: ${filename}`);

  const sql = fs.readFileSync(filename, 'utf8');

  // Split into individual INSERT statements
  const statements = sql
    .split(/\n\n\n+/)  // Split on triple newlines between statements
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.includes('INSERT INTO contacts'));

  console.log(`  Found ${statements.length} INSERT statements`);

  let success = 0;
  let errors = 0;

  for (const stmt of statements) {
    try {
      // Use Supabase's sql function for raw SQL execution
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });

      if (error) {
        errors++;
        if (errors <= 3) {  // Only show first 3 errors per batch
          console.error(`  ⚠️  Error:`, error.message.substring(0, 100));
        }
      } else {
        success++;
      }
    } catch (e) {
      errors++;
      if (errors <= 3) {
        console.error(`  ⚠️  Exception:`, e.message.substring(0, 100));
      }
    }
  }

  console.log(`  ✅ Batch complete: ${success} succeeded, ${errors} errors`);
  return { success, errors };
}

async function main() {
  console.log('🚀 Contacts Import - Raw SQL Execution');
  console.log('======================================\n');

  let totalSuccess = 0;
  let totalErrors = 0;

  for (let i = 1; i <= 43; i++) {
    const batchNum = String(i).padStart(3, '0');
    const filename = `contacts-combined-${batchNum}.sql`;

    const { success, errors } = await executeSQLFile(filename, batchNum);
    totalSuccess += success;
    totalErrors += errors;

    if (i % 10 === 0) {
      console.log(`\n  📊 Progress: ${i}/43 batches`);
      console.log(`  Total: ${totalSuccess} succeeded, ${totalErrors} errors\n`);
    }
  }

  // Verify final count
  const { count } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true });

  console.log('\n✅ Import complete!');
  console.log(`  Succeeded: ${totalSuccess}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log(`  Total contacts in database: ${count || 0}`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
