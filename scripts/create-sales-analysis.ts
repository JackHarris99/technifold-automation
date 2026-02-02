import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('Fetching ALL products from database...');

  // Fetch all products (bypass 1000 limit)
  let allProducts: any[] = [];
  let hasMore = true;
  let offset = 0;
  const batchSize = 1000;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('products')
      .select('product_code, description, category, type')
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

  const dbProducts = allProducts;
  console.log(`✓ Found ${dbProducts.length} total products in database`);

  // Read cost prices CSV
  console.log('Reading cost prices CSV...');
  const csvPath = path.join(process.cwd(), 'stock list with cost prices..csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvLines = csvContent.trim().split('\n');

  const csvProducts = new Map();
  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length >= 7) {
      const productCode = parts[0].trim();
      const description = parts[1].trim();
      const salesPrice = parseFloat(parts[3]) || 0;
      const costPrice = parseFloat(parts[6]) || 0;

      csvProducts.set(productCode, {
        description,
        salesPrice,
        costPrice
      });
    }
  }

  console.log('Fetching last sold dates from invoice items...');
  // Get last sold date for each product from invoice_items (with pagination)
  let allInvoiceItems: any[] = [];
  let hasMoreInvoices = true;
  let invoiceOffset = 0;
  const invoiceBatchSize = 1000;

  while (hasMoreInvoices) {
    const { data: batch, error } = await supabase
      .from('invoice_items')
      .select('product_code, invoices!inner(invoice_date)')
      .range(invoiceOffset, invoiceOffset + invoiceBatchSize - 1);

    if (error) {
      console.error('Error fetching invoice items:', error);
      break;
    }

    if (batch && batch.length > 0) {
      allInvoiceItems = allInvoiceItems.concat(batch);
      invoiceOffset += invoiceBatchSize;
      console.log(`  Fetched ${allInvoiceItems.length} invoice items so far...`);

      if (batch.length < invoiceBatchSize) {
        hasMoreInvoices = false;
      }
    } else {
      hasMoreInvoices = false;
    }
  }

  console.log(`✓ Found ${allInvoiceItems.length} total invoice items`);

  // Build map of last sold dates
  const lastSoldDates = new Map<string, string>();
  for (const item of allInvoiceItems) {
    const code = item.product_code;
    const date = (item as any).invoices?.invoice_date;

    if (date) {
      const existing = lastSoldDates.get(code);
      if (!existing || date > existing) {
        lastSoldDates.set(code, date);
      }
    }
  }

  console.log(`Found ${lastSoldDates.size} unique products with sales history`);

  // Create output data
  const output = [];
  const processedCodes = new Set<string>();

  // First: Products in database (with or without CSV data)
  for (const product of dbProducts) {
    processedCodes.add(product.product_code);
    const csv = csvProducts.get(product.product_code);
    const salesPrice = csv ? csv.salesPrice : 0;
    const costPrice = csv ? csv.costPrice : 0;

    // Calculate profit margin
    let profitMargin = '';
    if (costPrice > 0 && salesPrice > 0) {
      profitMargin = (((salesPrice - costPrice) / salesPrice) * 100).toFixed(1);
    }

    // Get last sold date
    const lastSold = lastSoldDates.get(product.product_code);
    const lastSoldFormatted = lastSold ? new Date(lastSold).toLocaleDateString('en-GB') : '';

    output.push({
      'Product Code': product.product_code,
      'Description': (product.description || '').replace(/,/g, ';'),
      'Category': product.category || '',
      'Type': product.type || '',
      'Sage Sales Price': salesPrice || '',
      'Sage Cost Price': costPrice || '',
      'Profit Margin %': profitMargin,
      'Last Sold Date': lastSoldFormatted,
      'Source': csv ? 'Both' : 'Database Only'
    });
  }

  // Second: Products ONLY in CSV (not in database)
  csvProducts.forEach((csvData, productCode) => {
    if (!processedCodes.has(productCode)) {
      const salesPrice = csvData.salesPrice;
      const costPrice = csvData.costPrice;

      // Calculate profit margin
      let profitMargin = '';
      if (costPrice > 0 && salesPrice > 0) {
        profitMargin = (((salesPrice - costPrice) / salesPrice) * 100).toFixed(1);
      }

      // Get last sold date
      const lastSold = lastSoldDates.get(productCode);
      const lastSoldFormatted = lastSold ? new Date(lastSold).toLocaleDateString('en-GB') : '';

      output.push({
        'Product Code': productCode,
        'Description': csvData.description || '',
        'Category': '',
        'Type': '',
        'Sage Sales Price': salesPrice || '',
        'Sage Cost Price': costPrice || '',
        'Profit Margin %': profitMargin,
        'Last Sold Date': lastSoldFormatted,
        'Source': 'Sage CSV Only'
      });
    }
  });

  // Create CSV
  const headers = [
    'Product Code',
    'Description',
    'Category',
    'Type',
    'Sage Sales Price',
    'Sage Cost Price',
    'Profit Margin %',
    'Last Sold Date',
    'Source'
  ];

  let csvOutput = headers.join(',') + '\n';
  for (const row of output) {
    csvOutput += headers.map(h => row[h]).join(',') + '\n';
  }

  // Write file
  const outputPath = path.join(process.cwd(), 'sales_analysis_full.csv');
  fs.writeFileSync(outputPath, csvOutput);

  console.log(`\n✓ Created sales_analysis_full.csv with ${output.length} products`);
  console.log(`- In Both: ${output.filter(p => p.Source === 'Both').length}`);
  console.log(`- Database Only: ${output.filter(p => p.Source === 'Database Only').length}`);
  console.log(`- Sage CSV Only: ${output.filter(p => p.Source === 'Sage CSV Only').length}`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
