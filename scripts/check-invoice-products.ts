import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('Fetching all unique product codes from invoice_items...');

  const { data, error } = await supabase
    .from('invoice_items')
    .select('product_code');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const uniqueCodes = new Set(data.map(item => item.product_code));
  console.log(`Found ${uniqueCodes.size} unique product codes in invoice_items`);
  console.log(`Total invoice item rows: ${data.length}`);
}

main().catch(console.error);
