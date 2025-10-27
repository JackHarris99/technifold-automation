/**
 * Check what tables/views exist for the new master build
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('\n🔍 CHECKING SCHEMA FOR MASTER BUILD\n');

  // Check tables
  const tables = ['machines', 'solutions', 'problems', 'company_machine', 'companies'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${table}: NOT FOUND or ERROR - ${error.message}`);
    } else {
      console.log(`✅ ${table}: EXISTS`);
      if (data && data.length > 0) {
        console.log(`   Sample columns: ${Object.keys(data[0]).join(', ')}`);
      }
    }
  }

  console.log('\n📊 CHECKING VIEWS\n');

  const views = [
    'v_machine_solution_problem_full',
    'vw_due_consumable_reminders_90',
    'vw_due_consumable_reminders_180',
    'vw_due_consumable_reminders_365'
  ];

  for (const view of views) {
    const { data, error } = await supabase
      .from(view)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ ${view}: NOT FOUND - ${error.message}`);
    } else {
      console.log(`✅ ${view}: EXISTS`);
      if (data && data.length > 0) {
        console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
      }
    }
  }

  // Check companies for account_owner
  console.log('\n🏢 CHECKING companies TABLE FOR account_owner\n');
  const { data: companyData } = await supabase
    .from('companies')
    .select('*')
    .limit(1);

  if (companyData && companyData.length > 0) {
    const hasAccountOwner = 'account_owner' in companyData[0];
    if (hasAccountOwner) {
      console.log('✅ companies.account_owner: EXISTS');
    } else {
      console.log('❌ companies.account_owner: MISSING - needs migration');
    }
  }

  console.log('\n✅ SCHEMA CHECK COMPLETE\n');
}

checkSchema().catch(console.error);
