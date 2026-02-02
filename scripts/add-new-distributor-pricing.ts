import * as fs from 'fs';
import * as path from 'path';

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

function escapeCSVField(field: any): string {
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

async function main() {
  console.log('Reading stock_list_enriched_v3.csv...');
  const csvPath = path.join(process.cwd(), 'stock_list_enriched_v3.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvLines = csvContent.trim().split('\n');

  // Parse header
  const headerParts = parseCSVLine(csvLines[0]);
  console.log('Headers:', headerParts);

  // Find column indices
  const colIndices: any = {};
  headerParts.forEach((header, index) => {
    colIndices[header] = index;
  });

  const output = [];

  // Process each row
  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);

    const productCode = parts[colIndices['Product Code']] || '';
    const description = parts[colIndices['Description']] || '';
    const salesPrice = parseFloat(parts[colIndices['Sales Price']]) || 0;
    const costPrice = parseFloat(parts[colIndices['Cost Price']]) || 0;
    const type = parts[colIndices['Type']] || '';
    const category = parts[colIndices['Category']] || '';
    const marginPercent = parts[colIndices['Margin %']] || '';
    const ginaPricing = parseFloat(parts[colIndices['Gina Pricing']]) || 0;
    const ginaPercent = parseFloat(parts[colIndices['Gina %']]) || 0;
    const uwePricing = parts[colIndices['Uwe Pricing']] || '';
    const uwePercent = parts[colIndices['Uwe %']] || '';
    const lastOrderDate = parts[colIndices['Last Order Date']] || '';

    // Calculate new distributor price
    let newDistributorPrice: any = '';
    let newDistributorPercent: any = '';

    if (ginaPricing > 0 && salesPrice > 0) {
      // Current Gina % is already calculated
      const currentGinaPercent = ginaPercent;

      if (currentGinaPercent < 60) {
        // Raise to 60% of sales price
        newDistributorPrice = (salesPrice * 0.60).toFixed(2);
        newDistributorPercent = '60.0';
      } else {
        // Keep Gina's price as-is
        newDistributorPrice = ginaPricing.toFixed(2);
        newDistributorPercent = currentGinaPercent.toFixed(1);
      }
    }

    output.push({
      'Product Code': productCode,
      'Description': description,
      'Sales Price': salesPrice,
      'Cost Price': costPrice,
      'Type': type,
      'Category': category,
      'Margin %': marginPercent,
      'Gina Pricing': ginaPricing || '',
      'Gina %': ginaPercent || '',
      'Uwe Pricing': uwePricing,
      'Uwe %': uwePercent,
      'New Distributor Price': newDistributorPrice,
      'New Distributor Price %': newDistributorPercent,
      'Last Order Date': lastOrderDate
    });
  }

  console.log(`Processed ${output.length} products`);

  // Create CSV
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
    'Last Order Date'
  ];

  let csvOutput = headers.join(',') + '\n';
  for (const row of output) {
    csvOutput += headers.map(h => escapeCSVField(row[h])).join(',') + '\n';
  }

  // Write file
  const outputPath = path.join(process.cwd(), 'stock_list_enriched_v4.csv');
  fs.writeFileSync(outputPath, csvOutput);

  // Calculate stats
  const withNewPricing = output.filter(p => p['New Distributor Price'] !== '');
  const raisedTo60 = output.filter(p => p['New Distributor Price %'] === '60.0');
  const keptOriginal = withNewPricing.length - raisedTo60.length;

  console.log(`\n✓ Created stock_list_enriched_v4.csv with ${output.length} products`);
  console.log(`- Products with new distributor pricing: ${withNewPricing.length}`);
  console.log(`- Raised to 60% minimum: ${raisedTo60.length}`);
  console.log(`- Kept original Gina pricing (already >= 60%): ${keptOriginal}`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch(console.error);
