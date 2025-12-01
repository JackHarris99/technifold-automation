require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkView() {
  console.log('🔍 Checking v_machine_solution_problem_full view...\n');

  // Try to get data for a known machine slug
  const { data, error } = await supabase
    .from('v_machine_solution_problem_full')
    .select('*')
    .eq('machine_slug', 'heidelberg-stahlfolder-td-66')
    .limit(1);

  if (error) {
    console.error('❌ View error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('❌ No data returned for slug: heidelberg-stahlfolder-td-66');
    console.log('Checking if view exists at all...\n');

    // Check if view has any data
    const { data: anyData, error: anyError } = await supabase
      .from('v_machine_solution_problem_full')
      .select('machine_slug, machine_display_name, machine_id')
      .limit(10);

    if (anyError) {
      console.error('❌ View does not exist or has error:', anyError);
    } else if (anyData && anyData.length > 0) {
      console.log('✅ View exists with data:');
      anyData.forEach(row => {
        console.log('  - Slug:', row.machine_slug || '(null)', '| Machine:', row.machine_display_name);
      });
    } else {
      console.log('❌ View exists but has no data');
    }
  } else {
    console.log('✅ View has data for that slug!');
    console.log('Columns:', Object.keys(data[0]));
  }
}

checkView().catch(console.error);
