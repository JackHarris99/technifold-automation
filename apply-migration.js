/**
 * Apply the company_machine migration to Supabase
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('\n🚀 APPLYING MIGRATION\n');

  const migrationPath = path.join(__dirname, 'supabase/migrations/20250125_01_add_company_machine_and_account_owner.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📄 Migration file loaded');
  console.log('📝 Executing SQL...\n');

  // Execute the migration
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

  if (error) {
    // If exec_sql doesn't exist, we need to execute statements manually
    console.log('⚠️  exec_sql RPC not available, executing via query...');

    // Try direct execution (this may not work for all statements)
    const { error: queryError } = await supabase.from('_').select('*').limit(0);

    console.log('\n⚠️  MANUAL MIGRATION REQUIRED');
    console.log('Please run this SQL in Supabase SQL Editor:');
    console.log('\n' + sql + '\n');

    return;
  }

  console.log('✅ Migration applied successfully!\n');

  // Verify the changes
  console.log('🔍 Verifying changes...\n');

  // Check account_owner column
  const { data: companyData } = await supabase
    .from('companies')
    .select('account_owner')
    .limit(1);

  if (companyData !== null) {
    console.log('✅ companies.account_owner column exists');
  }

  // Check company_machine table
  const { data: cmData, error: cmError } = await supabase
    .from('company_machine')
    .select('*')
    .limit(1);

  if (!cmError) {
    console.log('✅ company_machine table exists');
  } else {
    console.log('❌ company_machine table check failed:', cmError.message);
  }

  console.log('\n✅ MIGRATION COMPLETE\n');
}

applyMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  console.log('\n📋 MANUAL STEPS REQUIRED:');
  console.log('1. Open Supabase Dashboard → SQL Editor');
  console.log('2. Paste the contents of: supabase/migrations/20250125_01_add_company_machine_and_account_owner.sql');
  console.log('3. Run the SQL');
});
