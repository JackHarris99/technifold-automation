/**
 * Add cost_price column and import cost prices from CSV
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

async function setupAndImportCostPrices() {
  console.log('=== Cost Price Import Tool ===\n');

  // Step 1: Check if column exists by trying to query it
  console.log('Step 1: Checking if cost_price column exists...');
  const { data: testData, error: testError } = await supabase
    .from('products')
    .select('product_code, cost_price')
    .limit(1);

  if (testError && testError.message.includes('cost_price')) {
    console.log('✗ Column does not exist yet');
    console.log('\n⚠️  Please run this SQL in Supabase SQL Editor first:');
    console.log('   ALTER TABLE products ADD COLUMN cost_price NUMERIC;\n');
    console.log('Then run this script again.');
    process.exit(1);
  }

  console.log('✓ cost_price column exists\n');

  // Step 2: Read and parse CSV file
  console.log('Step 2: Reading CSV file...');
  const csvPath = path.join(process.cwd(), 'product codes with cost price.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`✗ CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // Skip header
  const costPrices: CostPriceRow[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split(',');
    const product_code = parts[0]?.replace(/^\ufeff/, '').trim(); // Remove BOM if present
    const cost_price_str = parts[1]?.trim();

    if (product_code && cost_price_str) {
      const cost_price = parseFloat(cost_price_str);
      if (!isNaN(cost_price)) {
        costPrices.push({ product_code, cost_price });
      }
    }
  }

  console.log(`✓ Parsed ${costPrices.length} cost prices from CSV\n`);

  // Step 3: Fetch all existing product codes in batches
  console.log('Step 3: Fetching existing products...');
  let allProducts: any[] = [];
  let start = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('products')
      .select('product_code')
      .range(start, start + batchSize - 1);

    if (error) {
      console.error('Error fetching products:', error);
      process.exit(1);
    }

    if (batch && batch.length > 0) {
      allProducts = allProducts.concat(batch);
      start += batchSize;
      hasMore = batch.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  const existingCodes = new Set(allProducts.map(p => p.product_code));
  console.log(`✓ Found ${existingCodes.size} existing products\n`);

  // Step 4: Filter to only update existing products
  const validUpdates = costPrices.filter(cp => existingCodes.has(cp.product_code));
  const skippedProducts = costPrices.filter(cp => !existingCodes.has(cp.product_code));

  console.log(`Will update: ${validUpdates.length} products`);
  console.log(`Will skip: ${skippedProducts.length} products (not in database)\n`);

  if (skippedProducts.length > 0 && skippedProducts.length <= 20) {
    console.log('Products in CSV but not in database:');
    skippedProducts.forEach(p => {
      console.log(`  - ${p.product_code}: £${p.cost_price.toFixed(2)}`);
    });
    console.log('');
  } else if (skippedProducts.length > 20) {
    console.log('Products in CSV but not in database (first 20):');
    skippedProducts.slice(0, 20).forEach(p => {
      console.log(`  - ${p.product_code}: £${p.cost_price.toFixed(2)}`);
    });
    console.log(`  ... and ${skippedProducts.length - 20} more\n`);
  }

  // Step 5: Confirm before proceeding
  console.log('Ready to update cost prices.');
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 6: Update products in batches
  console.log('Step 4: Updating cost prices...');
  let updated = 0;
  let errors = 0;
  const updateBatchSize = 50; // Smaller batches for updates

  for (let i = 0; i < validUpdates.length; i += updateBatchSize) {
    const batch = validUpdates.slice(i, i + updateBatchSize);

    // Update each product individually for reliability
    const updatePromises = batch.map(item =>
      supabase
        .from('products')
        .update({ cost_price: item.cost_price })
        .eq('product_code', item.product_code)
        .then(({ error }) => {
          if (error) {
            console.error(`Error updating ${item.product_code}:`, error.message);
            return { success: false, product_code: item.product_code };
          }
          return { success: true, product_code: item.product_code };
        })
    );

    const results = await Promise.all(updatePromises);

    results.forEach(result => {
      if (result.success) {
        updated++;
      } else {
        errors++;
      }
    });

    const progress = Math.min(i + updateBatchSize, validUpdates.length);
    process.stdout.write(`\rProgress: ${progress}/${validUpdates.length} (${Math.round((progress / validUpdates.length) * 100)}%)`);
  }

  console.log('\n\n=== Import Complete ===');
  console.log(`✓ Successfully updated: ${updated} products`);
  if (errors > 0) {
    console.log(`✗ Errors: ${errors}`);
  }
  console.log(`- Skipped (not in DB): ${skippedProducts.length}`);
  console.log(`- Total in CSV: ${costPrices.length}`);

  // Step 7: Show sample of updated products
  console.log('\nSample of updated products:');
  const { data: sampleProducts } = await supabase
    .from('products')
    .select('product_code, description, cost_price')
    .not('cost_price', 'is', null)
    .limit(5);

  if (sampleProducts) {
    sampleProducts.forEach(p => {
      console.log(`  ${p.product_code}: £${p.cost_price?.toFixed(2)} - ${p.description}`);
    });
  }
}

setupAndImportCostPrices().catch(console.error);
