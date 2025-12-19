/**
 * Show all products that are in CSV but not in database
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function showSkippedProducts() {
  // Read CSV
  const csvPath = path.join(process.cwd(), 'product codes with cost price.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1);

  const costPrices: Array<{ product_code: string; cost_price: number }> = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    const product_code = parts[0]?.replace(/^\ufeff/, '').trim();
    const cost_price_str = parts[1]?.trim();

    if (product_code && cost_price_str) {
      const cost_price = parseFloat(cost_price_str);
      if (!isNaN(cost_price)) {
        costPrices.push({ product_code, cost_price });
      }
    }
  }

  // Fetch all existing products
  let allProducts: any[] = [];
  let start = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: batch } = await supabase
      .from('products')
      .select('product_code')
      .range(start, start + batchSize - 1);

    if (batch && batch.length > 0) {
      allProducts = allProducts.concat(batch);
      start += batchSize;
      hasMore = batch.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  const existingCodes = new Set(allProducts.map(p => p.product_code));
  const skippedProducts = costPrices.filter(cp => !existingCodes.has(cp.product_code));

  console.log(`\n=== ${skippedProducts.length} Products in CSV but NOT in Database ===\n`);

  skippedProducts.forEach((p, index) => {
    console.log(`${(index + 1).toString().padStart(3)}. ${p.product_code.padEnd(30)} £${p.cost_price.toFixed(2)}`);
  });
}

showSkippedProducts().catch(console.error);
