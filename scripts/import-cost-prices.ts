/**
 * Import cost prices from CSV to products table
 * Only updates existing products, does not insert new ones
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface CostPriceRow {
  product_code: string;
  cost_price: number;
}

async function importCostPrices() {
  console.log('Starting cost price import...\n');

  // Step 1: Add cost_price column if it doesn't exist
  console.log('Step 1: Ensuring cost_price column exists...');
  const { error: alterError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC'
  });

  if (alterError) {
    console.log('Note: Could not add column via RPC (may already exist or need manual SQL)');
    console.log('Run this SQL manually if needed: ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC;\n');
  } else {
    console.log('✓ Column added or already exists\n');
  }

  // Step 2: Read and parse CSV file
  console.log('Step 2: Reading CSV file...');
  const csvPath = path.join(process.cwd(), 'product codes with cost price.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const lines = csvContent.split('\n').slice(1); // Skip header
  const costPrices: CostPriceRow[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const [product_code, cost_price] = line.split(',');
    if (product_code && cost_price) {
      costPrices.push({
        product_code: product_code.replace(/^\ufeff/, '').trim(), // Remove BOM if present
        cost_price: parseFloat(cost_price.trim())
      });
    }
  }

  console.log(`✓ Parsed ${costPrices.length} cost prices from CSV\n`);

  // Step 3: Fetch all existing product codes
  console.log('Step 3: Fetching existing products...');
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('product_code');

  if (fetchError) {
    console.error('Error fetching products:', fetchError);
    return;
  }

  const existingCodes = new Set(products?.map(p => p.product_code) || []);
  console.log(`✓ Found ${existingCodes.size} existing products\n`);

  // Step 4: Filter to only update existing products
  const validUpdates = costPrices.filter(cp => existingCodes.has(cp.product_code));
  const skippedProducts = costPrices.filter(cp => !existingCodes.has(cp.product_code));

  console.log(`Will update: ${validUpdates.length} products`);
  console.log(`Will skip: ${skippedProducts.length} products (not in database)\n`);

  if (skippedProducts.length > 0) {
    console.log('Products in CSV but not in database (first 10):');
    skippedProducts.slice(0, 10).forEach(p => {
      console.log(`  - ${p.product_code}: £${p.cost_price}`);
    });
    console.log('');
  }

  // Step 5: Update products in batches
  console.log('Step 4: Updating cost prices...');
  let updated = 0;
  let errors = 0;
  const batchSize = 100;

  for (let i = 0; i < validUpdates.length; i += batchSize) {
    const batch = validUpdates.slice(i, i + batchSize);

    for (const item of batch) {
      const { error } = await supabase
        .from('products')
        .update({ cost_price: item.cost_price })
        .eq('product_code', item.product_code);

      if (error) {
        console.error(`Error updating ${item.product_code}:`, error);
        errors++;
      } else {
        updated++;
      }
    }

    console.log(`Progress: ${Math.min(i + batchSize, validUpdates.length)}/${validUpdates.length}`);
  }

  console.log('\n=== Import Complete ===');
  console.log(`✓ Successfully updated: ${updated} products`);
  console.log(`✗ Errors: ${errors}`);
  console.log(`- Skipped (not in DB): ${skippedProducts.length}`);
  console.log(`- Total in CSV: ${costPrices.length}`);
}

importCostPrices().catch(console.error);
