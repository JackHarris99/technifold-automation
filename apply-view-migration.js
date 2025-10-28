/**
 * Apply the view migration to add slug column
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('📝 Reading migration file...\n');

  const sql = fs.readFileSync('./supabase/migrations/20250128_01_add_slug_to_machine_view.sql', 'utf8');

  console.log('🚀 Applying migration to add slug column to view...\n');

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 You need to run this SQL manually in Supabase SQL Editor:');
    console.log(sql);
  } else {
    console.log('✅ Migration applied successfully!');

    // Test it
    const { data: testData } = await supabase
      .from('v_machine_solution_problem_full')
      .select('machine_slug, machine_display_name')
      .limit(3);

    if (testData && testData.length > 0) {
      console.log('\n✅ View now has slug column:');
      testData.forEach(row => {
        console.log(`   - /machines/${row.machine_slug} → ${row.machine_display_name}`);
      });
    }
  }
}

applyMigration().catch(console.error);
