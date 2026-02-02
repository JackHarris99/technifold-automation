import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching products from database...');
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('product_code, description, price, type, category, active')
    .order('product_code');

  if (error) {
    console.error('Database error:', error);
    process.exit(1);
  }

  console.log(`Found ${dbProducts.length} products in database`);

  // Read Stock list CSV with cost prices
  console.log('Reading stock list with cost prices..csv...');
  const csvPath = path.join(process.cwd(), 'stock list with cost prices..csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvLines = csvContent.trim().split('\n');

  const csvProducts = new Map();
  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    // Parse CSV line carefully (handle commas in description)
    const parts = line.split(',');
    if (parts.length >= 7) {
      const productCode = parts[0].trim();
      const description = parts[1].trim();
      const inactive = parts[2].trim();
      const salesPrice = parseFloat(parts[3]) || 0;
      const costPrice = parseFloat(parts[6]) || 0; // Column G - Last Cost Price (Std)

      csvProducts.set(productCode, {
        description,
        salesPrice,
        costPrice,
        inactive: inactive === 'Y'
      });
    }
  }

  console.log(`Found ${csvProducts.size} products in CSV`);

  // Create comparison
  const comparison = [];
  const matched = new Set<string>();

  // Products in database
  for (const p of dbProducts) {
    matched.add(p.product_code);
    const csv = csvProducts.get(p.product_code);

    const currentPrice = p.price || 0;
    const sagePrice = csv ? csv.salesPrice : 0;
    const sageCost = csv ? csv.costPrice : 0;
    const priceDiff = csv ? (currentPrice - sagePrice).toFixed(2) : '';

    // Calculate profit margin % = ((Sales Price - Cost Price) / Sales Price) * 100
    let profitPercent = '';
    if (csv && sageCost > 0 && sagePrice > 0) {
      profitPercent = (((sagePrice - sageCost) / sagePrice) * 100).toFixed(1);
    }

    comparison.push({
      'Product Code': p.product_code,
      'Description': (p.description || '').replace(/,/g, ';'),
      'Current Site Price': currentPrice,
      'Sage Sales Price': csv ? sagePrice : '',
      'Sage Cost Price': csv ? sageCost : '',
      'Profit %': profitPercent,
      'Price Difference': priceDiff,
      'Type': p.type || '',
      'Category': p.category || '',
      'Active on Site': p.active ? 'Yes' : 'No',
      'Inactive in Sage': csv ? (csv.inactive ? 'Yes' : 'No') : '',
      'Status': csv ? 'In Both' : 'Only in Database'
    });
  }

  // Products only in CSV
  csvProducts.forEach((data, code) => {
    if (!matched.has(code)) {
      // Calculate profit margin % for CSV-only products
      let profitPercent = '';
      if (data.costPrice > 0 && data.salesPrice > 0) {
        profitPercent = (((data.salesPrice - data.costPrice) / data.salesPrice) * 100).toFixed(1);
      }

      comparison.push({
        'Product Code': code,
        'Description': data.description.replace(/,/g, ';'),
        'Current Site Price': '',
        'Sage Sales Price': data.salesPrice,
        'Sage Cost Price': data.costPrice,
        'Profit %': profitPercent,
        'Price Difference': '',
        'Type': '',
        'Category': '',
        'Active on Site': '',
        'Inactive in Sage': data.inactive ? 'Yes' : 'No',
        'Status': 'Only in CSV'
      });
    }
  });

  // Sort
  const statusOrder: Record<string, number> = { 'In Both': 0, 'Only in Database': 1, 'Only in CSV': 2 };
  comparison.sort((a, b) => {
    const statusDiff = statusOrder[a.Status] - statusOrder[b.Status];
    if (statusDiff !== 0) return statusDiff;
    return a['Product Code'].localeCompare(b['Product Code']);
  });

  // Create CSV
  const headers = Object.keys(comparison[0]);
  let csvOutput = headers.join(',') + '\n';

  for (const row of comparison) {
    csvOutput += headers.map(h => row[h]).join(',') + '\n';
  }

  // Write file
  const outputPath = path.join(process.cwd(), 'price_comparison_final.csv');
  fs.writeFileSync(outputPath, csvOutput);

  console.log(`\n✓ Created price_comparison.csv with ${comparison.length} products`);
  console.log(`- In Both: ${comparison.filter(p => p.Status === 'In Both').length}`);
  console.log(`- Only in Database: ${comparison.filter(p => p.Status === 'Only in Database').length}`);
  console.log(`- Only in CSV: ${comparison.filter(p => p.Status === 'Only in CSV').length}`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
