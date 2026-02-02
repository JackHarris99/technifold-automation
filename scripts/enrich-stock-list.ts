import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('Reading Stock List 2.csv...');
  const csvPath = path.join(process.cwd(), 'Stock List 2.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvLines = csvContent.trim().split('\n');

  // Parse CSV with proper handling of quoted fields
  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        // Toggle quote mode
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Push last field
    result.push(current.trim());
    return result;
  }

  const stockProducts = [];
  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    if (parts.length >= 4) {
      const productCode = parts[0];
      const description = parts[1];
      const salesPrice = parseFloat(parts[2]) || 0;
      const costPrice = parseFloat(parts[3]) || 0;

      if (productCode) {
        stockProducts.push({
          productCode,
          description,
          salesPrice,
          costPrice
        });
      }
    }
  }

  console.log(`Found ${stockProducts.length} products in Stock List 2`);

  // Fetch all products from Supabase to get type and category
  console.log('Fetching product types and categories from database...');
  let allProducts: any[] = [];
  let hasMore = true;
  let offset = 0;
  const batchSize = 1000;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('products')
      .select('product_code, type, category')
      .order('product_code')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Database error:', error);
      process.exit(1);
    }

    if (batch && batch.length > 0) {
      allProducts = allProducts.concat(batch);
      offset += batchSize;
      console.log(`  Fetched ${allProducts.length} products so far...`);

      if (batch.length < batchSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`✓ Found ${allProducts.length} products in database`);

  // Build map of product types and categories
  const productInfo = new Map();
  for (const p of allProducts) {
    productInfo.set(p.product_code, {
      type: p.type || '',
      category: p.category || ''
    });
  }

  // Fetch last order dates from company_product_history
  console.log('Fetching last order dates from company_product_history...');
  let allHistory: any[] = [];
  let hasMoreHistory = true;
  let historyOffset = 0;

  while (hasMoreHistory) {
    const { data: batch, error } = await supabase
      .from('company_product_history')
      .select('product_code, last_purchased_at')
      .range(historyOffset, historyOffset + batchSize - 1);

    if (error) {
      console.error('Error fetching history:', error);
      break;
    }

    if (batch && batch.length > 0) {
      allHistory = allHistory.concat(batch);
      historyOffset += batchSize;
      console.log(`  Fetched ${allHistory.length} history records so far...`);

      if (batch.length < batchSize) {
        hasMoreHistory = false;
      }
    } else {
      hasMoreHistory = false;
    }
  }

  console.log(`✓ Found ${allHistory.length} product history records`);

  // Build map of last order dates (keep the most recent for each product)
  const lastOrderDates = new Map<string, string>();
  for (const record of allHistory) {
    const code = record.product_code;
    const date = record.last_purchased_at;

    if (date) {
      const existing = lastOrderDates.get(code);
      if (!existing || date > existing) {
        lastOrderDates.set(code, date);
      }
    }
  }

  console.log(`Found ${lastOrderDates.size} products with order history`);

  // Read Gina distributor pricing
  console.log('Reading Gina distributor pricing...');
  const ginaCsvPath = path.join(process.cwd(), 'distributor price - Gina.csv');
  const ginaCsvContent = fs.readFileSync(ginaCsvPath, 'utf-8');
  const ginaCsvLines = ginaCsvContent.trim().split('\n');

  const ginaPrices = new Map<string, number>();
  // Skip first empty row and header row (start from line 2)
  for (let i = 2; i < ginaCsvLines.length; i++) {
    const line = ginaCsvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    if (parts.length >= 2) {
      const productCode = parts[0];
      const price = parseFloat(parts[1]) || 0;
      if (productCode && price > 0) {
        ginaPrices.set(productCode, price);
      }
    }
  }
  console.log(`Found ${ginaPrices.size} Gina prices`);

  // Read Uwe distributor pricing
  console.log('Reading Uwe distributor pricing...');
  const uweCsvPath = path.join(process.cwd(), 'Distributor price UWE.csv');
  const uweCsvContent = fs.readFileSync(uweCsvPath, 'utf-8');
  const uweCsvLines = uweCsvContent.trim().split('\n');

  const uwePrices = new Map<string, number>();
  // Skip first empty row and header row (start from line 2)
  for (let i = 2; i < uweCsvLines.length; i++) {
    const line = uweCsvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    if (parts.length >= 2) {
      const productCode = parts[0];
      const price = parseFloat(parts[1]) || 0;
      if (productCode && price > 0) {
        uwePrices.set(productCode, price);
      }
    }
  }
  console.log(`Found ${uwePrices.size} Uwe prices`);

  // Create enriched output
  const output = [];

  for (const product of stockProducts) {
    const info = productInfo.get(product.productCode);
    const lastOrderDate = lastOrderDates.get(product.productCode);
    const ginaPrice = ginaPrices.get(product.productCode);
    const uwePrice = uwePrices.get(product.productCode);

    // Calculate margin % = (Sales - Cost) / Sales × 100
    let marginPercent = '';
    if (product.salesPrice > 0 && product.costPrice > 0) {
      marginPercent = (((product.salesPrice - product.costPrice) / product.salesPrice) * 100).toFixed(1);
    }

    // Calculate Gina pricing % = (Gina Price / Sales Price) × 100
    let ginaPercent = '';
    if (ginaPrice && product.salesPrice > 0) {
      ginaPercent = ((ginaPrice / product.salesPrice) * 100).toFixed(1);
    }

    // Calculate Uwe pricing % = (Uwe Price / Sales Price) × 100
    let uwePercent = '';
    if (uwePrice && product.salesPrice > 0) {
      uwePercent = ((uwePrice / product.salesPrice) * 100).toFixed(1);
    }

    // Calculate new distributor price (60% minimum rule)
    let newDistributorPrice: any = '';
    let newDistributorPercent: any = '';
    let priceDifference: any = '';

    if (ginaPrice && product.salesPrice > 0) {
      const currentGinaPercent = parseFloat(ginaPercent);

      if (currentGinaPercent < 60) {
        // Raise to 60% of sales price
        newDistributorPrice = (product.salesPrice * 0.60).toFixed(2);
        newDistributorPercent = '60.0';
      } else {
        // Keep Gina's price as-is
        newDistributorPrice = ginaPrice.toFixed(2);
        newDistributorPercent = currentGinaPercent.toFixed(1);
      }

      // Calculate price difference (New - Gina)
      priceDifference = (parseFloat(newDistributorPrice) - ginaPrice).toFixed(2);
    }

    // Format last order date
    const lastOrderFormatted = lastOrderDate ? new Date(lastOrderDate).toLocaleDateString('en-GB') : '';

    output.push({
      'Product Code': product.productCode,
      'Description': product.description, // Keep original description
      'Sales Price': product.salesPrice,
      'Cost Price': product.costPrice,
      'Type': info?.type || '',
      'Category': info?.category || '',
      'Margin %': marginPercent,
      'Gina Pricing': ginaPrice || '',
      'Gina %': ginaPercent,
      'Uwe Pricing': uwePrice || '',
      'Uwe %': uwePercent,
      'New Distributor Price': newDistributorPrice,
      'New Distributor Price %': newDistributorPercent,
      'Price Difference': priceDifference,
      'Last Order Date': lastOrderFormatted
    });
  }

  // Create CSV with proper quoting
  const headers = [
    'Product Code',
    'Description',
    'Sales Price',
    'Cost Price',
    'Type',
    'Category',
    'Margin %',
    'Gina Pricing',
    'Gina %',
    'Uwe Pricing',
    'Uwe %',
    'New Distributor Price',
    'New Distributor Price %',
    'Price Difference',
    'Last Order Date'
  ];

  function escapeCSVField(field: any): string {
    const str = String(field);
    // Quote field if it contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  let csvOutput = headers.join(',') + '\n';
  for (const row of output) {
    csvOutput += headers.map(h => escapeCSVField(row[h])).join(',') + '\n';
  }

  // Write file
  const outputPath = path.join(process.cwd(), 'stock_list_enriched_v5.csv');
  fs.writeFileSync(outputPath, csvOutput);

  console.log(`\n✓ Created stock_list_enriched_v5.csv with ${output.length} products`);
  console.log(`- Products with type/category: ${output.filter(p => p.Type || p.Category).length}`);
  console.log(`- Products with Gina pricing: ${output.filter(p => p['Gina Pricing']).length}`);
  console.log(`- Products with Uwe pricing: ${output.filter(p => p['Uwe Pricing']).length}`);
  console.log(`- Products with new distributor pricing: ${output.filter(p => p['New Distributor Price']).length}`);
  console.log(`- Raised to 60% minimum: ${output.filter(p => p['New Distributor Price %'] === '60.0').length}`);
  console.log(`- Kept original Gina pricing (>= 60%): ${output.filter(p => p['New Distributor Price'] && p['New Distributor Price %'] !== '60.0').length}`);
  console.log(`- Products with last order date: ${output.filter(p => p['Last Order Date']).length}`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
