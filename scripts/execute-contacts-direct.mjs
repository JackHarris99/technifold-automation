#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import { createPool } from '@neondatabase/serverless';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

async function executeSQL(sql, description) {
  console.log(`\n📤 Executing: ${description}...`);

  const pool = createPool({ connectionString: dbUrl });

  try {
    await pool.query(sql);
    console.log(`✅ ${description} complete`);
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log('🚀 Starting Contacts Import - Direct SQL Execution');
  console.log('==================================================\n');

  try {
    const parts = [
      { file: 'contacts-migration-part1.sql', desc: 'Part 1 (batches 1-10)' },
      { file: 'contacts-migration-part2.sql', desc: 'Part 2 (batches 11-20)' },
      { file: 'contacts-migration-part3.sql', desc: 'Part 3 (batches 21-30)' },
      { file: 'contacts-migration-part4.sql', desc: 'Part 4 (batches 31-43)' }
    ];

    for (const part of parts) {
      console.log(`📖 Reading ${part.file}...`);
      const sql = fs.readFileSync(part.file, 'utf8');
      console.log(`  Size: ${(sql.length / 1024).toFixed(0)} KB`);

      await executeSQL(sql, part.desc);
    }

    console.log('\n✅ All contacts imported successfully!');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
