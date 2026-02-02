import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('Checking company_product_history structure...');

  const { data, error } = await supabase
    .from('company_product_history')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample records:');
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
