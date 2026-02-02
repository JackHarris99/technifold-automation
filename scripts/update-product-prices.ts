import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Helper function to parse CSV lines with quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  console.log('Reading stock_list_enriched_v12.csv...');
  const csvPath = path.join(process.cwd(), 'stock_list_enriched_v12.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvLines = csvContent.trim().split('\n');

  // Parse header
  const headers = parseCSVLine(csvLines[0]);
  const colIndices: any = {};
  headers.forEach((header, index) => {
    colIndices[header] = index;
  });

  // Build map of product codes to new prices
  const priceUpdates = new Map<string, number>();

  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    const productCode = parts[colIndices['Product Code']] || '';
    const newSalesPrice = parseFloat(parts[colIndices['New Sales Price']]) || 0;

    if (productCode && newSalesPrice > 0) {
      priceUpdates.set(productCode, newSalesPrice);
    }
  }

  console.log(`Found ${priceUpdates.size} products with new pricing`);

  // Fetch current prices from database (in batches to avoid URL length limits)
  console.log('\nFetching current prices from database...');
  const productCodes = Array.from(priceUpdates.keys());
  let currentProducts: any[] = [];
  const batchSize = 100;

  for (let i = 0; i < productCodes.length; i += batchSize) {
    const batch = productCodes.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('products')
      .select('product_code, price')
      .in('product_code', batch);

    if (error) {
      console.error('Error fetching products:', error);
      process.exit(1);
    }

    if (data) {
      currentProducts = currentProducts.concat(data);
    }

    console.log(`  Fetched ${currentProducts.length}/${productCodes.length} products...`);
  }

  console.log(`Found ${currentProducts.length} matching products in database`);

  // Calculate changes
  const changes = [];
  for (const product of currentProducts || []) {
    const newPrice = priceUpdates.get(product.product_code);
    if (newPrice && product.price !== newPrice) {
      changes.push({
        product_code: product.product_code,
        old_price: product.price,
        new_price: newPrice,
        difference: (newPrice - (product.price || 0)).toFixed(2)
      });
    }
  }

  console.log(`\nFound ${changes.length} products that need price updates`);

  if (changes.length > 0) {
    console.log('\nSample changes (first 10):');
    changes.slice(0, 10).forEach(c => {
      console.log(`  ${c.product_code}: £${c.old_price} → £${c.new_price} (${c.difference > 0 ? '+' : ''}£${c.difference})`);
    });
    if (changes.length > 10) {
      console.log(`  ... and ${changes.length - 10} more`);
    }
  }

  // Update prices
  console.log('\nUpdating prices in database...');
  let updateCount = 0;
  let errorCount = 0;

  for (const change of changes) {
    const { error } = await supabase
      .from('products')
      .update({ price: change.new_price })
      .eq('product_code', change.product_code);

    if (error) {
      console.error(`  ✗ Error updating ${change.product_code}:`, error.message);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 100 === 0) {
        console.log(`  Updated ${updateCount}/${changes.length} products...`);
      }
    }
  }

  console.log(`\n✓ Price update complete!`);
  console.log(`  Successfully updated: ${updateCount} products`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`  No change needed: ${(currentProducts?.length || 0) - changes.length}`);
}

main().catch(console.error);
