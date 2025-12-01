import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkMachines() {
  // Get sample machines
  const { data: machines, error } = await supabase
    .from('machines')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== SAMPLE MACHINES ===');
  console.log(JSON.stringify(machines, null, 2));

  // Get distinct categories
  const { data: allMachines } = await supabase
    .from('machines')
    .select('category, machine_type')
    .not('category', 'is', null);

  const categories = [...new Set(allMachines?.map(m => m.category))];
  const types = [...new Set(allMachines?.map(m => m.machine_type))];

  console.log('\n=== MACHINE CATEGORIES ===');
  console.log(categories);

  console.log('\n=== MACHINE TYPES ===');
  console.log(types);

  // Check if shaft_size exists
  const firstMachine = machines?.[0];
  console.log('\n=== AVAILABLE FIELDS ===');
  console.log(Object.keys(firstMachine || {}));
}

checkMachines();
