/**
 * Add cost_price column to products table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure .env.local contains:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function addCostPriceColumn() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('Adding cost_price column to products table...');

  // Execute raw SQL to add the column
  const { data, error } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC'
  });

  if (error) {
    // This error is expected if the RPC doesn't exist
    // In that case, we'll provide SQL to run manually
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
    console.log('ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC;\n');
  } else {
    console.log('✓ Column added successfully!\n');
  }
}

addCostPriceColumn().catch(console.error);
