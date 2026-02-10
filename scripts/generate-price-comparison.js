/**
 * Generate price comparison CSVs for Uwe and Gina
 * Compares old prices from Excel files to new 40% discount prices
 */

require('dotenv').config({ path: '.env.local' });
const XLSX = require('xlsx');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('📊 Generating price comparison CSVs...\n');

  // Read old price lists from Excel
  const uweFile = 'A Price list (UWE PRICES).xlsx';
  const ginaFile = 'B Price list (GINA PRICES).xlsx';

  const uweWorkbook = XLSX.readFile(uweFile);
  const ginaWorkbook = XLSX.readFile(ginaFile);

  const uweSheet = uweWorkbook.Sheets[uweWorkbook.SheetNames[0]];
  const ginaSheet = ginaWorkbook.Sheets[ginaWorkbook.SheetNames[0]];

  // Skip first row (empty) and use second row as headers
  const uweData = XLSX.utils.sheet_to_json(uweSheet, { range: 1 });
  const ginaData = XLSX.utils.sheet_to_json(ginaSheet, { range: 1 });

  console.log(`✓ Loaded ${uweData.length} products from Uwe's price list`);
  console.log(`✓ Loaded ${ginaData.length} products from Gina's price list\n`);

  // Get current active products from database - fetch ALL with pagination
  let products = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  console.log('Fetching active products from database...');

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('products')
      .select('product_code, description, type, category, price')
      .eq('active', true)
      .order('type', { ascending: true })
      .order('category', { ascending: true })
      .order('product_code', { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error('Error fetching products:', error);
      process.exit(1);
    }

    if (!batch || batch.length === 0) {
      hasMore = false;
    } else {
      products = products.concat(batch);
      offset += batchSize;
      if (batch.length < batchSize) {
        hasMore = false;
      }
    }
  }

  console.log(`✓ Loaded ${products.length} active products from database\n`);

  // Build old price maps - distributor prices (List Price) and customer prices (Sales Price)
  const uweOldDistPrices = new Map();
  const ginaOldDistPrices = new Map();
  const uweOldCustomerPrices = new Map();
  const ginaOldCustomerPrices = new Map();

  const codeKey = 'Product Code';
  const distPriceKey = 'List Price £';
  const customerPriceKey = 'Sales Price £';

  console.log(`Using columns: code="${codeKey}"`);
  console.log(`  Distributor price: "${distPriceKey}"`);
  console.log(`  Customer price: "${customerPriceKey}"\n`);

  uweData.forEach(row => {
    const code = String(row[codeKey]).trim();
    if (row[codeKey] && row[distPriceKey]) {
      uweOldDistPrices.set(code, parseFloat(row[distPriceKey]));
    }
    if (row[codeKey] && row[customerPriceKey]) {
      uweOldCustomerPrices.set(code, parseFloat(row[customerPriceKey]));
    }
  });

  ginaData.forEach(row => {
    const code = String(row[codeKey]).trim();
    if (row[codeKey] && row[distPriceKey]) {
      ginaOldDistPrices.set(code, parseFloat(row[distPriceKey]));
    }
    if (row[codeKey] && row[customerPriceKey]) {
      ginaOldCustomerPrices.set(code, parseFloat(row[customerPriceKey]));
    }
  });

  // Generate comparison data - ONLY products that exist in old price list
  function generateDistributorComparison(oldPrices, name) {
    const rows = [];
    let matchedCount = 0;

    products.forEach(product => {
      const oldPrice = oldPrices.get(product.product_code);
      const newPrice = product.price * 0.60; // 40% discount

      // ONLY include if product exists in old price list
      if (oldPrice !== undefined) {
        matchedCount++;
        const priceDiff = newPrice - oldPrice;
        const percentIncrease = oldPrice > 0 ? ((priceDiff / oldPrice) * 100) : 0;

        rows.push({
          'Product Code': product.product_code,
          'Description': product.description || '',
          'Type': product.type,
          'Category': product.category || '',
          [`${name} Old Distributor Price (£)`]: oldPrice.toFixed(2),
          'New Distributor Price (£)': newPrice.toFixed(2),
          'Price Change (£)': priceDiff.toFixed(2),
          'Price Change (%)': percentIncrease.toFixed(1)
        });
      }
      // Skip products not in old price list
    });

    console.log(`${name} Distributor: ${matchedCount} products (excluded new products)`);
    return rows;
  }

  function generateCustomerComparison(oldUwePrices, oldGinaPrices) {
    const rows = [];
    let matchedCount = 0;

    products.forEach(product => {
      const oldUwePrice = oldUwePrices.get(product.product_code);
      const oldGinaPrice = oldGinaPrices.get(product.product_code);
      const newPrice = product.price; // No discount - full customer price

      // ONLY include if product exists in old price list
      const hasOldPrice = oldUwePrice !== undefined || oldGinaPrice !== undefined;

      if (hasOldPrice) {
        matchedCount++;
        // Prefer Uwe price, fall back to Gina
        const oldPrice = oldUwePrice !== undefined ? oldUwePrice : oldGinaPrice;
        const priceDiff = newPrice - oldPrice;
        const percentIncrease = oldPrice > 0 ? ((priceDiff / oldPrice) * 100) : 0;

        rows.push({
          'Product Code': product.product_code,
          'Description': product.description || '',
          'Type': product.type,
          'Category': product.category || '',
          'Old Customer Price (£)': oldPrice.toFixed(2),
          'New Customer Price (£)': newPrice.toFixed(2),
          'Price Change (£)': priceDiff.toFixed(2),
          'Price Change (%)': percentIncrease.toFixed(1)
        });
      }
      // Skip products not in old price list
    });

    console.log(`Customer Pricing: ${matchedCount} products (excluded new products)`);
    return rows;
  }

  const uweDistComparison = generateDistributorComparison(uweOldDistPrices, 'Uwe');
  const ginaDistComparison = generateDistributorComparison(ginaOldDistPrices, 'Gina');
  const customerComparison = generateCustomerComparison(uweOldCustomerPrices, ginaOldCustomerPrices);

  // Write CSVs
  function writeCSV(filename, data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h];
          // Escape values with commas or quotes
          if (String(val).includes(',') || String(val).includes('"')) {
            return `"${String(val).replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      )
    ].join('\n');

    fs.writeFileSync(filename, csvContent);
    console.log(`✓ Created: ${filename}`);
  }

  console.log('\nWriting CSV files...');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '-');
  writeCSV(`price-comparison-uwe-distributor-${timestamp}.csv`, uweDistComparison);
  writeCSV(`price-comparison-gina-distributor-${timestamp}.csv`, ginaDistComparison);
  writeCSV(`price-comparison-customer-${timestamp}.csv`, customerComparison);

  console.log('\n✅ All 3 price comparison CSVs generated successfully!');
}

main().catch(console.error);
