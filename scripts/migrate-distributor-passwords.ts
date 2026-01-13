/**
 * Migration Script: Hash Plaintext Distributor Passwords
 *
 * This script finds all distributor companies with plaintext passwords
 * and converts them to bcrypt hashes.
 *
 * Usage: tsx scripts/migrate-distributor-passwords.ts
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePasswords() {
  console.log('🔐 Starting distributor password migration...\n');

  try {
    // Fetch all distributor companies
    const { data: companies, error } = await supabase
      .from('companies')
      .select('company_id, company_name, distributor_email, distributor_password')
      .eq('type', 'distributor')
      .not('distributor_password', 'is', null);

    if (error) {
      console.error('❌ Error fetching companies:', error);
      return;
    }

    if (!companies || companies.length === 0) {
      console.log('✅ No distributor companies found');
      return;
    }

    console.log(`Found ${companies.length} distributor companies\n`);

    let migratedCount = 0;
    let alreadyHashedCount = 0;
    let skippedCount = 0;

    for (const company of companies) {
      const { company_id, company_name, distributor_password } = company;

      if (!distributor_password) {
        console.log(`⏭️  Skipping ${company_name} - no password set`);
        skippedCount++;
        continue;
      }

      // Check if already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (distributor_password.startsWith('$2')) {
        console.log(`✓ ${company_name} - already hashed`);
        alreadyHashedCount++;
        continue;
      }

      // Hash the plaintext password
      console.log(`🔄 Migrating ${company_name}...`);
      const hashedPassword = await bcrypt.hash(distributor_password, 10);

      // Update in database
      const { error: updateError } = await supabase
        .from('companies')
        .update({ distributor_password: hashedPassword })
        .eq('company_id', company_id);

      if (updateError) {
        console.error(`❌ Failed to update ${company_name}:`, updateError);
      } else {
        console.log(`✅ Migrated ${company_name}`);
        migratedCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Migrated: ${migratedCount}`);
    console.log(`   ✓ Already hashed: ${alreadyHashedCount}`);
    console.log(`   ⏭️  Skipped (no password): ${skippedCount}`);
    console.log(`   📋 Total: ${companies.length}`);

  } catch (err) {
    console.error('❌ Migration error:', err);
  }
}

// Run migration
migratePasswords();
